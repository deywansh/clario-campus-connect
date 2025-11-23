import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const { createAnnouncement } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await createAnnouncement(title, content);

    if (error) {
      toast.error("Failed to create announcement");
    } else {
      toast.success("Announcement created successfully");
      navigate("/faculty/dashboard");
    }

    setCreating(false);
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
                onClick={() => navigate("/faculty/dashboard")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Create Announcement</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter announcement title"
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter announcement content"
              rows={6}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <ImageUploader
              bucket="announcement-images"
              onUploadComplete={setImageUrl}
              currentImage={imageUrl}
            />
          </div>

          <Button
            type="submit"
            disabled={creating}
            className="w-full bg-primary hover:bg-primary/90 rounded-full"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Announcement"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
