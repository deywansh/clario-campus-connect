import { useState, useEffect } from "react";
import { Search as SearchIcon, Megaphone, Calendar, MessageCircle, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

interface Chat {
  id: string;
  name: string;
  description: string | null;
}

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setAnnouncements([]);
      setEvents([]);
      setChats([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    const searchTerm = `%${query}%`;

    try {
      // Search announcements
      const { data: announcementData } = await supabase
        .from("announcements")
        .select("id, title, content, created_at")
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(5);

      // Search events
      const { data: eventData } = await supabase
        .from("events")
        .select("id, title, description, event_date")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      // Search chats
      const { data: chatData } = await supabase
        .from("chats")
        .select("id, name, description")
        .ilike("name", searchTerm)
        .limit(5);

      setAnnouncements(announcementData || []);
      setEvents(eventData || []);
      setChats(chatData || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = announcements.length > 0 || events.length > 0 || chats.length > 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-secondary/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search announcements, events, chats..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 bg-secondary/50 border-border/50 rounded-full"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {query.length < 2 ? (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Type at least 2 characters to search</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !hasResults ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No results found for "{query}"</p>
          </div>
        ) : (
          <>
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Megaphone className="w-4 h-4" />
                  <span>Announcements</span>
                </div>
                <div className="space-y-2">
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card rounded-xl p-4 smooth-transition hover:glow-border cursor-pointer"
                    >
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Events</span>
                </div>
                <div className="space-y-2">
                  {events.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate("/events")}
                      className="glass-card rounded-xl p-4 smooth-transition hover:glow-border cursor-pointer"
                    >
                      <h3 className="font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-primary mt-2">
                        {format(new Date(item.event_date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chats */}
            {chats.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chats</span>
                </div>
                <div className="space-y-2">
                  {chats.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/chats/${item.id}`)}
                      className="glass-card rounded-xl p-4 smooth-transition hover:glow-border cursor-pointer"
                    >
                      <h3 className="font-medium">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
