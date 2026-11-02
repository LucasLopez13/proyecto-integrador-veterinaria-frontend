import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/common/EmptyState";

export default function NotFound() {
  const { user, isAuthenticated } = useAuth();

  const rawRole =
    typeof user?.rol === "object" && (user?.rol as any)?.nombre
      ? (user?.rol as any).nombre
      : user?.role || user?.rol || "";

  const role = String(rawRole).toLowerCase().trim();
  const isProfessional = role === "profesional" || role === "admin";

  const targetUrl = !isAuthenticated
    ? "/login"
    : isProfessional
    ? "/profesional/turnos"
    : "/mascotas";

  const targetText = !isAuthenticated
    ? "Iniciar Sesion"
    : isProfessional
    ? "Volver a la Agenda"
    : "Volver a Mis Mascotas";

  return (
    <main className="py-5">
      <div className="container py-5" style={{ maxWidth: "560px" }}>
        <EmptyState
          icon="bi-compass"
          title="Pagina no encontrada"
          description="La direccion URL a la que intentas acceder no existe, cambio de lugar o no esta disponible."
          actionText={targetText}
          actionTo={targetUrl}
          actionIcon="bi-arrow-left"
        />
      </div>
    </main>
  );
}
