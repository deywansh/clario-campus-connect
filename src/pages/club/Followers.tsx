import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, UserMinus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useClubs } from "@/hooks/useClubs";

interface Follower {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    year: number | null;
    branch: string | null;
    section: string | null;
  };
}

const ClubFollowers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs } = useClubs();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const myClub = clubs.find(c => c.user_id === user?.id);

  useEffect(() => {
    if (myClub) {
      fetchFollowers();
    }
  }, [myClub]);

  const fetchFollowers = async () => {
    if (!myClub) return;

    try {
      const { data, error } = await supabase
        .from("club_followers")
        .select(`
          id,
          user_id,
          profiles!club_followers_user_id_fkey (
            full_name,
            avatar_url,
            year,
            branch,
            section
          )
        `)
        .eq("club_id", myClub.id);

      if (error) throw error;
      setFollowers(data as any || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast.error("Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    setRemovingId(followerId);
    try {
      const { error } = await supabase
        .from("club_followers")
        .delete()
        .eq("id", followerId);

      if (error) throw error;
      
      setFollowers(followers.filter(f => f.id !== followerId));
      toast.success("Follower removed");
    } catch (error) {
      console.error("Error removing follower:", error);
      toast.error("Failed to remove follower");
    } finally {
      setRemovingId(null);
    }
  };

  if (!myClub) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No club found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/club/dashboard")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Followers</h1>
                <p className="text-sm text-muted-foreground">{myClub.name}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : followers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No followers yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{followers.length} Follower{followers.length !== 1 ? 's' : ''}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {followers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={follower.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {follower.profiles.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{follower.profiles.full_name}</p>
                      {(follower.profiles.year || follower.profiles.branch) && (
                        <p className="text-sm text-muted-foreground">
                          {follower.profiles.year && `Year ${follower.profiles.year}`}
                          {follower.profiles.branch && ` • ${follower.profiles.branch}`}
                          {follower.profiles.section && ` - ${follower.profiles.section}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFollower(follower.id)}
                    disabled={removingId === follower.id}
                    className="rounded-full text-destructive hover:text-destructive"
                  >
                    {removingId === follower.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClubFollowers;
