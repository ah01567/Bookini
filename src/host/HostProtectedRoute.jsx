import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

export default function HostProtectedRoute() {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/host/login" replace />;
  const allowed = profile?.role === "host" || profile?.role === "admin";
  if (!allowed) return <div className="p-8 text-center">Accès réservé aux hôtes.</div>;
  return <Outlet />;
}
