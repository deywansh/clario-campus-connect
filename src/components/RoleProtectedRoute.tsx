import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

type AppRole = "student" | "faculty" | "club";

interface RoleProtectedRouteProps {
  allowedRoles: AppRole[];
  children: ReactNode;
}

export default function RoleProtectedRoute({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to auth
  if (!user) return <Navigate to="/auth" replace />;

  // Show loading spinner while profile is loading
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // After loading completes, if profile or role is missing, deny access
  // Don't redirect to /auth as user is already authenticated
  if (!profile || !profile.role) {
    console.error("Profile or role not found for user:", user.id);
    return <Navigate to="/access-denied" replace />;
  }

  const role = profile.role.toLowerCase() as AppRole;
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase()) as AppRole[];

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
