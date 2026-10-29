
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

  const rol = String(user?.role || user?.rol || "")
    .toLowerCase()
    .trim();

  if (rol !== "profesional" && rol !== "veterinario") {
    return <Navigate to="/mascotas" replace />;
  }

  return children;
}

export default ProfessionalRoute;
