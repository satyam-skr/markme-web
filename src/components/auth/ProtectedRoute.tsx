import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "STUDENT" | "FACULTY")[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the current location to redirect back after login
        navigate(redirectTo, { 
          state: { from: location.pathname },
          replace: true 
        });
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User is authenticated but doesn't have the required role
        // Redirect to their appropriate dashboard
        const userDashboard = 
          user.role === "ADMIN" ? "/dashboard/admin" :
          user.role === "STUDENT" ? "/dashboard/student" :
          user.role === "FACULTY" ? "/dashboard/faculty" : "/";
        navigate(userDashboard, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate, redirectTo, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if not authenticated or wrong role
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}