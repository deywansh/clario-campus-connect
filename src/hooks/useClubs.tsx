import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Club {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("clubs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clubs",
        },
        () => {
          fetchClubs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const followClub = async (clubId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("club_followers")
      .insert([{ club_id: clubId, user_id: user.id }]);

    if (error) {
      console.error("Error following club:", error);
      return { error };
    }

    return { error: null };
  };

  const unfollowClub = async (clubId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("club_followers")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error unfollowing club:", error);
      return { error };
    }

    return { error: null };
  };

  const getFollowedClubs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("club_followers")
      .select("club_id, clubs(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching followed clubs:", error);
      return [];
    }

    return data?.map(item => item.clubs).filter(Boolean) || [];
  };

  return { clubs, loading, followClub, unfollowClub, getFollowedClubs };
};
