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

function isDemoStudentEmail(email: string) {
  return /^student(\d+)@poornima\.edu\.in$/i.test(email);
}

// Deno/esm type inference for supabase-js can be overly strict here; keep this helper loosely typed.
async function listAllAuthUsersByEmail(supabaseAdmin: any) {
  // Supabase Admin API is paginated; we need to page through it to reliably find demo users.
  const usersByEmail = new Map<string, { id: string; email: string | null }>();
  const perPage = 1000;

  for (let page = 1; page < 100; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    for (const u of users) {
      if (u.email) usersByEmail.set(u.email.toLowerCase(), { id: u.id, email: u.email });
    }

    if (users.length < perPage) break;
  }

  return usersByEmail;
}

type RequestBody = {
  /** When true, resets demo users' auth password back to the configured demo password. */
  reset_passwords?: boolean;
  /** When true, fully resets demo users to first-time login state (clears profile, subscriptions, sets is_temp_password). */
  full_reset?: boolean;
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
  // Demo students for onboarding + screen-recording
  {
    email: "student1@poornima.edu.in",
    password: "12345678",
    full_name: "Student 1",
    role: "student",
  },
  {
    email: "student2@poornima.edu.in",
    password: "12345678",
    full_name: "Student 2",
    role: "student",
  },
  {
    email: "student3@poornima.edu.in",
    password: "12345678",
    full_name: "Student 3",
    role: "student",
  },
  {
    email: "student4@poornima.edu.in",
    password: "12345678",
    full_name: "Student 4",
    role: "student",
  },
  {
    email: "student5@poornima.edu.in",
    password: "12345678",
    full_name: "Student 5",
    role: "student",
  },
  {
    email: "student6@poornima.edu.in",
    password: "12345678",
    full_name: "Student 6",
    role: "student",
  },
  {
    email: "student7@poornima.edu.in",
    password: "12345678",
    full_name: "Student 7",
    role: "student",
  },
  {
    email: "student8@poornima.edu.in",
    password: "12345678",
    full_name: "Student 8",
    role: "student",
  },
  {
    email: "student9@poornima.edu.in",
    password: "12345678",
    full_name: "Student 9",
    role: "student",
  },
  {
    email: "student10@poornima.edu.in",
    password: "12345678",
    full_name: "Student 10",
    role: "student",
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

    const authUsersByEmail = await listAllAuthUsersByEmail(supabaseAdmin);

    for (const user of demoUsers) {
      try {
        const emailKey = user.email.toLowerCase();
        const existingUser = authUsersByEmail.get(emailKey);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;

          // Ensure demo accounts remain usable even if someone changed the password.
          // - For demo students: ALWAYS enforce the demo password.
          // - For other demo users: enforce only when reset_passwords=true.
          const shouldResetPassword = body.reset_passwords || isDemoStudentEmail(user.email);
          if (shouldResetPassword) {
            const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
              password: user.password,
              email_confirm: true,
              user_metadata: { full_name: user.full_name },
            });

            if (updateAuthError) {
              results.push({
                email: user.email,
                status: "exists, password update failed (profile will still update)",
                error: updateAuthError.message,
              });
            } else {
              results.push({ email: user.email, status: "exists, password ensured + updating profile" });
            }
          } else {
            // Still ensure email is confirmed and name metadata is set.
            const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
              email_confirm: true,
              user_metadata: { full_name: user.full_name },
            });

            if (updateAuthError) {
              results.push({
                email: user.email,
                status: "already exists, auth meta update failed (profile will still update)",
                error: updateAuthError.message,
              });
            } else {
              results.push({ email: user.email, status: "already exists, updating profile" });
            }
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

          // Keep local cache up-to-date within this run
          authUsersByEmail.set(emailKey, { id: userId, email: user.email });
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
