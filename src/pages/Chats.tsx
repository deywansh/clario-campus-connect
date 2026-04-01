import { useState, useRef } from "react";
import { MessageCircle, Plus, Users, Star, BellOff, Archive, X, Clock, Trash2, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isYesterday, addHours, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

type FilterTab = "all" | "important" | "unread" | "groups";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "important", label: "Important" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
];

const Chats = () => {
  const { chats, loading, toggleImportant, toggleArchive, setMute, unmute, deleteChat, leaveChat } = useChats();
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [contextChat, setContextChat] = useState<string | null>(null);
  const [showMuteOptions, setShowMuteOptions] = useState(false);
  const [deleteDialogChat, setDeleteDialogChat] = useState<string | null>(null);
  const [leaveDialogChat, setLeaveDialogChat] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  const canCreateChat = profile?.role === "faculty" || profile?.role === "club";

  // Separate archived and active chats
  const archivedChats = chats.filter((c) => c.is_archived);
  const activeChats = chats.filter((c) => !c.is_archived);

  // Apply filters
  const filteredChats = activeChats.filter((chat) => {
    switch (activeFilter) {
      case "important":
        return chat.is_important;
      case "unread":
        return chat.unread_count > 0;
      case "groups":
        return true;
      default:
        return true;
    }
  });

  const contextChatData = chats.find((c) => c.id === contextChat);
  const isCreator = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    return chat?.created_by === user?.id;
  };

  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getLastMessagePreview = (chat: (typeof chats)[0]) => {
    if (!chat.last_message_text) return "No messages yet";
    const prefix = chat.last_message_sender_id === user?.id ? "You: " : "";
    return `${prefix}${chat.last_message_text}`;
  };

  const handleLongPressStart = (chatId: string) => {
    longPressTimer.current = setTimeout(() => {
      setContextChat(chatId);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleMute = (chatId: string, duration: "8h" | "1w" | "forever") => {
    let mutedUntil: string | null = null;
    if (duration === "8h") mutedUntil = addHours(new Date(), 8).toISOString();
    else if (duration === "1w") mutedUntil = addDays(new Date(), 7).toISOString();

    setMute(chatId, mutedUntil);
    setShowMuteOptions(false);
    setContextChat(null);
  };

  const handleDeleteChat = async () => {
    if (!deleteDialogChat) return;
    setActionLoading(true);
    const { error } = await deleteChat(deleteDialogChat) || {};
    setActionLoading(false);
    setDeleteDialogChat(null);
    if (error) {
      toast.error("Failed to delete group");
    } else {
      toast.success("Group deleted");
    }
  };

  const handleLeaveChat = async () => {
    if (!leaveDialogChat) return;
    setActionLoading(true);
    const { error } = await leaveChat(leaveDialogChat) || {};
    setActionLoading(false);
    setLeaveDialogChat(null);
    if (error) {
      toast.error("Failed to leave group");
    } else {
      toast.success("You left the group");
    }
  };

  const emptyMessages: Record<FilterTab, string> = {
    all: "No chats yet. Create or join a group chat to start connecting.",
    important: "No important chats yet. Long press a chat to mark it as important.",
    unread: "You're all caught up!",
    groups: "No groups yet.",
  };

  const renderChatTile = (chat: (typeof chats)[0]) => (
    <div
      key={chat.id}
      className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border/50 cursor-pointer hover:bg-accent/5 transition-colors active:bg-accent/10"
      onClick={() => navigate(`/chats/${chat.id}`)}
      onMouseDown={() => handleLongPressStart(chat.id)}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={() => handleLongPressStart(chat.id)}
      onTouchEnd={handleLongPressEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextChat(chat.id);
      }}
    >
      {/* Avatar with importance indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        {chat.is_important && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-card">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Middle section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[15px] text-foreground truncate">{chat.name}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {formatTimestamp(chat.last_message_at || chat.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-[13px] truncate ${
              chat.last_message_text ? "text-muted-foreground" : "text-muted-foreground/60 italic"
            }`}
          >
            {getLastMessagePreview(chat)}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {chat.is_muted && <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
            {chat.unread_count > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[11px] font-bold text-primary-foreground">
                  {chat.unread_count > 99 ? "99+" : chat.unread_count}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chats</h1>
              <p className="text-muted-foreground text-sm">Connect with your campus community</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {canCreateChat && (
                <Button
                  size="icon"
                  className="rounded-full bg-primary hover:bg-primary/90"
                  title="Create new chat"
                  onClick={() => navigate("/create-chat")}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chats list */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              {activeFilter === "important" ? (
                <Star className="w-8 h-8 text-primary" />
              ) : activeFilter === "unread" ? (
                <MessageCircle className="w-8 h-8 text-primary" />
              ) : (
                <Users className="w-8 h-8 text-primary" />
              )}
            </div>
            <p className="text-muted-foreground text-sm">{emptyMessages[activeFilter]}</p>
          </div>
        ) : (
          <div className="space-y-2">{filteredChats.map(renderChatTile)}</div>
        )}

        {/* Archived section */}
        {archivedChats.length > 0 && !showArchived && (
          <button
            onClick={() => setShowArchived(true)}
            className="w-full mt-6 py-3 rounded-xl border border-border/50 bg-card text-sm text-muted-foreground flex items-center justify-center gap-2 hover:bg-accent/5 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archived chats ({archivedChats.length})
          </button>
        )}

        {showArchived && archivedChats.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between px-1 mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archived Chats
              </h3>
              <button
                onClick={() => setShowArchived(false)}
                className="text-xs text-primary hover:underline"
              >
                Hide
              </button>
            </div>
            {archivedChats.map(renderChatTile)}
          </div>
        )}
      </div>

      {/* Context Menu Sheet */}
      <Sheet open={!!contextChat} onOpenChange={(open) => {
        if (!open) {
          setContextChat(null);
          setShowMuteOptions(false);
        }
      }}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-left">{contextChatData?.name}</SheetTitle>
          </SheetHeader>

          {!showMuteOptions ? (
            <div className="space-y-1 mt-4">
              {/* Important toggle */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => {
                  if (contextChatData) {
                    toggleImportant(contextChatData.id, contextChatData.is_important);
                    setContextChat(null);
                  }
                }}
              >
                <Star
                  className={`w-5 h-5 ${
                    contextChatData?.is_important ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm">
                  {contextChatData?.is_important ? "Remove from Important" : "Mark as Important"}
                </span>
              </button>

              {/* Mute toggle */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => {
                  if (contextChatData?.is_muted) {
                    unmute(contextChatData.id);
                    setContextChat(null);
                  } else {
                    setShowMuteOptions(true);
                  }
                }}
              >
                <BellOff className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  {contextChatData?.is_muted ? "Unmute" : "Mute notifications"}
                </span>
              </button>

              {/* Archive toggle */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => {
                  if (contextChatData) {
                    toggleArchive(contextChatData.id, contextChatData.is_archived);
                    setContextChat(null);
                  }
                }}
              >
                <Archive className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  {contextChatData?.is_archived ? "Unarchive" : "Archive"}
                </span>
              </button>

              {/* Leave Group (non-creators only) */}
              {contextChat && !isCreator(contextChat) && (
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                  onClick={() => {
                    setLeaveDialogChat(contextChat);
                    setContextChat(null);
                  }}
                >
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">🚪 Leave Group</span>
                </button>
              )}

              {/* Delete Group (creators only) */}
              {contextChat && isCreator(contextChat) && (
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                  onClick={() => {
                    setDeleteDialogChat(contextChat);
                    setContextChat(null);
                  }}
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-destructive">🗑️ Delete Group</span>
                </button>
              )}

              {/* Cancel */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => setContextChat(null)}
              >
                <X className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Cancel</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1 mt-4">
              <p className="text-sm text-muted-foreground px-4 mb-2">Mute for:</p>
              {[
                { label: "8 hours", key: "8h" as const, icon: Clock },
                { label: "1 week", key: "1w" as const, icon: Clock },
                { label: "Always", key: "forever" as const, icon: BellOff },
              ].map((option) => (
                <button
                  key={option.key}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                  onClick={() => contextChat && handleMute(contextChat, option.key)}
                >
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                onClick={() => setShowMuteOptions(false)}
              >
                <X className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Back</span>
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogChat} onOpenChange={(open) => !open && setDeleteDialogChat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This will permanently delete all messages and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogChat(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={!!leaveDialogChat} onOpenChange={(open) => !open && setLeaveDialogChat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group? You will no longer receive messages from this chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLeaveDialogChat(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveChat} disabled={actionLoading}>
              {actionLoading ? "Leaving..." : "Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chats;
