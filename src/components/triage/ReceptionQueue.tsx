import React, { useEffect, useState } from "react";
import type { Appointment } from "../../types/Appointment";
import type { Pet } from "../../types/Pet";
import type { CreateTriageDTO, TriageColumn } from "../../types/Triage";

interface ReceptionQueueProps {
  activeTriagePetIds: (number | null | undefined)[];
  onAdmitPatient: (data: CreateTriageDTO, appointmentId?: number) => Promise<void>;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export const ReceptionQueue: React.FC<ReceptionQueueProps> = ({
  activeTriagePetIds,
  onAdmitPatient,
  isOpen,
  onToggleOpen,
}) => {
  const [tab, setTab] = useState<"turnos" | "mascotas">("turnos");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      const [turnosRes, petsRes] = await Promise.all([
        fetch(`${API_URL}/turnos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/mascotas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (turnosRes.ok) {
        const turnosData = await turnosRes.json();
        setAppointments(turnosData);
      }

      if (petsRes.ok) {
        const petsData = await petsRes.json();
        setPets(petsData);
      }
    } catch (err) {
      console.error("Error al cargar pacientes para bandeja de entrada:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSpeciesIcon = (especie: string) => {
    const esp = (especie || "").toLowerCase();
    if (esp.includes("can") || esp.includes("perr")) return "🐶";
    if (esp.includes("fel") || esp.includes("gat")) return "🐱";
    if (esp.includes("av") || esp.includes("paj")) return "🦜";
    if (esp.includes("cone") || esp.includes("roed")) return "🐰";
    return "🐾";
  };

  // Filtrar turnos no atendidos ni cancelados, y que NO estén ya activos en el tablero de triage
  const availableAppointments = appointments.filter((appt) => {
    if (appt.estado === "atendido" || appt.estado === "cancelado") return false;
    if (activeTriagePetIds.includes(appt.mascotaId)) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const petName = (appt.mascota?.nombre || "").toLowerCase();
    const ownerName = appt.usuario
      ? `${appt.usuario.nombre} ${appt.usuario.apellido}`.toLowerCase()
      : "";
    const reason = (appt.motivo || "").toLowerCase();
    return petName.includes(q) || ownerName.includes(q) || reason.includes(q);
  });

  // Filtrar mascotas registradas que no estén ya en triage
  const availablePets = pets.filter((p) => {
    if (activeTriagePetIds.includes(p.id)) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const petName = (p.nombre || "").toLowerCase();
    const ownerName = p.usuario
      ? `${p.usuario.nombre} ${p.usuario.apellido}`.toLowerCase()
      : "";
    return petName.includes(q) || ownerName.includes(q);
  });

  // Handler para iniciar arrastre
  const handleDragStartFromAppointment = (
    e: React.DragEvent<HTMLDivElement>,
    appt: Appointment
  ) => {
    const payload = {
      appointmentId: appt.id,
      mascotaId: appt.mascotaId,
      nombrePaciente: appt.mascota?.nombre || "Paciente",
      especie: appt.mascota?.especie || "Canino",
      raza: appt.mascota?.raza || "",
      nombreTutor: appt.usuario
        ? `${appt.usuario.nombre} ${appt.usuario.apellido}`.trim()
        : "",
      telefonoTutor: appt.usuario?.telefono || "",
      motivo: appt.motivo || "Consulta médica general",
    };
    e.dataTransfer.setData("text/plain", `reception:${JSON.stringify(payload)}`);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handleDragStartFromPet = (
    e: React.DragEvent<HTMLDivElement>,
    pet: Pet
  ) => {
    const payload = {
      mascotaId: pet.id,
      nombrePaciente: pet.nombre,
      especie: pet.especie || "Canino",
      raza: pet.raza || "",
      nombreTutor: pet.usuario
        ? `${pet.usuario.nombre} ${pet.usuario.apellido}`.trim()
        : "",
      telefonoTutor: pet.usuario?.telefono || "",
      motivo: "Ingreso espontáneo a guardia",
    };
    e.dataTransfer.setData("text/plain", `reception:${JSON.stringify(payload)}`);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  // Admisión rápida mediante botones
  const handleQuickAdmitAppointment = (
    appt: Appointment,
    columna: TriageColumn
  ) => {
    onAdmitPatient(
      {
        columna,
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

  const handleQuickAdmitPet = (pet: Pet, columna: TriageColumn) => {
    onAdmitPatient({
      columna,
      mascotaId: pet.id,
      nombrePaciente: pet.nombre,
      especie: pet.especie || "Canino",
      raza: pet.raza || undefined,
      nombreTutor: pet.usuario
        ? `${pet.usuario.nombre} ${pet.usuario.apellido}`.trim()
        : undefined,
      telefonoTutor: pet.usuario?.telefono || undefined,
      motivo: "Ingreso espontáneo a guardia",
    });
  };

  return (
    <aside
      className={`reception-queue-panel ${isOpen ? "open" : "collapsed"}`}
      aria-label="Bandeja de pacientes en recepción"
    >
      <div className="reception-queue-header">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5">📥</span>
            <div>
              <h4 className="reception-title mb-0">Recepción y Turnos</h4>
              <small className="text-muted">
                {availableAppointments.length} turnos listos para arrastrar
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onToggleOpen}
            title={isOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"}
          >
            {isOpen ? "◀ Ocultar" : "▶ Ver Turnos"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="reception-queue-content">
          {/* Instrucción visual destacada */}
          <div className="reception-tip mb-3 p-2 rounded bg-light border">
            <small className="text-primary d-flex align-items-center gap-1 fw-semibold">
              <span>💡</span> <strong>Tip:</strong> ¡Arrastrá la tarjetita a la columna deseada o usá los botones de colores!
            </small>
          </div>

          {/* Filtro y pestañas */}
          <div className="btn-group w-100 mb-2" role="group">
            <button
              type="button"
              className={`btn btn-sm ${
                tab === "turnos" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTab("turnos")}
            >
              📅 Turnos ({availableAppointments.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                tab === "mascotas" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTab("mascotas")}
            >
              🐾 Pacientes ({availablePets.length})
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="🔍 Filtrar nombre, tutor..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted small">
              Cargando pacientes...
            </div>
          ) : tab === "turnos" ? (
            <div className="reception-cards-list">
              {availableAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <span>✅</span> No hay turnos pendientes para clasificar.
                </div>
              ) : (
                availableAppointments.map((appt) => {
                  const fecha = new Date(appt.fecha);
                  const hora = fecha.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={appt.id}
                      className="incoming-patient-card"
                      draggable
                      onDragStart={(e) => handleDragStartFromAppointment(e, appt)}
                    >
                      <div className="incoming-card-top">
                        <span className="species-icon">
                          {getSpeciesIcon(appt.mascota?.especie || "")}
                        </span>
                        <div className="flex-grow-1">
                          <h6 className="mb-0 fw-bold">
                            {appt.mascota?.nombre || "Paciente"}
                          </h6>
                          <small className="text-muted d-block">
                            {appt.mascota?.especie} {appt.mascota?.raza ? `• ${appt.mascota.raza}` : ""}
                          </small>
                        </div>
                        <span className="badge bg-primary-subtle text-primary border">
                          ⏰ {hora}
                        </span>
                      </div>

                      <div className="incoming-card-body my-1">
                        <p className="mb-1 small text-dark">
                          <strong>Motivo:</strong> {appt.motivo}
                        </p>
                        {appt.usuario && (
                          <small className="text-muted d-block">
                            👤 {appt.usuario.nombre} {appt.usuario.apellido}
                            {appt.usuario.telefono ? ` (📞 ${appt.usuario.telefono})` : ""}
                          </small>
                        )}
                      </div>

                      <div className="incoming-card-footer mt-2 pt-2 border-top">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                            🖐️ Arrastrar o clasificar:
                          </span>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm py-0 px-1 flex-grow-1"
                            style={{ fontSize: "0.72rem" }}
                            title="Clasificar como Emergencia Crítica"
                            onClick={() => handleQuickAdmitAppointment(appt, "EMERGENCIA_CRITICA")}
                          >
                            🔴 Crítica
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-sm py-0 px-1 flex-grow-1"
                            style={{ fontSize: "0.72rem" }}
                            title="Clasificar como Urgencia Moderada"
                            onClick={() => handleQuickAdmitAppointment(appt, "URGENCIA_MODERADA")}
                          >
                            🟡 Urgente
                          </button>
                          <button
                            type="button"
                            className="btn btn-success btn-sm py-0 px-1 flex-grow-1"
                            style={{ fontSize: "0.72rem" }}
                            title="Clasificar como Consulta Programada"
                            onClick={() => handleQuickAdmitAppointment(appt, "CONSULTA_PROGRAMADA")}
                          >
                            🟢 Programada
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm py-0 px-1 flex-grow-1"
                            style={{ fontSize: "0.72rem" }}
                            title="Ingresar a Quirófano / Internación"
                            onClick={() => handleQuickAdmitAppointment(appt, "INTERNACION_QUIROFANO")}
                          >
                            🏥 Sala
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="reception-cards-list">
              {availablePets.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No se encontraron mascotas disponibles.
                </div>
              ) : (
                availablePets.map((pet) => (
                  <div
                    key={pet.id}
                    className="incoming-patient-card"
                    draggable
                    onDragStart={(e) => handleDragStartFromPet(e, pet)}
                  >
                    <div className="incoming-card-top">
                      <span className="species-icon">{getSpeciesIcon(pet.especie)}</span>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{pet.nombre}</h6>
                        <small className="text-muted d-block">
                          {pet.especie} {pet.raza ? `• ${pet.raza}` : ""}
                        </small>
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        Ficha #{pet.id}
                      </span>
                    </div>

                    <div className="incoming-card-body my-1">
                      {pet.usuario && (
                        <small className="text-muted d-block">
                          👤 Tutor: {pet.usuario.nombre} {pet.usuario.apellido}
                        </small>
                      )}
                    </div>

                    <div className="incoming-card-footer mt-2 pt-2 border-top">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm py-0 px-1 flex-grow-1"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => handleQuickAdmitPet(pet, "EMERGENCIA_CRITICA")}
                        >
                          🔴 Crítica
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm py-0 px-1 flex-grow-1"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => handleQuickAdmitPet(pet, "URGENCIA_MODERADA")}
                        >
                          🟡 Urgente
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm py-0 px-1 flex-grow-1"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => handleQuickAdmitPet(pet, "CONSULTA_PROGRAMADA")}
                        >
                          🟢 Programada
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm py-0 px-1 flex-grow-1"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => handleQuickAdmitPet(pet, "INTERNACION_QUIROFANO")}
                        >
                          🏥 Sala
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
