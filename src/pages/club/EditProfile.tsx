import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useClubs } from "@/hooks/useClubs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";

const ClubEditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs } = useClubs();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const myClub = clubs.find(c => c.user_id === user?.id);

  useEffect(() => {
    if (myClub) {
      setName(myClub.name);
      setDescription(myClub.description || "");
      setLogoUrl(myClub.avatar_url || "");
    }
  }, [myClub]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myClub) return;

    setSaving(true);

    const { error } = await supabase
      .from("clubs")
      .update({
        name,
        description: description || null,
        avatar_url: logoUrl || null,
      })
      .eq("id", myClub.id);

    if (error) {
      toast.error("Failed to update club profile");
    } else {
      toast.success("Club profile updated successfully");
      navigate("/club/dashboard");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/club/dashboard")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Edit Club Profile</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label>Club Logo</Label>
            <ImageUploader
              bucket="club-logos"
              onUploadComplete={setLogoUrl}
              currentImage={logoUrl}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people about your club..."
              rows={4}
              className="rounded-2xl"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 rounded-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClubEditProfile;
