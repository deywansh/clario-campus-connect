import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatWithMeta {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_important: boolean;
  is_muted: boolean;
  muted_until: string | null;
  is_archived: boolean;
  last_message_text: string | null;
  last_message_sender_id: string | null;
  last_message_sender_name: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  image_url: string | null;
}

export const useChats = () => {
  const [chats, setChats] = useState<ChatWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get chat memberships with chat data
      const { data: memberships, error } = await supabase
        .from("chat_members")
        .select(`
          chat_id,
          is_important,
          is_muted,
          muted_until,
          is_archived,
          last_read_at,
          chats (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      if (!memberships || memberships.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      const chatIds = memberships.map(m => m.chat_id);

      // Get last message for each chat - fetch latest messages
      const { data: allMessages } = await supabase
        .from("messages")
        .select("id, chat_id, user_id, content, created_at, image_url")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false });

      // Group by chat_id, take first (latest)
      const lastMessageMap: Record<string, typeof allMessages extends (infer T)[] | null ? T : never> = {};
      if (allMessages) {
        for (const msg of allMessages) {
          if (!lastMessageMap[msg.chat_id]) {
            lastMessageMap[msg.chat_id] = msg;
          }
        }
      }

      // Get sender names for last messages
      const senderIds = [...new Set(Object.values(lastMessageMap).map(m => m.user_id))];
      const senderNameMap: Record<string, string> = {};
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);
        if (profiles) {
          for (const p of profiles) {
            senderNameMap[p.id] = p.full_name;
          }
        }
      }

      // Calculate unread counts
      const enrichedChats: ChatWithMeta[] = memberships
        .filter(m => m.chats != null)
        .map(m => {
        const chat = m.chats as any;
        const lastMsg = lastMessageMap[m.chat_id] || null;
        const lastReadAt = m.last_read_at;

        // Count unread: messages after last_read_at that aren't from the current user
        let unreadCount = 0;
        if (allMessages) {
          for (const msg of allMessages) {
            if (msg.chat_id === m.chat_id && msg.user_id !== user.id) {
              if (!lastReadAt || new Date(msg.created_at) > new Date(lastReadAt)) {
                unreadCount++;
              }
            }
          }
        }

        return {
          id: chat.id,
          name: chat.name,
          description: chat.description,
          created_by: chat.created_by,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          is_important: m.is_important,
          is_muted: m.is_muted,
          muted_until: m.muted_until,
          is_archived: m.is_archived,
          last_message_text: lastMsg ? (lastMsg.image_url && !lastMsg.content ? "📷 Photo" : lastMsg.content) : null,
          last_message_sender_id: lastMsg?.user_id || null,
          last_message_sender_name: lastMsg ? (senderNameMap[lastMsg.user_id] || "Unknown") : null,
          last_message_at: lastMsg?.created_at || null,
          unread_count: unreadCount,
        };
      });

      // Sort: important first, then by last message time
      enrichedChats.sort((a, b) => {
        if (a.is_important && !b.is_important) return -1;
        if (!a.is_important && b.is_important) return 1;
        const aTime = a.last_message_at || a.created_at;
        const bTime = b.last_message_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(enrichedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = async (name: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .insert([{ name, description, created_by: user.id }])
      .select()
      .single();

    if (chatError) return { error: chatError };

    const { error: memberError } = await supabase
      .from("chat_members")
      .insert([{ chat_id: chatData.id, user_id: user.id }]);

    if (memberError) return { error: memberError };

    await fetchChats();
    return { error: null };
  };

  const toggleImportant = async (chatId: string, isImportant: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_members")
      .update({ is_important: !isImportant })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_important: !isImportant } : c));
  };

  const toggleArchive = async (chatId: string, isArchived: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_members")
      .update({ is_archived: !isArchived })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    await fetchChats();
  };

  const setMute = async (chatId: string, mutedUntil: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_members")
      .update({ is_muted: true, muted_until: mutedUntil })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    await fetchChats();
  };

  const unmute = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_members")
      .update({ is_muted: false, muted_until: null })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    await fetchChats();
  };

  const markRead = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);
  };

  const deleteChat = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    // Delete all messages first
    await supabase.from("messages").delete().eq("chat_id", chatId);
    // Delete all members
    await supabase.from("chat_members").delete().eq("chat_id", chatId);
    // Delete the chat itself
    const { error } = await supabase.from("chats").delete().eq("id", chatId);
    if (error) return { error };

    await fetchChats();
    return { error: null };
  };

  const leaveChat = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("chat_members")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    if (error) return { error };
    await fetchChats();
    return { error: null };
  };

  return { chats, loading, createChat, refetch: fetchChats, toggleImportant, toggleArchive, setMute, unmute, markRead, deleteChat, leaveChat };
};

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    fetchMessages();

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", message.user_id)
            .single();

          return {
            ...message,
            author_name: profile?.full_name || "Unknown",
            author_avatar: profile?.avatar_url || null,
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, imageUrl: string = '') => {
    if (!chatId) return { error: new Error("No chat selected") };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("messages")
      .insert([{ chat_id: chatId, user_id: user.id, content, image_url: imageUrl || null }]);

    if (error) return { error };
    return { error: null };
  };

  return { messages, loading, sendMessage };
};
