import React, { useEffect, useState } from "react";
import type { Appointment } from "../../types/Appointment";
import type { CreateTriageDTO, TriageColumn } from "../../types/Triage";
import { apiFetch } from "../../services/apiClient";
import { formatTime, isSameCalendarDay } from "../../utils/dateUtils";

interface ReceptionQueueProps {
  activeTriagePetIds: (number | null | undefined)[];
  onAdmitPatient: (data: CreateTriageDTO, appointmentId?: number) => Promise<void>;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ReceptionQueue: React.FC<ReceptionQueueProps> = ({
  activeTriagePetIds,
  onAdmitPatient,
  isOpen,
  onToggleOpen,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const turnosData = await apiFetch<Appointment[]>("/turnos");
      setAppointments(turnosData);
    } catch {
      // Manejo silencioso en drawer de fondo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filtrar estrictamente solo turnos del día de hoy no atendidos/cancelados y que no estén ya en el tablero
  const availableAppointments = appointments.filter((appt) => {
    if (!isSameCalendarDay(appt.fecha)) return false;
    if (appt.estado === "atendido" || appt.estado === "cancelado") return false;
    if (activeTriagePetIds.includes(appt.mascotaId)) return false;
    return true;
  });

  const handleAdmitAppointment = (appt: Appointment, col: TriageColumn) => {
    onAdmitPatient(
      {
        columna: col,
        mascotaId: appt.mascotaId,
        nombrePaciente: appt.mascota?.nombre || "Paciente",
        especie: appt.mascota?.especie || "Canino",
        raza: appt.mascota?.raza || undefined,
        nombreTutor: appt.usuario
          ? `${appt.usuario.nombre} ${appt.usuario.apellido}`.trim()
          : undefined,
        telefonoTutor: appt.usuario?.telefono || undefined,
        motivo: appt.motivo || "Consulta agendada",
      },
      appt.id
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="reception-offcanvas-backdrop" onClick={onToggleOpen} />
      <aside className="reception-offcanvas-panel" aria-label="Cola de Admisión y Recepción">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom border-light-subtle">
          <div>
            <h3 className="h5 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Cola de Admisión y Recepción
            </h3>
            <p className="text-muted small mb-0">
              Pacientes con turno confirmado para hoy
            </p>
          </div>
          <button
            type="button"
            className="btn btn-light rounded-2 btn-sm text-secondary p-1"
            onClick={onToggleOpen}
            aria-label="Cerrar panel"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Counter Badge */}
        <div className="mb-3">
          <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1 fw-medium">
            Turnos agendados para hoy ({availableAppointments.length})
          </span>
        </div>

        {/* List Feed */}
        <div className="flex-grow-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted small">Cargando cola de recepción...</div>
          ) : availableAppointments.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              <i className="bi bi-calendar3 fs-3 text-muted d-block mb-1"></i>
              No hay turnos pendientes para el día de hoy.
            </div>
          ) : (
            availableAppointments.map((appt) => {
              const hora = formatTime(appt.fecha);

              return (
                <div key={appt.id} className="admission-feed-card">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-5">{getSpeciesIcon(appt.mascota?.especie || "")}</span>
                      <div>
                        <strong className="d-block" style={{ color: "var(--vet-text-main, #1E1B4B)", fontSize: "0.95rem" }}>
                          {appt.mascota?.nombre || "Paciente"}
                        </strong>
                        <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                          {appt.mascota?.especie} {appt.mascota?.raza ? `· ${appt.mascota.raza}` : ""}
                        </small>
                      </div>
                    </div>
                    <span className="badge rounded-1 font-monospace" style={{ backgroundColor: "#F5F3FF", color: "#6D28D9" }}>
                      {hora} hs
                    </span>
                  </div>

                  <p className="small text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                    <strong>Motivo:</strong> {appt.motivo || "Control agendado"}
                  </p>

                  {appt.usuario && (
                    <small className="text-secondary d-block mb-2" style={{ fontSize: "0.78rem" }}>
                      Tutor: {appt.usuario.nombre} {appt.usuario.apellido}
                    </small>
                  )}

                  <div className="d-flex justify-content-end gap-1 pt-2 border-top border-light-subtle">
                    <span className="small text-muted me-auto align-self-center" style={{ fontSize: "0.75rem" }}>
                      Admitir a:
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-2 py-0 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleAdmitAppointment(appt, "CONSULTA_PROGRAMADA")}
                    >
                      Programada
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning rounded-2 py-0 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleAdmitAppointment(appt, "URGENCIA_MODERADA")}
                    >
                      Urgencia
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-2 py-0 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleAdmitAppointment(appt, "EMERGENCIA_CRITICA")}
                    >
                      Emergencia
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </aside>
    </>
  );
};
