import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import { apiFetch } from "../services/apiClient";
import { getSpeciesIcon } from "../utils/speciesIcon";
import { MetricCard } from "../components/common/MetricCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

interface PetDirectoryItem extends Pet {
  turnos?: {
    id: number;
    fecha: string;
    estado: string;
    motivo?: string;
  }[];
  triages?: {
    id: number;
    columna: string;
    motivo: string;
    estado: string;
    fechaLlegada: string;
    turnoId?: number | null;
  }[];
  consultas?: {
    id: number;
    fecha: string;
  }[];
}

function esIngresoDirectoSinTurno(pet: PetDirectoryItem): boolean {
  const emailTutor = pet.dueno?.email || pet.usuario?.email || "";
  const tieneEmailGuardia = emailTutor.endsWith("@vetcare.local");
  const tieneTurnos = Array.isArray(pet.turnos) && pet.turnos.length > 0;
  const tieneTriageDirecto =
    Array.isArray(pet.triages) &&
    pet.triages.some((tr) => !tr.turnoId);

  if (tieneEmailGuardia) return true;
  if (!tieneTurnos && tieneTriageDirecto) return true;
  if (!tieneTurnos && (pet.raza || "").toLowerCase().includes("ingreso directo")) {
    return true;
  }
  return false;
}

function ProfessionalPatients() {
  const [pets, setPets] = useState<PetDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"todos" | "registrados" | "ingreso_directo">("todos");

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<PetDirectoryItem[]>("/mascotas");
      setPets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "No se pudo cargar el padron de pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarPacientes();
  }, []);

  const totalCount = pets.length;
  const ingresoDirectoCount = pets.filter((p) => esIngresoDirectoSinTurno(p)).length;
  const registradosCount = totalCount - ingresoDirectoCount;

  const filteredPets = pets.filter((pet) => {
    const esDirecto = esIngresoDirectoSinTurno(pet);
    if (filter === "registrados" && esDirecto) return false;
    if (filter === "ingreso_directo" && !esDirecto) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const tutor = pet.dueno || pet.usuario;
    const tutorNombre = tutor ? `${tutor.nombre} ${tutor.apellido}`.toLowerCase() : "";
    const tutorTelefono = tutor?.telefono ? tutor.telefono.toLowerCase() : "";

    return (
      pet.nombre.toLowerCase().includes(term) ||
      (pet.especie && pet.especie.toLowerCase().includes(term)) ||
      (pet.raza && pet.raza.toLowerCase().includes(term)) ||
      tutorNombre.includes(term) ||
      tutorTelefono.includes(term)
    );
  });

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "var(--vet-bg-canvas, #FAF9FC)",
        paddingBottom: "60px",
      }}
    >
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1
              className="h3 fw-bold mb-1"
              style={{ color: "var(--vet-text-main, #1E1B4B)" }}
            >
              Directorio de Pacientes
            </h1>
            <p className="text-muted small mb-0">
              Padron clinico unificado: mascotas registradas por sus dueños y
              pacientes ingresados por guardia sin turno
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Link
              to="/profesional/triage"
              className="btn btn-outline-secondary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
            >
              <i className="bi bi-heart-pulse text-danger"></i> Tablero de Triage
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger rounded-2 shadow-sm mb-4">
            {error}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <MetricCard
              label="Total Pacientes"
              value={totalCount}
              icon="bi-heart"
              iconBg="#F5F3FF"
              iconColor="#6D28D9"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              label="Registrados por Dueño"
              value={registradosCount}
              icon="bi-person-check"
              iconBg="#D1FAE5"
              iconColor="#059669"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              label="Ingreso Directo / Sin Turno"
              value={ingresoDirectoCount}
              icon="bi-hospital"
              iconBg="#FEF3C7"
              iconColor="#D97706"
            />
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            {[
              { value: "todos", label: "Todos los pacientes", icon: "bi-collection" },
              {
                value: "registrados",
                label: "Registrados por Dueño",
                icon: "bi-calendar-check",
              },
              {
                value: "ingreso_directo",
                label: "Ingreso Directo / Sin Turno",
                icon: "bi-lightning-charge",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`btn btn-sm rounded-2 fw-medium d-inline-flex align-items-center gap-1 shadow-sm px-3 ${
                  filter === opt.value
                    ? "btn-primary text-white"
                    : "btn-outline-secondary bg-white text-dark border"
                }`}
                style={
                  filter === opt.value
                    ? {
                        backgroundColor: "var(--vet-primary, #6D28D9)",
                        borderColor: "var(--vet-primary, #6D28D9)",
                      }
                    : { borderColor: "var(--vet-border-tint, #EDE9FE)" }
                }
                onClick={() =>
                  setFilter(
                    opt.value as "todos" | "registrados" | "ingreso_directo"
                  )
                }
              >
                <i className={`bi ${opt.icon}`}></i>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex-grow-1" style={{ maxWidth: "340px" }}>
            <input
              type="text"
              className="form-control form-control-sm rounded-2"
              placeholder="Buscar por mascota, especie, raza o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando directorio de pacientes..." />
        ) : filteredPets.length === 0 ? (
          <EmptyState
            icon="bi-heart"
            title="No se encontraron pacientes"
            description="No hay animales que coincidan con el filtro o busqueda actual."
          />
        ) : (
          <div
            className="bg-white rounded-3 border shadow-sm overflow-hidden"
            style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
          >
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: "#F8FAFC" }}>
                  <tr>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-secondary">
                      Paciente
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-secondary">
                      Origen / Modalidad
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-secondary">
                      Tutor Responsable
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-secondary">
                      Datos Clinicos
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-secondary text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map((pet) => {
                    const esDirecto = esIngresoDirectoSinTurno(pet);
                    const tutor = pet.dueno || pet.usuario;
                    const triageActivo = pet.triages?.find(
                      (tr) => tr.estado === "ACTIVO"
                    );
                    const cantConsultas = pet.consultas?.length || 0;

                    return (
                      <tr
                        key={pet.id}
                        style={{ borderBottom: "1px solid #F1F5F9" }}
                      >
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-2 d-flex align-items-center justify-content-center"
                              style={{
                                width: "38px",
                                height: "38px",
                                backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                                flexShrink: 0,
                              }}
                            >
                              {getSpeciesIcon(pet.especie)}
                            </div>
                            <div>
                              <strong
                                className="d-block"
                                style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                              >
                                {pet.nombre}
                              </strong>
                              <small className="text-muted">
                                {pet.especie}
                                {pet.raza ? ` · ${pet.raza}` : ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            {esDirecto ? (
                              <span
                                className="badge rounded-pill px-3 py-1 fw-semibold"
                                style={{
                                  backgroundColor: "#FFFBEB",
                                  color: "#D97706",
                                  border: "1px solid #FDE68A",
                                }}
                              >
                                <i className="bi bi-lightning-charge me-1"></i>
                                Ingreso Directo / Sin Turno
                              </span>
                            ) : (
                              <span
                                className="badge rounded-pill px-3 py-1 fw-semibold"
                                style={{
                                  backgroundColor: "#ECFDF5",
                                  color: "#059669",
                                  border: "1px solid #A7F3D0",
                                }}
                              >
                                <i className="bi bi-person-check me-1"></i>
                                Registrado por Tutor
                              </span>
                            )}

                            {triageActivo && (
                              <span
                                className="badge rounded-pill px-2 py-1 fw-semibold"
                                style={{
                                  backgroundColor: "#FEF2F2",
                                  color: "#DC2626",
                                  border: "1px solid #FECACA",
                                }}
                              >
                                En Guardia
                              </span>
                            )}
                          </div>
                          {triageActivo?.motivo && (
                            <small className="text-muted d-block mt-1">
                              Motivo guardia: {triageActivo.motivo}
                            </small>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="fw-medium text-dark d-block">
                            {tutor
                              ? `${tutor.nombre} ${tutor.apellido}`.trim()
                              : "Sin tutor especificado"}
                          </span>
                          {tutor?.telefono && (
                            <small className="text-muted d-inline-flex align-items-center gap-1">
                              <i className="bi bi-telephone"></i> {tutor.telefono}
                            </small>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="small text-secondary">
                            <span>
                              Peso:{" "}
                              <strong className="text-dark">
                                {pet.peso ? `${pet.peso} kg` : "A registrar"}
                              </strong>
                            </span>
                            {" · "}
                            <span>
                              Consultas SOAP:{" "}
                              <strong className="text-dark">{cantConsultas}</strong>
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-end">
                          <div className="d-inline-flex align-items-center gap-2">
                            <Link
                              to={`/profesional/atencion?mascotaId=${pet.id}`}
                              className="btn btn-primary rounded-2 btn-sm fw-medium shadow-sm py-1 px-3 d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: "var(--vet-primary, #6D28D9)",
                                borderColor: "var(--vet-primary, #6D28D9)",
                                fontSize: "0.82rem",
                              }}
                            >
                              <i className="bi bi-clipboard2-pulse"></i>
                              Atender
                            </Link>
                            <Link
                              to={`/profesional/mascotas/${pet.id}`}
                              className="btn btn-outline-secondary rounded-2 btn-sm fw-medium py-1 px-2"
                              style={{ fontSize: "0.82rem" }}
                            >
                              Ficha Clinica
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfessionalPatients;
