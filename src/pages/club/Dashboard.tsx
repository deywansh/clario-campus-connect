import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Calendar, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useClubs } from "@/hooks/useClubs";
import { useMemo } from "react";

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs } = useClubs();

  const myClub = useMemo(() => 
    clubs.find(c => c.user_id === user?.id),
    [clubs, user]
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Club Dashboard</h1>
              <p className="text-sm text-muted-foreground">{myClub?.name || 'Manage your club'}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/club/create-announcement')}
            className="h-auto py-6 rounded-2xl bg-primary hover:bg-primary/90"
          >
            <div className="flex flex-col items-center gap-2">
              <PlusCircle className="w-8 h-8" />
              <span className="font-semibold">Create Announcement</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/club/create-event')}
            className="h-auto py-6 rounded-2xl bg-accent hover:bg-accent/90"
          >
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-8 h-8" />
              <span className="font-semibold">Create Event</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/club/edit-profile')}
            variant="outline"
            className="h-auto py-6 rounded-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <Settings className="w-8 h-8" />
              <span className="font-semibold">Edit Profile</span>
            </div>
          </Button>
        </div>

        {/* Club Info */}
        {myClub && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {myClub.avatar_url ? (
                    <img src={myClub.avatar_url} alt={myClub.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle>{myClub.name}</CardTitle>
                  <CardDescription>{myClub.description || 'No description'}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Followers</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Announcements</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Events</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
