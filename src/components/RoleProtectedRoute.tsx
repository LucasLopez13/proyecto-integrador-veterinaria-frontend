
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/User";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container py-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (
    typeof user.rol === "object" && (user.rol as any)?.nombre
      ? (user.rol as any).nombre
      : user.role || user.rol || ""
  )
    .toLowerCase()
    .trim() as UserRole;

  if (!role || !allowedRoles.includes(role)) {
    const fallbackPath =
      redirectTo ||
      (role === "profesional" || role === "admin"
        ? "/profesional/turnos"
        : "/mascotas");
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default RoleProtectedRoute;
