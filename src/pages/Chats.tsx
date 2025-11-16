import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Chats = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Chats</h1>
          <p className="text-muted-foreground text-sm">Connect with your campus community</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">No chats yet</h2>
            <p className="text-muted-foreground">
              Group chats and messaging will be available soon
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chats;
