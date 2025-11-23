import { Home, Calendar, MessageCircle, Users, User, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showNotificationButton = ["/home", "/events", "/clubs"].includes(location.pathname);

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: Users, label: "Clubs", path: "/clubs" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card/80 backdrop-blur-lg border-t border-border/50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-around flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl smooth-transition text-muted-foreground"
                  activeClassName="text-primary bg-primary/10"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          {showNotificationButton && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/notifications")}
              className="ml-2 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
