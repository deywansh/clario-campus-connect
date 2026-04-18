import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Use local scope to avoid 403 when server session is already gone
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error && error.name !== "AuthSessionMissingError") {
        console.error("Error signing out:", error);
      }
    } catch (err) {
      console.error("Sign out exception:", err);
    }
    // Always clear local state regardless of server response
    setSession(null);
    setUser(null);
    return { error: null };
  };

  return { user, session, loading, signOut };
};
