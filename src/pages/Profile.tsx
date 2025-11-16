import { Button } from "@/components/ui/button";
import { User, Mail, BookOpen, Users, Settings, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const followedClubs = [
    "Tech Club",
    "Photography Society",
    "Music Club",
    "Drama Club",
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile header */}
        <div className="glass-card rounded-2xl p-6 text-center space-y-4 glow-border">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">John Doe</h2>
            <p className="text-muted-foreground">Computer Science - Year 3</p>
          </div>
          <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/10">
            Edit Profile
          </Button>
        </div>

        {/* Info cards */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Information</h3>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <span>john.doe@poornima.edu.in</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Section A</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <User className="w-5 h-5 text-primary" />
            <span>Student</span>
          </div>
        </div>

        {/* Followed clubs */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Followed Clubs</h3>
          <div className="space-y-2">
            {followedClubs.map((club) => (
              <div key={club} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Users className="w-5 h-5 text-primary" />
                <span>{club}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-full border-border/50 hover:bg-secondary/50 justify-start"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 justify-start"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
