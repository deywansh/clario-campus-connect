import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Chat {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chats")
        .select(`
          *,
          chat_members!inner(user_id)
        `)
        .eq("chat_members.user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (name: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .insert([{ name, description, created_by: user.id }])
      .select()
      .single();

    if (chatError) {
      console.error("Error creating chat:", chatError);
      return { error: chatError };
    }

    // Add creator as member
    const { error: memberError } = await supabase
      .from("chat_members")
      .insert([{ chat_id: chatData.id, user_id: user.id }]);

    if (memberError) {
      console.error("Error adding creator as member:", memberError);
      return { error: memberError };
    }

    await fetchChats();
    return { error: null };
  };

  return { chats, loading, createChat, refetch: fetchChats };
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

    // Subscribe to realtime updates
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

      // Fetch profile data for each message
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
      .insert([{ chat_id: chatId, user_id: user.id, content }]);

    if (error) {
      console.error("Error sending message:", error);
      return { error };
    }

    return { error: null };
  };

  return { messages, loading, sendMessage };
};
