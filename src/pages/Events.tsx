import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const events = [
  {
    id: 1,
    title: "Tech Talk: AI in Education",
    organizer: "Computer Science Dept.",
    date: "March 25, 2024",
    time: "2:00 PM",
    location: "Auditorium A",
    attendees: 156,
    image: "from-primary/20 to-accent/20",
  },
  {
    id: 2,
    title: "Annual Hackathon 2024",
    organizer: "Tech Club",
    date: "March 28, 2024",
    time: "9:00 AM",
    location: "Innovation Lab",
    attendees: 89,
    image: "from-accent/20 to-primary/20",
  },
  {
    id: 3,
    title: "Cultural Fest - Day 1",
    organizer: "Student Council",
    date: "April 5, 2024",
    time: "4:00 PM",
    location: "Main Ground",
    attendees: 320,
    image: "from-primary/20 to-accent/20",
  },
  {
    id: 4,
    title: "Career Fair 2024",
    organizer: "Placement Cell",
    date: "April 10, 2024",
    time: "10:00 AM",
    location: "Convention Center",
    attendees: 245,
    image: "from-accent/20 to-primary/20",
  },
];

const Events = () => {
  const handleRSVP = (eventTitle: string) => {
    toast.success(`RSVP confirmed for ${eventTitle}!`);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Events Hub</h1>
          <p className="text-muted-foreground text-sm">Discover what's happening on campus</p>
        </div>
      </div>

      {/* Mini calendar widget placeholder */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="glass-card rounded-2xl p-4 mb-6 text-center glow-border">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Calendar view coming soon</p>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.id} className="glass-card rounded-2xl overflow-hidden smooth-transition hover:glow-border">
              {/* Event image/gradient */}
              <div className={`h-32 bg-gradient-to-br ${event.image} flex items-center justify-center`}>
                <Calendar className="w-12 h-12 text-primary/50" />
              </div>

              {/* Event details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.organizer}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleRSVP(event.title)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                >
                  RSVP
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Events;
