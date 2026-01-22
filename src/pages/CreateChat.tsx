import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Users, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
}

const CreateChat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom" as "batch" | "section" | "subject" | "club" | "custom",
    adminOnly: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const setUserSelected = (userId: string, selected: boolean) => {
    setSelectedUsers((prev) => {
      const has = prev.includes(userId);
      if (selected && !has) return [...prev, userId];
      if (!selected && has) return prev.filter((id) => id !== userId);
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create chat
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .insert([{
          name: formData.name,
          description: formData.description,
          created_by: user.id,
          admin_only: formData.adminOnly,
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add creator and selected members (avoid duplicates)
      const uniqueMembers = [...new Set([user.id, ...selectedUsers])];
      const { error: memberError } = await supabase
        .from("chat_members")
        .insert(uniqueMembers.map((userId) => ({ chat_id: chat.id, user_id: userId })));

      if (memberError) throw memberError;

      toast.success("Chat created successfully");
      navigate(`/chats/${chat.id}`);
    } catch (error: any) {
      console.error("Error creating chat:", error);
      toast.error(error?.message || "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Chat Room</h1>
                <p className="text-sm text-muted-foreground">Start a new group conversation</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chat Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CSE 2024 Batch"
                required
                className="rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Chat Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Batch Chat</SelectItem>
                  <SelectItem value="section">Section Chat</SelectItem>
                  <SelectItem value="subject">Subject Chat</SelectItem>
                  <SelectItem value="club">Club Chat</SelectItem>
                  <SelectItem value="custom">Custom Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description for this chat room..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="adminOnly"
                checked={formData.adminOnly}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    // Radix can emit 'indeterminate' — ensure state remains a strict boolean
                    adminOnly: checked === true,
                  }))
                }
              />
              <Label htmlFor="adminOnly" className="cursor-pointer text-sm">
                Admin-only messages (only you can send messages)
              </Label>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Add Members (Optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No users found
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-xl cursor-pointer smooth-transition"
                    onClick={() => toggleUser(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={(checked) => setUserSelected(user.id, checked === true)}
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-full"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Chat
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChat;
