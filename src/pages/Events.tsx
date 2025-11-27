import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Grid, List } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay } from "date-fns";
import CalendarView from "@/components/CalendarView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Events = () => {
  const { events, loading, rsvpToEvent } = useEvents();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(event => 
      isSameDay(new Date(event.event_date), selectedDate)
    );
  }, [events, selectedDate]);

  const handleRSVP = async (eventId: string, eventTitle: string) => {
    if (!user) {
      toast.error("Please login to RSVP");
      return;
    }

    const { error } = await rsvpToEvent(eventId, "going");
    if (error) {
      toast.error("Failed to RSVP. Please try again.");
    } else {
      toast.success(`RSVP confirmed for ${eventTitle}!`);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Events Hub</h1>
              <p className="text-muted-foreground text-sm">
                {selectedDate ? `Events on ${format(selectedDate, 'PPP')}` : 'Discover what\'s happening on campus'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* View Toggle & Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="list" className="rounded-full">
              <List className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-full">
              <Grid className="w-4 h-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView 
              events={events} 
              onDateSelect={(date) => {
                setSelectedDate(date);
                setViewMode("list");
              }}
            />
            {selectedDate && (
              <Button
                variant="outline"
                onClick={() => setSelectedDate(null)}
                className="w-full rounded-full"
              >
                Clear Date Filter
              </Button>
            )}
          </TabsContent>

          <TabsContent value="list">
            {/* Events grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedDate ? 'No events on this date' : 'No events yet'}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedDate ? 'Try selecting a different date' : 'Check back soon for upcoming campus events'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
              <div key={event.id} className="glass-card rounded-2xl overflow-hidden smooth-transition hover:glow-border">
                {/* Event image/poster */}
                {event.poster_url ? (
                  <img src={event.poster_url} alt={event.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-primary/50" />
                  </div>
                )}

                {/* Event details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.author_name}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.event_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(event.event_date), 'p')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <Button
                    onClick={() => handleRSVP(event.id, event.title)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    RSVP
                  </Button>
                </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Events;
