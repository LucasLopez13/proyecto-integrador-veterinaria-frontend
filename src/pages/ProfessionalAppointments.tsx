import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Appointment } from "../types/Appointment";
import { apiFetch } from "../services/apiClient";
import { formatDate, formatTime } from "../utils/dateUtils";
import { getSpeciesIcon } from "../utils/speciesIcon";

function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Metrics calculation
  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.estado === "pendiente" || a.estado === "confirmado").length;
  const completedCount = appointments.filter((a) => a.estado === "atendido" || a.estado === "completado").length;

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4">

        {/* Header */}
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

        {/* Top Metric Cards with Lavender Highlight */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div
              className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between"
              style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
            >
              <div>
                <span className="small text-uppercase fw-semibold" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  Turnos Registrados
                </span>
                <h2 className="h3 fw-bold mb-0 mt-1" style={{ color: "#1E1B4B" }}>
                  {totalCount}
                </h2>
              </div>
              <div
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", backgroundColor: "#F5F3FF", color: "#6D28D9", fontSize: "1.4rem" }}
              >
                <i className="bi bi-calendar-check"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between"
              style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
            >
              <div>
                <span className="small text-uppercase fw-semibold" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  Pendientes / Confirmados
                </span>
                <h2 className="h3 fw-bold mb-0 mt-1" style={{ color: "#D97706" }}>
                  {pendingCount}
                </h2>
              </div>
              <div
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", backgroundColor: "#FEF3C7", color: "#D97706", fontSize: "1.4rem" }}
              >
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between"
              style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
            >
              <div>
                <span className="small text-uppercase fw-semibold" style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  Atendidos / Completados
                </span>
                <h2 className="h3 fw-bold mb-0 mt-1" style={{ color: "#059669" }}>
                  {completedCount}
                </h2>
              </div>
              <div
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", backgroundColor: "#D1FAE5", color: "#059669", fontSize: "1.4rem" }}
              >
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-3 border border-light-subtle p-5 text-center shadow-sm">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <p className="text-muted small mt-2 mb-0">Cargando agenda de turnos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3 border border-light-subtle p-5 text-center shadow-sm">
            <i className="bi bi-calendar-check fs-1 text-muted d-block mb-2"></i>
            <h2 className="h5 fw-bold" style={{ color: "#1E1B4B" }}>No hay turnos registrados</h2>
            <p className="text-muted small mb-0">
              Los turnos solicitados por los tutores aparecerán listados aquí.
            </p>
          </div>
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
                  {appointments.map((appointment) => {
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
                        {/* Time */}
                        <td className="py-3 px-3">
                          <span className="fw-bold d-block" style={{ color: "#1E1B4B", fontSize: "0.95rem" }}>
                            {timeStr} hs
                          </span>
                          <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                            {dateStr}
                          </span>
                        </td>

                        {/* Pet */}
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

                        {/* Tutor */}
                        <td className="py-3 px-3">
                          <span className="d-block fw-medium text-dark">{tutorNombre}</span>
                          {tutorPhone && (
                            <small className="text-muted d-inline-flex align-items-center gap-1">
                              <i className="bi bi-telephone"></i> {tutorPhone}
                            </small>
                          )}
                        </td>

                        {/* Motivo */}
                        <td className="py-3 px-3">
                          <span className="small text-secondary" style={{ maxWidth: "220px", display: "inline-block" }}>
                            {appointment.motivo || "Consulta de rutina"}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-3">
                          {isAtendido ? (
                            <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1 d-inline-flex align-items-center gap-1">
                              <i className="bi bi-check2-circle"></i> Atendido
                            </span>
                          ) : isCancelado ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-2 px-2 py-1 d-inline-flex align-items-center gap-1">
                              <i className="bi bi-x-circle"></i> Cancelado
                            </span>
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

                        {/* Actions */}
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
          </div>
        )}

      </div>
    </main>
  );
}

export default ProfessionalAppointments;