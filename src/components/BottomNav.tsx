import { useLocation, Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import {
  Home,
  CalendarDays,
  Users,
  MessageCircle,
  Bell,
  User,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function BottomNav() {
  const location = useLocation();
  const { profile } = useProfile();

  const rawRole = (profile?.role as string | undefined) ?? "student";
  const role = rawRole.toLowerCase();

  let items: NavItem[] = [];

  if (role === "student") {
    items = [
      { to: "/home", label: "Home", icon: Home },
      { to: "/events", label: "Events", icon: CalendarDays },
      { to: "/clubs", label: "Clubs", icon: Users },
      { to: "/chats", label: "Chats", icon: MessageCircle },
      { to: "/profile", label: "Profile", icon: User },
    ];
  } else if (role === "faculty") {
    items = [
      { to: "/home", label: "Home", icon: Home },
      { to: "/events", label: "Events", icon: CalendarDays },
      { to: "/chats", label: "Chats", icon: MessageCircle },
      { to: "/notifications", label: "Alerts", icon: Bell },
      { to: "/profile", label: "Profile", icon: User },
    ];
  } else if (role === "club") {
    items = [
      { to: "/home", label: "Home", icon: Home },
      { to: "/events", label: "Events", icon: CalendarDays },
      { to: "/chats", label: "Chats", icon: MessageCircle },
      { to: "/notifications", label: "Alerts", icon: Bell },
      { to: "/profile", label: "Profile", icon: User },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md z-40">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "stroke-[2.4px]" : "stroke-[1.8px]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
