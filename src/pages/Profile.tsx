import { Button } from "@/components/ui/button";
import { User, Mail, Settings, LogOut, Loader2, Edit } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, roles, loading } = useProfile();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profile</h1>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Profile content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile header */}
        <div className="glass-card rounded-2xl p-6 text-center space-y-4 glow-border">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name} 
                className="w-24 h-24 rounded-full object-cover" 
              />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name || "User"}</h2>
            <p className="text-muted-foreground">
              {roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(" • ")}
            </p>
            {profile?.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-primary/30 hover:bg-primary/10"
            onClick={() => navigate("/edit-profile")}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Info cards */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Information</h3>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <span>{user?.email || "No email"}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <User className="w-5 h-5 text-primary" />
            <span>{roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(", ")}</span>
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
