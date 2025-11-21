import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import BottomNav from "@/components/BottomNav";
import { useClubs } from "@/hooks/useClubs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Clubs = () => {
  const { clubs, loading, followClub, unfollowClub } = useClubs();
  const { user } = useAuth();
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (clubId: string, clubName: string) => {
    if (!user) {
      toast.error("Please log in to follow clubs");
      return;
    }

    const isFollowing = followingStates[clubId];
    
    if (isFollowing) {
      const { error } = await unfollowClub(clubId);
      if (error) {
        toast.error("Failed to unfollow club");
      } else {
        setFollowingStates(prev => ({ ...prev, [clubId]: false }));
        toast.success(`Unfollowed ${clubName}`);
      }
    } else {
      const { error } = await followClub(clubId);
      if (error) {
        toast.error("Failed to follow club");
      } else {
        setFollowingStates(prev => ({ ...prev, [clubId]: true }));
        toast.success(`Following ${clubName}`);
      }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Clubs & Societies</h1>
              <p className="text-sm text-muted-foreground">Discover and join campus clubs</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Clubs List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No clubs available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clubs.map((club) => (
              <Card key={club.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        {club.avatar_url ? (
                          <img 
                            src={club.avatar_url} 
                            alt={club.name} 
                            className="w-12 h-12 rounded-full object-cover" 
                          />
                        ) : (
                          <Users className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {club.description || "No description available"}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={followingStates[club.id] ? "default" : "outline"}
                      onClick={() => handleFollow(club.id, club.name)}
                      className="rounded-full"
                    >
                      <Heart className={`w-4 h-4 mr-1 ${followingStates[club.id] ? 'fill-current' : ''}`} />
                      {followingStates[club.id] ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Clubs;
