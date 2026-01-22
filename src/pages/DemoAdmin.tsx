import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function DemoAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<"seed" | "reset" | null>(null);

  const seedDemoData = async () => {
    setLoading("seed");
    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-users");
      if (error) throw error;
      toast({
        title: "Demo data seeded",
        description: `Created/updated demo users.`,
      });
      console.log("seed-demo-users result:", data);
    } catch (e: any) {
      toast({
        title: "Seeding failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const resetDemoUsers = async () => {
    setLoading("reset");
    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-users", {
        body: { reset_passwords: true },
      });
      if (error) throw error;

      toast({
        title: "Demo users reset",
        description: "Passwords reset to 12345678 and temp-password flow re-enabled.",
      });
      console.log("seed-demo-users reset result:", data);
    } catch (e: any) {
      toast({
        title: "Reset failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Demo Admin</h1>
          <p className="text-sm text-muted-foreground">
            Minimal tools to prep the hackathon demo environment.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Seed demo data</CardTitle>
            <CardDescription>
              Creates demo users (if missing) and updates their profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={seedDemoData} disabled={loading !== null}>
              {loading === "seed" ? "Seeding…" : "Seed Demo Data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset demo users</CardTitle>
            <CardDescription>
              Resets demo users’ passwords back to <span className="font-medium">12345678</span> and sets
              temp-password required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="secondary"
              onClick={resetDemoUsers}
              disabled={loading !== null}
            >
              {loading === "reset" ? "Resetting…" : "Reset Demo Users"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
