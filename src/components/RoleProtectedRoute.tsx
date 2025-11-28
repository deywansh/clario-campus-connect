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

  if (authLoading || profileLoading) return null;

  if (!user) return <Navigate to="/auth" replace />;

  const rawRole = (profile?.role as string | undefined) ?? "student";
  const role = rawRole.toLowerCase() as AppRole;

  const normalizedAllowed = allowedRoles.map((r) =>
    r.toLowerCase()
  ) as AppRole[];

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
