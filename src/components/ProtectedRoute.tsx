import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin trying to access user routes → send to admin
  if (!requireAdmin && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Non-admin trying to access admin routes → send to app
  if (requireAdmin && profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
