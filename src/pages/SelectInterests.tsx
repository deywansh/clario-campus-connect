import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Source {
  id: string;
  name: string;
  type: "faculty" | "club";
  avatar_url?: string | null;
}

const SelectInterests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      // Fetch faculty profiles
      const { data: facultyData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("role", "faculty")
        .limit(10);

      // Fetch clubs
      const { data: clubsData } = await supabase
        .from("clubs")
        .select("id, name, avatar_url")
        .limit(10);

      const allSources: Source[] = [
        ...(facultyData || []).map((f) => ({
          id: f.id,
          name: f.full_name,
          type: "faculty" as const,
          avatar_url: f.avatar_url,
        })),
        ...(clubsData || []).map((c) => ({
          id: c.id,
          name: c.name,
          type: "club" as const,
          avatar_url: c.avatar_url,
        })),
      ];

      setSources(allSources);
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(sourceId)) {
      newSelected.delete(sourceId);
    } else {
      newSelected.add(sourceId);
    }
    setSelected(newSelected);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      // Insert all selected subscriptions
      const subscriptions = Array.from(selected).map((sourceId) => {
        const source = sources.find((s) => s.id === sourceId);
        return {
          user_id: user.id,
          source_id: sourceId,
          source_type: source?.type || "faculty",
        };
      });

      if (subscriptions.length > 0) {
        const { error } = await supabase
          .from("user_subscriptions")
          .insert(subscriptions);

        if (error) {
          console.error("Error saving subscriptions:", error);
          toast.error("Failed to save preferences");
          return;
        }
      }

      toast.success("Preferences saved!");
      navigate("/home", { replace: true });
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/home", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="max-w-md w-full mx-auto space-y-6 relative z-10 flex-1">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">What interests you?</h1>
          <p className="text-muted-foreground">
            Follow faculties and clubs to personalize your feed
          </p>
        </div>

        {sources.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center">
            <p className="text-muted-foreground">No sources available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Faculty Section */}
            {sources.filter((s) => s.type === "faculty").length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty</span>
                </div>
                <div className="grid gap-2">
                  {sources
                    .filter((s) => s.type === "faculty")
                    .map((source) => (
                      <button
                        key={source.id}
                        onClick={() => toggleSource(source.id)}
                        className={`glass-card rounded-xl p-4 flex items-center gap-3 smooth-transition ${
                          selected.has(source.id)
                            ? "glow-border bg-primary/10"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {source.avatar_url ? (
                            <img
                              src={source.avatar_url}
                              alt={source.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <GraduationCap className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span className="flex-1 text-left font-medium">
                          {source.name}
                        </span>
                        {selected.has(source.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Clubs Section */}
            {sources.filter((s) => s.type === "club").length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Clubs</span>
                </div>
                <div className="grid gap-2">
                  {sources
                    .filter((s) => s.type === "club")
                    .map((source) => (
                      <button
                        key={source.id}
                        onClick={() => toggleSource(source.id)}
                        className={`glass-card rounded-xl p-4 flex items-center gap-3 smooth-transition ${
                          selected.has(source.id)
                            ? "glow-border bg-primary/10"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          {source.avatar_url ? (
                            <img
                              src={source.avatar_url}
                              alt={source.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <span className="flex-1 text-left font-medium">
                          {source.name}
                        </span>
                        {selected.has(source.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            disabled={submitting}
          >
            {submitting ? "Saving..." : `Continue${selected.size > 0 ? ` (${selected.size} selected)` : ""}`}
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full rounded-full"
            disabled={submitting}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
