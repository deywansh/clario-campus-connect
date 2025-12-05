import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  year: number | null;
  branch: string | null;
  section: string | null;
  email: string | null;
  role: 'student' | 'faculty' | 'club';
  last_seen: string | null;
}

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setRoles([]);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const fetchProfile = async () => {
      try {
        // Fetch profile with role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            bio,
            role,
            year,
            branch,
            section,
            last_seen
          `)
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Set roles array from profile.role for backward compatibility
        setRoles(profileData.role ? [profileData.role] : []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const updateProfile = async (updates: Partial<Omit<Profile, 'role'>>) => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { error };
    }

    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    return { error: null };
  };

  // Loading is true if either auth is loading OR profile is loading
  const loading = authLoading || profileLoading;

  return { profile, roles, loading, updateProfile };
};
