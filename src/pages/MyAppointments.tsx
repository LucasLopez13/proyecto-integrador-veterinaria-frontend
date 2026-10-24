import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Appointment } from "../types/Appointment";
import { apiFetch } from "../services/apiClient";
import { MONTH_NAMES, formatTime } from "../utils/dateUtils";
import { getSpeciesIcon } from "../utils/speciesIcon";

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

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

  const handleCancelarTurno = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseás cancelar este turno?"
    );

    if (!confirmar) return;

    try {
      await apiFetch(`/turnos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "cancelado" }),
      });

      setAppointments((turnos) =>
        turnos.map((turno) =>
          turno.id === id ? { ...turno, estado: "cancelado" } : turno
        )
      );
    } catch (err: any) {
      setError(err.message || "Error al cancelar el turno");
    }
  };

  const nowForInput = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleReprogramarTurno = async (id: number) => {
    if (!nuevaFecha) {
      setError("Seleccioná una nueva fecha y hora para reprogramar");
      return;
    }

    if (new Date(nuevaFecha).getTime() <= Date.now()) {
      setError("No podés reprogramar un turno para una fecha u horario que ya ha transcurrido");
      return;
    }

    try {
      const turnoActualizado = await apiFetch<Appointment>(`/turnos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fecha: new Date(nuevaFecha).toISOString(),
        }),
      });

      setAppointments((turnos) =>
        turnos.map((turno) =>
          turno.id === id ? turnoActualizado : turno
        )
      );

      setReprogramandoId(null);
      setNuevaFecha("");
    } catch (err: any) {
      setError(err.message || "Error al reprogramar el turno");
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmado":
        return (
          <span className="badge rounded-2 px-2 py-1 bg-success-subtle text-success border border-success-subtle fw-medium d-inline-flex align-items-center gap-1">
            <i className="bi bi-check-circle"></i> Confirmado
          </span>
        );
      case "pendiente":
        return (
          <span className="badge rounded-2 px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-medium d-inline-flex align-items-center gap-1">
            <i className="bi bi-clock-history"></i> Pendiente
          </span>
        );
      case "atendido":
      case "completado":
        return (
          <span className="badge rounded-2 px-2 py-1 bg-purple-subtle text-purple-emphasis border border-purple-subtle fw-medium d-inline-flex align-items-center gap-1">
            <i className="bi bi-check2-circle"></i> Atendido
          </span>
        );
      case "cancelado":
        return (
          <span className="badge rounded-2 px-2 py-1 bg-danger-subtle text-danger border border-danger-subtle fw-medium d-inline-flex align-items-center gap-1">
            <i className="bi bi-x-circle"></i> Cancelado
          </span>
        );
      default:
        return (
          <span className="badge rounded-2 px-2 py-1 bg-light text-secondary border fw-medium">
            {estado}
          </span>
        );
    }
  };

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4" style={{ maxWidth: "860px" }}>

        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Mis Turnos
            </h1>
            <p className="text-muted small mb-0">
              Consultá y gestioná las próximas citas veterinarias de tus mascotas
            </p>
          </div>

          <Link
            to="/turnos/nuevo"
            className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
          >
            <span>+</span> Solicitar Nuevo Turno
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger rounded-2 shadow-sm mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3 border border-light-subtle p-5 text-center shadow-sm">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <p className="text-muted small mt-2 mb-0">Cargando tus turnos...</p>
          </div>
        ) : appointments.length === 0 ? (
          /* Sin turnos */
          <div className="bg-white rounded-3 border border-light-subtle p-5 text-center shadow-sm">
            <i className="bi bi-calendar-check fs-1 text-muted d-block mb-2"></i>
            <h2 className="h5 fw-bold" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              No tenés turnos solicitados
            </h2>
            <p className="text-muted small mb-3">
              Cuando solicites una cita, vas a poder darle seguimiento desde esta sección.
            </p>
            <Link
              to="/turnos/nuevo"
              className="btn btn-primary rounded-2 px-3 fw-medium d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-lg"></i> Solicitar mi primer turno
            </Link>
          </div>
        ) : (
          /* Stack of Appointment Cards */
          <div className="d-flex flex-column gap-3">
            {appointments.map((appointment) => {
              const d = new Date(appointment.fecha);
              const day = String(d.getDate()).padStart(2, "0");
              const month = MONTH_NAMES[d.getMonth()] || "";
              const hours = String(d.getHours()).padStart(2, "0");
              const mins = String(d.getMinutes()).padStart(2, "0");
              const timeStr = `${hours}:${mins} hs`;

              const mascotaNombre = appointment.mascota?.nombre || "Mascota";
              const isReprogramando = reprogramandoId === appointment.id;
              const isPastOrCancelled = ["cancelado", "completado", "atendido"].includes(appointment.estado);

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-3 border border-light-subtle p-3 shadow-sm transition-all"
                  style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
                >
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    
                    {/* Left: Date Block & Info */}
                    <div className="d-flex align-items-center gap-3">
                      {/* Compact rectangular Date Block */}
                      <div
                        className="rounded-2 d-flex flex-column align-items-center justify-content-center p-2 text-center"
                        style={{
                          width: "74px",
                          height: "74px",
                          backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                          border: "1px solid var(--vet-border-tint, #EDE9FE)",
                          flexShrink: 0
                        }}
                      >
                        <span className="small text-uppercase fw-semibold" style={{ color: "var(--vet-primary, #6D28D9)", fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                          {month}
                        </span>
                        <span className="fw-bold" style={{ color: "var(--vet-text-main, #1E1B4B)", fontSize: "1.3rem", lineHeight: 1.1 }}>
                          {day}
                        </span>
                        <span className="small font-monospace" style={{ color: "var(--vet-primary, #6D28D9)", fontSize: "0.75rem" }}>
                          {timeStr}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <h3 className="h6 fw-bold mb-0 d-inline-flex align-items-center gap-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            {getSpeciesIcon(appointment.mascota?.especie)} {mascotaNombre}
                          </h3>
                          {getStatusBadge(appointment.estado)}
                        </div>

                        <p className="small text-muted mb-0">
                          <strong>Motivo:</strong> {appointment.motivo || "Consulta de rutina / Revisión"}
                        </p>
                        <small className="text-secondary" style={{ fontSize: "0.8rem" }}>
                          Veterinario: <span className="fw-medium text-dark">Servicio General VetCare</span>
                        </small>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {!isPastOrCancelled && (
                      <div className="d-flex align-items-center gap-2 flex-shrink-0 align-self-sm-center">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-2 btn-sm fw-medium px-3"
                          onClick={() => {
                            if (isReprogramando) {
                              setReprogramandoId(null);
                            } else {
                              setReprogramandoId(appointment.id);
                              setNuevaFecha("");
                            }
                          }}
                        >
                          {isReprogramando ? "Cerrar" : "Reprogramar"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-2 btn-sm fw-medium px-3"
                          onClick={() => handleCancelarTurno(appointment.id)}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reschedule inline drawer */}
                  {isReprogramando && (
                    <div
                      className="mt-3 pt-3 border-top border-light-subtle d-flex flex-column flex-sm-row align-items-sm-center gap-2"
                      style={{ backgroundColor: "#FAF9FC", padding: "12px", borderRadius: "6px" }}
                    >
                      <label htmlFor={`reschedule-date-${appointment.id}`} className="small fw-semibold text-muted mb-0">
                        Nueva fecha y hora:
                      </label>
                      <input
                        id={`reschedule-date-${appointment.id}`}
                        type="datetime-local"
                        min={nowForInput}
                        value={nuevaFecha}
                        onChange={(e) => setNuevaFecha(e.target.value)}
                        className="form-control form-control-sm rounded-2"
                        style={{ maxWidth: "240px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleReprogramarTurno(appointment.id)}
                        className="btn btn-primary btn-sm rounded-2 fw-medium px-3"
                      >
                        Confirmar Reprogramación
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

export default MyAppointments;