
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/User";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container py-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || user.rol;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
