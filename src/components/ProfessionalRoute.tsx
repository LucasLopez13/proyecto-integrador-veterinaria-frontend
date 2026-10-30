
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProfessionalRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rawRole =
    typeof user?.rol === "object" && (user?.rol as any)?.nombre
      ? (user?.rol as any).nombre
      : user?.role || user?.rol || "";

  const rol = String(rawRole).toLowerCase().trim();

  if (rol !== "profesional" && rol !== "admin") {
    return <Navigate to="/mascotas" replace />;
  }

  return children;
}

export default ProfessionalRoute;
