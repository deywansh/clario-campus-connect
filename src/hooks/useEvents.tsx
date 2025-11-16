import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  created_at: string;
  user_id: string;
  club_id: string | null;
  author_name: string;
  author_avatar: string | null;
}

interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: "going" | "maybe" | "not_going";
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;

      // Fetch profile data for each event
      const eventsWithProfiles = await Promise.all(
        (data || []).map(async (event) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", event.user_id)
            .single();

          return {
            ...event,
            author_name: profile?.full_name || "Unknown",
            author_avatar: profile?.avatar_url || null,
          };
        })
      );

      setEvents(eventsWithProfiles);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    title: string,
    description: string,
    location: string,
    eventDate: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("events").insert([
      {
        title,
        description,
        location,
        event_date: eventDate,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error creating event:", error);
      return { error };
    }

    return { error: null };
  };

  const rsvpToEvent = async (eventId: string, status: "going" | "maybe" | "not_going") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("event_rsvps")
      .upsert([
        {
          event_id: eventId,
          user_id: user.id,
          status,
        },
      ]);

    if (error) {
      console.error("Error RSVPing to event:", error);
      return { error };
    }

    return { error: null };
  };

  return { events, loading, createEvent, rsvpToEvent };
};
