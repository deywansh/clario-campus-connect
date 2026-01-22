import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: "faculty" | "student" | "club";
}

type RequestBody = {
  /** When true, resets demo users' auth password back to the configured demo password. */
  reset_passwords?: boolean;
};

const demoUsers: DemoUser[] = [
  {
    email: "faculty@poornima.edu.in",
    password: "12345678",
    full_name: "Faculty",
    role: "faculty",
  },
  {
    email: "student@poornima.edu.in",
    password: "12345678",
    full_name: "Student",
    role: "student",
  },
  {
    email: "club@poornima.edu.in",
    password: "12345678",
    full_name: "Club",
    role: "club",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: RequestBody = {};
    try {
      // Body is optional
      body = (await req.json()) as RequestBody;
    } catch {
      body = {};
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of demoUsers) {
      try {
        // Check if user already exists
        // NOTE: listUsers() is used here for simplicity given the tiny demo set.
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;

          // Optionally reset demo auth password back to demo password
          if (body.reset_passwords) {
            const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
              password: user.password,
            });

            if (updateAuthError) {
              results.push({
                email: user.email,
                status: "exists, password reset failed (profile will still update)",
                error: updateAuthError.message,
              });
            } else {
              results.push({ email: user.email, status: "exists, password reset + updating profile" });
            }
          } else {
            results.push({ email: user.email, status: "already exists, updating profile" });
          }
        } else {
          // Create user in auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.full_name,
            },
          });

          if (authError) {
            results.push({ email: user.email, status: "failed", error: authError.message });
            continue;
          }

          userId = authData.user.id;
          results.push({ email: user.email, status: "created" });
        }

        // Update profile with role and is_temp_password
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert({
            id: userId,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_temp_password: true,
          }, { onConflict: "id" });

        if (profileError) {
          results.push({ 
            email: user.email, 
            status: "profile update failed", 
            error: profileError.message 
          });
        }

        // Also add to user_roles table for proper RBAC
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: user.role,
          }, { onConflict: "user_id,role" });

        if (roleError) {
          console.log(`Role insert note for ${user.email}:`, roleError.message);
        }

      } catch (err) {
        results.push({ email: user.email, status: "error", error: String(err) });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
