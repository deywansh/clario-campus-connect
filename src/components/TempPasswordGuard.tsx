import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

interface TempPasswordGuardProps {
  children: ReactNode;
}

/**
 * Guard that checks if user needs to change temporary password.
 * Redirects to /change-password if is_temp_password is true.
 */
const TempPasswordGuard = ({ children }: TempPasswordGuardProps) => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has temp password, redirect to change password
  if (profile?.is_temp_password === true) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

export default TempPasswordGuard;
