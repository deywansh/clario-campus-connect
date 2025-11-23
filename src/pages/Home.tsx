import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { AnnouncementSkeleton } from "@/components/AnnouncementSkeleton";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { announcements, loading, createAnnouncement } = useAnnouncements();
  const { profile, roles } = useProfile();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const canCreateAnnouncement = roles.includes("faculty") || roles.includes("club");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await createAnnouncement(title, content);

    if (error) {
      toast.error("Failed to create announcement");
    } else {
      toast.success("Announcement created successfully");
      setOpen(false);
      setTitle("");
      setContent("");
    }

    setCreating(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`sticky top-0 z-10 smooth-transition ${scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50" : ""}`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold smooth-transition ${scrolled ? "opacity-0 h-0" : "opacity-100"}`}>
              Hello, <span className="text-primary">{profile?.full_name || "Student"}</span> 👋
            </h1>
            {scrolled && <h2 className="text-xl font-semibold">Feed</h2>}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {canCreateAnnouncement && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={creating} className="w-full">
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* See All Clubs button */}
        <Button 
          variant="outline" 
          className="w-full rounded-full border-primary/30 hover:bg-primary/10"
          onClick={() => navigate("/clubs")}
        >
          <Users className="w-4 h-4 mr-2" />
          See All Clubs
        </Button>

        {/* Announcements */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <AnnouncementSkeleton />
              <AnnouncementSkeleton />
            </div>
          ) : announcements.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No announcements yet</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="glass-card rounded-2xl p-4 space-y-3 smooth-transition hover:glow-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{announcement.author_name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(announcement.created_at), 'PPp')}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
                {announcement.image_url && (
                  <img src={announcement.image_url} alt={announcement.title} className="w-full rounded-xl object-cover max-h-64" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
