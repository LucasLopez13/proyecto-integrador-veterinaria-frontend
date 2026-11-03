import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_CONFIG } from "../constants";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

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
    <main className="min-vh-100 py-5" style={{ backgroundColor: "var(--app-canvas, #FAF9FC)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--lavender-tint, #F5F3FF)",
                color: "var(--primary-violet, #6D28D9)",
                fontSize: "1.5rem",
                border: "1px solid var(--lavender-border, #EDE9FE)",
              }}
            >
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: "var(--text-heading, #1E1B4B)" }}>
                Carnet de Vacunación Digital
              </h1>
              <p className="text-muted small mb-0">
                Información sanitaria y control de vacunas
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-light rounded-2 border-subtle d-inline-flex align-items-center gap-2 text-decoration-none shadow-sm"
            style={{ fontSize: "0.875rem" }}
          >
            <i className="bi bi-box-arrow-in-right"></i> Acceso VetCare
          </Link>
        </div>

        {cargando && (
          <div className="card border-subtle rounded-3 bg-white p-5 shadow-sm">
            <LoadingSpinner message="Consultando carnet de vacunación..." />
          </div>
        )}

        {!cargando && error && (
          <div
            className="card border-0 rounded-3 p-4 shadow-sm mb-4"
            style={{
              backgroundColor: "var(--color-danger-bg, #FEF2F2)",
              borderLeft: "4px solid var(--color-danger, #DC2626)",
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <i className="bi bi-exclamation-triangle-fill text-danger fs-4 mt-1"></i>
              <div>
                <h2 className="h6 fw-bold text-danger mb-1">No se pudo consultar el carnet</h2>
                <p className="text-danger small mb-0">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!cargando && carnet && (
          <>
            <section className="card shadow-sm border-subtle rounded-3 mb-4 bg-white overflow-hidden">
              <div
                className="py-3 px-4 border-subtle"
                style={{
                  backgroundColor: "var(--lavender-tint, #F5F3FF)",
                  borderBottom: "1px solid var(--lavender-border, #EDE9FE)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm"
                      style={{
                        width: "44px",
                        height: "44px",
                        color: "var(--primary-violet, #6D28D9)",
                        fontSize: "1.25rem",
                      }}
                    >
                      <i className="bi bi-heart-pulse-fill"></i>
                    </div>
                    <div>
                      <h2 className="h5 fw-bold mb-0" style={{ color: "var(--text-heading, #1E1B4B)" }}>
                        {carnet.mascota.nombre}
                      </h2>
                      <span className="badge rounded-pill text-capitalize" style={{ backgroundColor: "var(--lavender-border, #EDE9FE)", color: "var(--primary-violet, #6D28D9)" }}>
                        {carnet.mascota.especie}
                      </span>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small">
                    <i className="bi bi-patch-check-fill me-1"></i> Verificado
                  </span>
                </div>
              </div>

              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-sm-4">
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <span className="text-muted d-block small mb-1">Especie</span>
                      <strong className="text-dark text-capitalize">{carnet.mascota.especie}</strong>
                    </div>
                  </div>

                  <div className="col-12 col-sm-4">
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <span className="text-muted d-block small mb-1">Raza</span>
                      <strong className="text-dark">{carnet.mascota.raza || "No registrada"}</strong>
                    </div>
                  </div>

                  <div className="col-12 col-sm-4">
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <span className="text-muted d-block small mb-1">Sexo</span>
                      <strong className="text-dark text-capitalize">{carnet.mascota.sexo || "No registrado"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card shadow-sm border-subtle rounded-3 bg-white overflow-hidden">
              <div className="card-header bg-white border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-plus text-primary fs-5"></i>
                  <h2 className="h6 fw-bold mb-0" style={{ color: "var(--text-heading, #1E1B4B)" }}>
                    Vacunas Registradas
                  </h2>
                </div>
                <span className="badge rounded-pill" style={{ backgroundColor: "var(--lavender-tint, #F5F3FF)", color: "var(--primary-violet, #6D28D9)" }}>
                  {carnet.vacunas.length} vacuna{carnet.vacunas.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="card-body p-0">
                {carnet.vacunas.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon="bi-shield-slash"
                      title="Sin vacunas registradas"
                      description="No hay vacunas registradas para esta mascota en el sistema."
                      compact
                    />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--lavender-border, #EDE9FE)" }}>
                          <th className="py-3 px-4 text-muted small fw-semibold">Vacuna</th>
                          <th className="py-3 px-4 text-muted small fw-semibold">Fecha de aplicación</th>
                          <th className="py-3 px-4 text-muted small fw-semibold">Próximo refuerzo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carnet.vacunas.map((vacuna, index) => (
                          <tr key={`${vacuna.nombre}-${vacuna.fechaAplicacion}-${index}`} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-2"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: "var(--lavender-tint, #F5F3FF)",
                                    color: "var(--primary-violet, #6D28D9)",
                                  }}
                                >
                                  <i className="bi bi-capsule"></i>
                                </div>
                                <span className="fw-semibold text-dark">{vacuna.nombre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-2 px-2 py-1">
                                <i className="bi bi-check2-circle me-1"></i>
                                {formatearFecha(vacuna.fechaAplicacion)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {vacuna.fechaRefuerzoEstimada ? (
                                <span className="badge rounded-2 px-2 py-1" style={{ backgroundColor: "var(--lavender-tint, #F5F3FF)", color: "var(--primary-violet, #6D28D9)", border: "1px solid var(--lavender-border, #EDE9FE)" }}>
                                  <i className="bi bi-calendar3 me-1"></i>
                                  {formatearFecha(vacuna.fechaRefuerzoEstimada)}
                                </span>
                              ) : (
                                <span className="text-muted small">No programado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <div
              className="card mt-4 border-subtle rounded-3 p-3 shadow-sm"
              style={{
                backgroundColor: "var(--lavender-tint, #F5F3FF)",
                border: "1px solid var(--lavender-border, #EDE9FE)",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-info-circle-fill fs-5 mt-1" style={{ color: "var(--primary-violet, #6D28D9)" }}></i>
                <div>
                  <h3 className="h6 fw-bold mb-1" style={{ color: "var(--text-heading, #1E1B4B)" }}>
                    Constancia Oficial
                  </h3>
                  <p className="text-muted small mb-0">
                    Este carnet muestra los datos sanitarios y de vacunación registrados en tiempo real en la plataforma VetCare. Para confirmar el plan sanitario de tu mascota, consultá con tu veterinario de cabecera.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
