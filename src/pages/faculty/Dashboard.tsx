import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { announcements } = useAnnouncements();
  const { events } = useEvents();
  const { user } = useAuth();

  const myAnnouncements = useMemo(() => 
    announcements.filter(a => a.user_id === user?.id),
    [announcements, user]
  );

  const myEvents = useMemo(() => 
    events.filter(e => e.user_id === user?.id),
    [events, user]
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage announcements and events</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/faculty/create-announcement')}
            className="h-auto py-6 rounded-2xl bg-primary hover:bg-primary/90"
          >
            <div className="flex flex-col items-center gap-2">
              <PlusCircle className="w-8 h-8" />
              <span className="font-semibold">Create Announcement</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/faculty/create-event')}
            className="h-auto py-6 rounded-2xl bg-accent hover:bg-accent/90"
          >
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-8 h-8" />
              <span className="font-semibold">Create Event</span>
            </div>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Announcements</CardDescription>
              <CardTitle className="text-3xl">{myAnnouncements.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Events</CardDescription>
              <CardTitle className="text-3xl">{myEvents.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Engagement</CardDescription>
              <CardTitle className="text-3xl">High</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Your latest announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {myAnnouncements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No announcements yet</p>
            ) : (
              <div className="space-y-4">
                {myAnnouncements.slice(0, 5).map(announcement => (
                  <div key={announcement.id} className="flex justify-between items-start p-4 rounded-lg border">
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{announcement.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;
