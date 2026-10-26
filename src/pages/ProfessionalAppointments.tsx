import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Appointment } from "../types/Appointment";
import { apiFetch } from "../services/apiClient";
import { formatDate, formatTime } from "../utils/dateUtils";
import { getSpeciesIcon } from "../utils/speciesIcon";
import { MetricCard } from "../components/common/MetricCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { AppointmentStatusBadge } from "../components/common/AppointmentStatusBadge";

function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(appointments.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, appointments.length);
  const paginatedAppointments = appointments.slice(startIndex, endIndex);

  const cargarTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const turnos = await apiFetch<Appointment[]>("/turnos");
      setAppointments(turnos);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const handleStatusChange = async (appointmentId: number, nuevoEstado: string) => {
    try {
      await apiFetch(`/turnos/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      setAppointments((turnosActuales) =>
        turnosActuales.map((turno) =>
          turno.id === appointmentId
            ? {
                ...turno,
                estado: nuevoEstado as Appointment["estado"],
              }
            : turno
        )
      );
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el estado");
    }
  };

  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.estado === "pendiente" || a.estado === "confirmado").length;
  const completedCount = appointments.filter((a) => a.estado === "atendido" || a.estado === "completado").length;

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Agenda de Turnos Profesionales
            </h1>
            <p className="text-muted small mb-0">
              Gestión centralizada de atenciones, pacientes programados y estado de turnos
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link
              to="/profesional/triage"
              className="btn btn-outline-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
            >
              <i className="bi bi-heart-pulse text-danger"></i> Tablero de Triage
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <MetricCard
              label="Turnos Registrados"
              value={totalCount}
              icon="bi-calendar-check"
              iconBg="#F5F3FF"
              iconColor="#6D28D9"
            />
          </div>

          <div className="col-12 col-md-4">
            <MetricCard
              label="Pendientes / Confirmados"
              value={pendingCount}
              icon="bi-clock-history"
              iconBg="#FEF3C7"
              iconColor="#D97706"
            />
          </div>

          <div className="col-12 col-md-4">
            <MetricCard
              label="Atendidos / Completados"
              value={completedCount}
              icon="bi-check-circle"
              iconBg="#D1FAE5"
              iconColor="#059669"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando agenda de turnos..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="bi-calendar-check"
            title="No hay turnos registrados"
            description="Los turnos solicitados por los tutores aparecerán listados aquí."
          />
        ) : (
          <div className="bg-white rounded-3 border border-light-subtle shadow-sm overflow-hidden" style={{ borderColor: "#EDE9FE" }}>
            <div className="table-responsive mb-0">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: "#F8FAFC" }}>
                  <tr>
                    <th className="small fw-bold text-uppercase py-3 px-3" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Hora / Fecha
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Paciente & Especie
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Tutor & Contacto
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Motivo de Consulta
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Estado
                    </th>
                    <th className="small fw-bold text-uppercase py-3 px-3 text-end" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAppointments.map((appointment) => {
                    const timeStr = formatTime(appointment.fecha);
                    const dateStr = formatDate(appointment.fecha);

                    const mascotaNombre = appointment.mascota?.nombre || "Mascota";
                    const tutorNombre = appointment.usuario
                      ? `${appointment.usuario.nombre} ${appointment.usuario.apellido}`
                      : "Cliente general";
                    const tutorPhone = appointment.usuario?.telefono || "";

                    const isAtendido = appointment.estado === "atendido" || appointment.estado === "completado";
                    const isCancelado = appointment.estado === "cancelado";

                    return (
                      <tr key={appointment.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td className="py-3 px-3">
                          <span className="fw-bold d-block" style={{ color: "#1E1B4B", fontSize: "0.95rem" }}>
                            {timeStr} hs
                          </span>
                          <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                            {dateStr}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-2 d-flex align-items-center justify-content-center"
                              style={{ width: "34px", height: "34px", backgroundColor: "#F5F3FF", flexShrink: 0 }}
                            >
                              {getSpeciesIcon(appointment.mascota?.especie)}
                            </div>
                            <div>
                              <strong className="d-block" style={{ color: "#1E1B4B" }}>{mascotaNombre}</strong>
                              <small className="text-muted">
                                {appointment.mascota?.especie || "Especie no especificada"}
                                {appointment.mascota?.raza ? ` · ${appointment.mascota.raza}` : ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="d-block fw-medium text-dark">{tutorNombre}</span>
                          {tutorPhone && (
                            <small className="text-muted d-inline-flex align-items-center gap-1">
                              <i className="bi bi-telephone"></i> {tutorPhone}
                            </small>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="small text-secondary" style={{ maxWidth: "220px", display: "inline-block" }}>
                            {appointment.motivo || "Consulta de rutina"}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {isAtendido || isCancelado ? (
                            <AppointmentStatusBadge status={appointment.estado} />
                          ) : (
                            <select
                              value={appointment.estado}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                              className="form-select form-select-sm rounded-2 py-1 px-2"
                              style={{
                                width: "130px",
                                fontSize: "0.82rem",
                                borderColor: appointment.estado === "confirmado" ? "#A7F3D0" : "#FDE68A",
                                backgroundColor: appointment.estado === "confirmado" ? "#ECFDF5" : "#FFFBEB"
                              }}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3 px-3 text-end">
                          <div className="d-inline-flex align-items-center gap-2">
                            {!isCancelado && !isAtendido && (
                              <Link
                                to={`/profesional/atencion?mascotaId=${appointment.mascotaId}&turnoId=${appointment.id}`}
                                className="btn btn-primary rounded-2 btn-sm fw-medium shadow-sm px-3"
                                style={{ backgroundColor: "#6D28D9", borderColor: "#6D28D9" }}
                              >
                                Iniciar Atención
                              </Link>
                            )}
                            <Link
                              to={`/profesional/mascotas/${appointment.mascotaId}`}
                              className="btn btn-outline-secondary rounded-2 btn-sm fw-medium px-2"
                              title="Ver ficha completa"
                            >
                              Ficha
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#F1F5F9" }}
              >
                <span className="small text-muted">
                  Mostrando <strong>{appointments.length > 0 ? startIndex + 1 : 0}</strong> a{" "}
                  <strong>{endIndex}</strong> de <strong>{appointments.length}</strong> turnos
                </span>

                <nav aria-label="Paginación de turnos">
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link rounded-2 px-2 py-1 text-decoration-none"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i> Anterior
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                        <button
                          type="button"
                          className="page-link rounded-2 px-3 py-1"
                          style={{
                            backgroundColor: currentPage === page ? "var(--vet-primary, #6D28D9)" : "transparent",
                            borderColor: currentPage === page ? "var(--vet-primary, #6D28D9)" : "#E2E8F0",
                            color: currentPage === page ? "#FFFFFF" : "var(--vet-text-main, #1E1B4B)",
                          }}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link rounded-2 px-2 py-1 text-decoration-none"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfessionalAppointments;