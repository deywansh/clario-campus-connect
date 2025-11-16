import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pin, Heart, MessageCircle, Users } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const announcements = [
  {
    id: 1,
    author: "Dr. Sharma - Computer Science",
    role: "Faculty",
    content: "Mid-semester exams scheduled for next week. Please check the academic portal for detailed timetable.",
    timestamp: "2 hours ago",
    pinned: true,
    likes: 45,
    comments: 12,
  },
  {
    id: 2,
    author: "Tech Club",
    role: "Club",
    content: "Hackathon registration is now open! Join us for 24 hours of coding, innovation, and prizes. Limited seats available.",
    timestamp: "5 hours ago",
    pinned: false,
    likes: 128,
    comments: 34,
  },
  {
    id: 3,
    author: "Student Council",
    role: "Club",
    content: "Annual fest preparations are underway! We're looking for volunteers. DM us if interested.",
    timestamp: "1 day ago",
    pinned: false,
    likes: 89,
    comments: 23,
  },
];

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`sticky top-0 z-10 smooth-transition ${scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50" : ""}`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className={`text-2xl font-bold smooth-transition ${scrolled ? "opacity-0 h-0" : "opacity-100"}`}>
            Hello, <span className="text-primary">Student</span> 👋
          </h1>
          {scrolled && <h2 className="text-xl font-semibold">Feed</h2>}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* See All Clubs button */}
        <Button variant="outline" className="w-full rounded-full border-primary/30 hover:bg-primary/10">
          <Users className="w-4 h-4 mr-2" />
          See All Clubs
        </Button>

        {/* Announcements */}
        <div className="space-y-4">
          {announcements.map((post) => (
            <div key={post.id} className="glass-card rounded-2xl p-4 space-y-3 smooth-transition hover:glow-border">
              {/* Post header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.author}</h3>
                    {post.pinned && <Pin className="w-4 h-4 text-primary fill-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{post.role} • {post.timestamp}</p>
                </div>
              </div>

              {/* Post content */}
              <p className="text-foreground leading-relaxed">{post.content}</p>

              {/* Post actions */}
              <div className="flex items-center gap-6 pt-2">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary smooth-transition">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary smooth-transition">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
