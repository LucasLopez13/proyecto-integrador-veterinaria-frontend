
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_CONFIG } from "../constants";

interface Vacuna {
  nombre: string;
  fechaAplicacion: string;
  fechaRefuerzoEstimada?: string | null;
}

interface CarnetData {
  mascota: {
    nombre: string;
    especie: string;
    raza?: string | null;
    sexo?: string | null;
  };
  vacunas: Vacuna[];
}

function formatearFecha(fecha?: string | null): string {
  if (!fecha) return "No registrada";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return "No registrada";
  }

  return fechaValida.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function PublicVaccinationCard() {
  const { token } = useParams<{ token: string }>();

  const [carnet, setCarnet] = useState<CarnetData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarCarnet() {
      setCargando(true);
      setError("");
      setCarnet(null);

      try {
        if (!token) {
          throw new Error("El enlace del carnet no es válido.");
        }

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/carnets-vacunacion/publico/${encodeURIComponent(token)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "No se pudo consultar el carnet."
          );
        }

        if (activo) {
          setCarnet(data);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Ocurrió un error al consultar el carnet."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarCarnet();

    return () => {
      activo = false;
    };
  }, [token]);

  return (
    <main className="container py-5" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-4">
        <h1 className="fw-bold">Carnet de vacunación</h1>
        <p className="text-muted">
          Información sanitaria de tu mascota
        </p>
      </div>

      {cargando && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Consultando carnet...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="alert alert-danger" role="alert">
          <h2 className="h5">No se pudo consultar el carnet</h2>
          <p className="mb-0">{error}</p>
        </div>
      )}

      {!cargando && carnet && (
        <>
          <section className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h4 mb-3">
                {carnet.mascota.nombre}
              </h2>

              <p className="mb-2">
                <strong>Especie:</strong>{" "}
                {carnet.mascota.especie}
              </p>

              <p className="mb-2">
                <strong>Raza:</strong>{" "}
                {carnet.mascota.raza || "No registrada"}
              </p>

              <p className="mb-0">
                <strong>Sexo:</strong>{" "}
                {carnet.mascota.sexo || "No registrado"}
              </p>
            </div>
          </section>

          <section className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 mb-3">Vacunas registradas</h2>

              {carnet.vacunas.length === 0 ? (
                <div className="alert alert-info mb-0">
                  No hay vacunas registradas para esta mascota.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Vacuna</th>
                        <th>Fecha de aplicación</th>
                        <th>Próximo refuerzo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carnet.vacunas.map((vacuna, index) => (
                        <tr key={`${vacuna.nombre}-${vacuna.fechaAplicacion}-${index}`}>
                          <td>{vacuna.nombre}</td>
                          <td>{formatearFecha(vacuna.fechaAplicacion)}</td>
                          <td>{formatearFecha(vacuna.fechaRefuerzoEstimada)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <p className="text-muted text-center mt-4 small">
            Este carnet muestra los datos disponibles en el sistema.
            Para confirmar el estado sanitario de la mascota, consultá
            con un profesional veterinario.
          </p>
        </>
      )}
    </main>
  );
}
