import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import type { Pet } from "../types/Pet";
import type { Consultation } from "../types/Consultation";
import "../styles/PetDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

function PetDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [consultas, setConsultas] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProfessional = user?.role === "profesional" || user?.rol === "profesional";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/mascotas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la información de la mascota");
        }

        const data: Pet = await response.json();
        setPet(data);

        if (token && data.id) {
          try {
            setLoadingConsultas(true);
            const list = await consultationService.getConsultationsByPet(data.id, token);
            setConsultas(list);
          } catch (cErr) {
            console.warn("No se pudieron cargar las consultas:", cErr);
          } finally {
            setLoadingConsultas(false);
          }
        }
      } catch (err: any) {
        console.error("Error al cargar mascota:", err);
        setError(err.message || "Error al cargar los datos de la mascota");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, token]);

  if (loading) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="pet-details-loading">
            <div className="pet-details-loading-icon">🐾</div>
            <p>Cargando información de la mascota...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !pet) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error || "No hay datos de la mascota disponibles."}
          </div>
          <Link to={isProfessional ? "/profesional/turnos" : "/mascotas"} className="btn btn-outline-secondary mt-3">
            {isProfessional ? "Volver a turnos" : "Volver a mis mascotas"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-details-page">
      <div className="container py-4">
        <div className="pet-details-card">
          <div className="pet-details-header">
            <div className="pet-details-icon">🐾</div>

            <div>
              <h1>{pet.nombre}</h1>
              <p>
                {pet.especie} {pet.raza ? `· ${pet.raza}` : "· Raza no especificada"}
              </p>
            </div>
          </div>

          <div className="pet-details-divider"></div>

          <div className="pet-details-info">
            <div className="pet-info-item">
              <span className="pet-info-icon">🐶</span>
              <div>
                <span className="pet-info-label">Especie</span>
                <strong>{pet.especie}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🏷️</span>
              <div>
                <span className="pet-info-label">Raza</span>
                <strong>{pet.raza || "No especificada"}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🎂</span>
              <div>
                <span className="pet-info-label">Edad</span>
                <strong>
                  {pet.edad !== undefined && pet.edad !== null
                    ? `${pet.edad} años`
                    : "No especificada"}
                </strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">⚥</span>
              <div>
                <span className="pet-info-label">Sexo</span>
                <strong>
                  {pet.sexo
                    ? pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1).toLowerCase()
                    : "No especificado"}
                </strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">⚖️</span>
              <div>
                <span className="pet-info-label">Peso Actual Base</span>
                <strong>{pet.peso ? `${pet.peso} kg` : "Sin registro"}</strong>
              </div>
            </div>

            {pet.usuario && (
              <div className="pet-info-item">
                <span className="pet-info-icon">👤</span>
                <div>
                  <span className="pet-info-label">Tutor</span>
                  <strong>
                    {pet.usuario.nombre} {pet.usuario.apellido}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="pet-details-actions">
            {isProfessional ? (
              <>
                <Link to="/profesional/turnos" className="btn btn-outline-secondary">
                  Volver a turnos
                </Link>
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-primary"
                >
                  🩺 Iniciar Consulta SOAP
                </Link>
              </>
            ) : (
              <>
                <Link to="/mascotas" className="btn btn-outline-secondary">
                  Volver a mis mascotas
                </Link>
                <Link
                  to={`/turnos/nuevo?mascota=${pet.id}`}
                  className="btn btn-primary"
                >
                  Solicitar turno
                </Link>
              </>
            )}
          </div>
        </div>

        {isProfessional && (
          <div className="pet-details-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                  📋 Historial de Consultas SOAP
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Evolución clínica registrada para {pet.nombre}
                </p>
              </div>
              <Link
                to={`/profesional/atencion?mascotaId=${pet.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                + Nueva Consulta
              </Link>
            </div>

            {loadingConsultas ? (
              <p className="text-muted text-center py-4">Cargando historial clínico...</p>
            ) : consultas.length === 0 ? (
              <div className="text-center py-4" style={{ background: "#f8fafc", borderRadius: 12 }}>
                <p className="text-muted mb-2">No hay registros clínicos SOAP para este paciente aún.</p>
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-sm btn-primary"
                >
                  🩺 Registrar primera atención
                </Link>
              </div>
            ) : (
              <div className="consultations-timeline mt-3">
                {consultas.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "18px 20px",
                      marginBottom: "16px",
                      background: "#ffffff",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                      <div>
                        <strong style={{ color: "#0f172a", fontSize: "1rem" }}>
                          📅 {c.fecha ? new Date(c.fecha).toLocaleDateString("es-AR") : "Fecha no disponible"}
                        </strong>
                        {c.veterinario && (
                          <span className="text-muted ms-2" style={{ fontSize: "0.875rem" }}>
                            por Dr./Dra. {c.veterinario.nombre} {c.veterinario.apellido}
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-light text-dark border" title="Peso actual">
                          ⚖️ {c.peso} kg
                        </span>
                        <span className="badge bg-light text-dark border" title="Temperatura">
                          🌡️ {c.temperatura} °C
                        </span>
                        {c.frecuenciaCardiaca !== null && c.frecuenciaCardiaca !== undefined && (
                          <span className="badge bg-light text-dark border" title="Frecuencia Cardíaca">
                            💓 {c.frecuenciaCardiaca} lpm
                          </span>
                        )}
                        {c.frecuenciaRespiratoria !== null && c.frecuenciaRespiratoria !== undefined && (
                          <span className="badge bg-light text-dark border" title="Frecuencia Respiratoria">
                            🫁 {c.frecuenciaRespiratoria} rpm
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <small className="text-primary fw-bold d-block mb-1">[S] Subjetivo (Anamnesis):</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.subjetivo}</p>
                      </div>

                      <div>
                        <small className="text-warning fw-bold d-block mb-1">[A] Diagnóstico / Análisis:</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.analisis}</p>
                      </div>

                      <div>
                        <small className="text-success fw-bold d-block mb-1">[O] Objetivo (Examen Físico):</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>
                          {c.objetivo ? c.objetivo : "Sin hallazgos adicionales descriptos"}
                        </p>
                      </div>

                      <div>
                        <small className="text-info fw-bold d-block mb-1">[P] Plan & Tratamiento:</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.plan}</p>
                      </div>
                    </div>

                    {c.observaciones && (
                      <div className="mt-3 pt-2 border-top">
                        <small className="text-muted fw-bold d-block">Observaciones / Indicaciones al tutor:</small>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, whiteSpace: "pre-line" }}>{c.observaciones}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default PetDetails;