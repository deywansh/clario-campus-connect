import { Bell, Calendar, MessageCircle, Users, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock notifications - in real app, these would come from backend
const notifications = [
  {
    id: "1",
    type: "announcement",
    icon: Bell,
    title: "New Announcement",
    message: "Important: Campus closed tomorrow for maintenance",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "event",
    icon: Calendar,
    title: "Event Reminder",
    message: "Tech Fest 2024 starts in 2 days",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "chat",
    icon: MessageCircle,
    title: "New Message",
    message: "You have 3 new messages in CS Batch 2024",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "club",
    icon: Users,
    title: "Club Update",
    message: "Coding Club posted a new announcement",
    time: "2 days ago",
    read: true,
  },
];

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/home")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-sm text-muted-foreground">Stay updated with campus news</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`glass-card rounded-xl p-4 smooth-transition hover:glow-border cursor-pointer ${
                  !notification.read ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'announcement' ? 'bg-primary/20' :
                    notification.type === 'event' ? 'bg-accent/20' :
                    notification.type === 'chat' ? 'bg-secondary' :
                    'bg-muted'
                  }`}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
