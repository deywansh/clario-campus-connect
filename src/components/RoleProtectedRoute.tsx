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

  // Wait for auth to finish loading
  if (authLoading) return null;

  // If not logged in, redirect to auth
  if (!user) return <Navigate to="/auth" replace />;

  // Wait for profile to finish loading - don't make role decisions yet
  if (profileLoading) return null;

  // Only after profile is loaded, check the role
  // If profile doesn't exist or role is null, that's an error state
  if (!profile || !profile.role) {
    console.error("Profile or role not found for user:", user.id);
    return <Navigate to="/auth" replace />;
  }

  const role = profile.role.toLowerCase() as AppRole;
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase()) as AppRole[];

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
