import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Image as ImageIcon, MoreVertical, Users, LogOut, Trash2 } from "lucide-react";
import { useMessages, useChats } from "@/hooks/useChats";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatMember {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
}

const ChatRoom = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { messages, loading, sendMessage } = useMessages(chatId || "");
  const { deleteChat, leaveChat } = useChats();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [chatCreatedBy, setChatCreatedBy] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isCreator = chatCreatedBy === user?.id;

  // Fetch chat info
  useEffect(() => {
    if (!chatId) return;
    supabase
      .from("chats")
      .select("created_by")
      .eq("id", chatId)
      .single()
      .then(({ data }) => {
        if (data) setChatCreatedBy(data.created_by);
      });
  }, [chatId]);

  // Mark chat as read & auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (chatId && user) {
      supabase
        .from("chat_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
        .then();
    }
  }, [messages, chatId, user]);

  // Presence & typing indicators
  useEffect(() => {
    if (!chatId || !user) return;

    const channel = supabase.channel(`chat-${chatId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = Object.values(state).flat().map((p: any) => p.user_id);
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((p: any) => p.user_id);
        setOnlineUsers(prev => [...new Set([...prev, ...newUsers])]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsers = leftPresences.map((p: any) => p.user_id);
        setOnlineUsers(prev => prev.filter(id => !leftUsers.includes(id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    const typingChannel = supabase.channel(`typing-${chatId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setTypingUsers(prev => {
            if (!prev.includes(payload.user_name)) {
              return [...prev, payload.user_name];
            }
            return prev;
          });
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(name => name !== payload.user_name));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [chatId, user]);

  // Update last seen
  useEffect(() => {
    if (!user) return;
    const updateLastSeen = async () => {
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleTyping = () => {
    if (!chatId || !user || !profile) return;

    const typingChannel = supabase.channel(`typing-${chatId}`);
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, user_name: profile.full_name }
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      await sendMessage('', publicUrl);
      toast.success('Image sent');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    setSending(true);
    const { error } = await sendMessage(newMessage.trim(), '');

    if (!error) {
      setNewMessage("");
    }

    setSending(false);
  };

  const fetchMembers = async () => {
    if (!chatId) return;
    setMembersLoading(true);
    try {
      const { data: memberRows } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", chatId);

      if (memberRows && memberRows.length > 0) {
        const userIds = memberRows.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .in("id", userIds);

        if (profiles) {
          setMembers(profiles.map(p => ({
            user_id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            role: p.role,
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleViewMembers = () => {
    setShowMenu(false);
    setShowMembers(true);
    fetchMembers();
  };

  const handleDeleteChat = async () => {
    if (!chatId) return;
    setActionLoading(true);
    const result = await deleteChat(chatId);
    setActionLoading(false);
    setDeleteDialogOpen(false);
    if (result?.error) {
      toast.error("Failed to delete group");
    } else {
      toast.success("Group deleted");
      navigate("/chats");
    }
  };

  const handleLeaveChat = async () => {
    if (!chatId) return;
    setActionLoading(true);
    const result = await leaveChat(chatId);
    setActionLoading(false);
    setLeaveDialogOpen(false);
    if (result?.error) {
      toast.error("Failed to leave group");
    } else {
      toast.success("You left the group");
      navigate("/chats");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/chats")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Chat Room</h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowMenu(true)}
                className="rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.user_id === user?.id;
              const isOnline = onlineUsers.includes(message.user_id);
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.author_avatar || undefined} />
                      <AvatarFallback>{message.author_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className={`flex flex-col ${isOwnMessage ? "items-end" : ""}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium">{message.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "p")}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="attachment"
                          className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90"
                          onClick={() => window.open(message.image_url!, '_blank')}
                        />
                      )}
                      {message.content && <p className="text-sm">{message.content}</p>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8" />
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {typingUsers[0]} is typing...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 rounded-full"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !newMessage.trim()}
              className="rounded-full bg-primary hover:bg-primary/90 shrink-0"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Chat Menu Sheet */}
      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-left">Chat Options</SheetTitle>
          </SheetHeader>
          <div className="space-y-1 mt-4">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
              onClick={handleViewMembers}
            >
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">👥 View Members</span>
            </button>

            {!isCreator && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => {
                  setShowMenu(false);
                  setLeaveDialogOpen(true);
                }}
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">🚪 Leave Group</span>
              </button>
            )}

            {isCreator && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                onClick={() => {
                  setShowMenu(false);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-5 h-5 text-destructive" />
                <span className="text-sm text-destructive">🗑️ Delete Group</span>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Members Sheet */}
      <Sheet open={showMembers} onOpenChange={setShowMembers}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">Group Members</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-4">
            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No members found</p>
            ) : (
              members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/5">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.user_id === chatCreatedBy ? "Admin" : member.role || "Member"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This will permanently delete all messages and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group? You will no longer receive messages from this chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveChat} disabled={actionLoading}>
              {actionLoading ? "Leaving..." : "Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatRoom;
