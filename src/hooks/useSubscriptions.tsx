import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Subscription {
  id: string;
  source_id: string;
  source_type: "faculty" | "club";
}

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, source_id, source_type")
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Cast the data to ensure proper typing
      const typedData = (data || []).map((item) => ({
        id: item.id,
        source_id: item.source_id,
        source_type: item.source_type as "faculty" | "club",
      }));
      setSubscriptions(typedData);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (sourceId: string, sourceType: "faculty" | "club") => {
    return subscriptions.some(
      (s) => s.source_id === sourceId && s.source_type === sourceType
    );
  };

  const getSubscribedIds = (sourceType?: "faculty" | "club") => {
    if (sourceType) {
      return subscriptions
        .filter((s) => s.source_type === sourceType)
        .map((s) => s.source_id);
    }
    return subscriptions.map((s) => s.source_id);
  };

  return {
    subscriptions,
    loading,
    isSubscribed,
    getSubscribedIds,
    refetch: fetchSubscriptions,
  };
};
