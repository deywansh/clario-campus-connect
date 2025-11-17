import { MessageCircle, Plus, Users } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";
import { format } from "date-fns";

const Chats = () => {
  const { chats, loading } = useChats();

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chats</h1>
              <p className="text-muted-foreground text-sm">Connect with your campus community</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="icon"
                className="rounded-full bg-primary hover:bg-primary/90"
                title="Create new chat"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chats list */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">No chats yet</h2>
              <p className="text-muted-foreground">
                Create or join a group chat to start connecting
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="glass-card rounded-xl p-4 smooth-transition hover:glow-border cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(chat.updated_at), 'MMM d')}
                      </span>
                    </div>
                    {chat.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {chat.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Chats;
