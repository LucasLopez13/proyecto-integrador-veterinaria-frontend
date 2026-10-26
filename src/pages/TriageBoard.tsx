import React, { useEffect, useState } from "react";
import type { TriageItem, TriageColumn, CreateTriageDTO } from "../types/Triage";
import type { Appointment } from "../types/Appointment";
import { triageService } from "../services/triageService";
import { apiFetch } from "../services/apiClient";
import { isSameCalendarDay } from "../utils/dateUtils";
import { TriageCard } from "../components/triage/TriageCard";
import { NewTriageModal } from "../components/triage/NewTriageModal";
import { ReceptionQueue } from "../components/triage/ReceptionQueue";
import { ErrorModal } from "../components/common/ErrorModal";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { TIMERS } from "../constants";
import "../styles/TriageBoard.css";

interface ColumnConfig {
  key: TriageColumn;
  title: string;
  subtitle: string;
  indicatorColor: string;
}

const COLUMNAS: ColumnConfig[] = [
  {
    key: "CONSULTA_PROGRAMADA",
    title: "Consulta Programada",
    subtitle: "Turnos agendados y controles",
    indicatorColor: "#059669",
  },
  {
    key: "URGENCIA_MODERADA",
    title: "Urgencia Moderada",
    subtitle: "Atención prioritaria",
    indicatorColor: "#D97706",
  },
  {
    key: "EMERGENCIA_CRITICA",
    title: "Emergencia Crítica",
    subtitle: "Riesgo vital inmediato",
    indicatorColor: "#DC2626",
  },
  {
    key: "INTERNACION_QUIROFANO",
    title: "Internación / Quirófano",
    subtitle: "En cirugía o internación",
    indicatorColor: "#6D28D9",
  },
];

export const TriageBoard: React.FC = () => {
  const [items, setItems] = useState<TriageItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dragOverCol, setDragOverCol] = useState<TriageColumn | null>(null);

  const [isReceptionOpen, setIsReceptionOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetColumnForNew, setTargetColumnForNew] = useState<TriageColumn>("URGENCIA_MODERADA");
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const cargarTurnos = async () => {
    try {
      const data = await apiFetch<Appointment[]>("/turnos");
      setAppointments(data);
    } catch {
    }
  };

  const cargarTablero = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await triageService.getKanban();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor de triage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTablero();
    cargarTurnos();

    const timerId = setInterval(() => {
      triageService
        .getKanban()
        .then((data) => setItems(data))
        .catch(() => {});
      cargarTurnos();
    }, TIMERS.TRIAGE_POLLING_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, []);

  const handleMoverTarjeta = async (id: number, nuevaColumna: TriageColumn) => {
    const itemActual = items.find((it) => it.id === id);
    if (!itemActual || itemActual.columna === nuevaColumna) return;

    const itemsAnteriores = [...items];
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, columna: nuevaColumna } : it))
    );

    try {
      await triageService.moverTriage(id, nuevaColumna);
    } catch (err: any) {
      setItems(itemsAnteriores);
      setError(`No se pudo mover el paciente: ${err.message || "Error desconocido"}`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colKey: TriageColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, colKey: TriageColumn) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverCol === colKey) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, colKey: TriageColumn) => {
    e.preventDefault();
    setDragOverCol(null);

    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;

    const triageId = parseInt(rawData, 10);
    if (!isNaN(triageId)) {
      await handleMoverTarjeta(triageId, colKey);
    }
  };

  const handleFinalizar = (id: number, nombrePaciente: string) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      confirmVariant: "danger",
      title: "¿Egresar paciente de guardia?",
      message: `¿Deseas finalizar la atención y egresar a "${nombrePaciente}" del tablero de triage?\n\nEsta acción registrará la salida del paciente de la sala de espera de guardia.`,
      confirmText: "Egresar paciente",
      cancelText: "Mantener en guardia",
      onConfirm: async () => {
        try {
          await triageService.finalizarTriage(id);
          setItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err: any) {
          setError(`Error al egresar paciente: ${err.message || "Error desconocido"}`);
        }
      },
    });
  };

  const handleAdmitPatient = async (dto: CreateTriageDTO) => {
    const nuevo = await triageService.createTriage(dto);
    setItems((prev) => [nuevo, ...prev]);
    cargarTurnos();
  };

  const handleOpenModal = (col: TriageColumn = "URGENCIA_MODERADA") => {
    setTargetColumnForNew(col);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.nombrePaciente.toLowerCase().includes(term) ||
      (item.especie && item.especie.toLowerCase().includes(term)) ||
      (item.nombreTutor && item.nombreTutor.toLowerCase().includes(term)) ||
      item.motivo.toLowerCase().includes(term)
    );
  });

  const activeTriagePetIds = items.map((i) => i.mascotaId).filter(Boolean);

  const pendingReceptionAppointments = appointments.filter((appt) => {
    if (!isSameCalendarDay(appt.fecha)) return false;
    if (appt.estado === "atendido" || appt.estado === "cancelado") return false;
    if (activeTriagePetIds.includes(appt.mascotaId)) return false;
    return true;
  });

  const receptionCount = pendingReceptionAppointments.length;

  if (loading && items.length === 0) {
    return (
      <main className="triage-canvas">
        <LoadingSpinner message="Cargando tablero de guardia y triage..." />
      </main>
    );
  }

  return (
    <main className="triage-canvas">
      <div className="container-fluid px-0">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 fw-bold mb-0" style={{ color: "#1E1B4B" }}>
                Tablero de Triage & Urgencias
              </h1>
            </div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="live-pulse-dot" />
              <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                Sistema en vivo · Actualización automática
              </small>
            </div>
          </div>

          <div className="flex-grow-1" style={{ maxWidth: "340px" }}>
            <input
              type="text"
              className="form-control rounded-2"
              placeholder="Buscar por paciente o tutor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderColor: "var(--vet-border-tint, #EDE9FE)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-2 fw-medium d-inline-flex align-items-center gap-2 px-3 shadow-sm"
              onClick={() => setIsReceptionOpen(true)}
            >
              <i className="bi bi-inbox text-primary" style={{ color: "var(--vet-primary, #6D28D9)" }}></i>
              <span>Cola de Recepción</span>
              <span
                className="badge rounded-2"
                style={{
                  backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                  color: "var(--vet-primary, #6D28D9)",
                  border: "1px solid var(--vet-border-tint, #EDE9FE)",
                }}
              >
                {receptionCount}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-primary rounded-2 fw-medium d-inline-flex align-items-center gap-2 px-3 shadow-sm"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                borderColor: "var(--vet-primary, #6D28D9)",
              }}
              onClick={() => handleOpenModal("URGENCIA_MODERADA")}
            >
              <i className="bi bi-plus-lg"></i> Ingreso Directo
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger rounded-2 shadow-sm d-flex justify-content-between align-items-center mb-4">
            <span>{error}</span>
            <button className="btn btn-sm btn-outline-danger rounded-2" onClick={cargarTablero}>
              Reintentar
            </button>
          </div>
        )}

        <div className="kanban-board-scroll">
          {COLUMNAS.map((col) => {
            const colItems = filteredItems.filter((it) => it.columna === col.key);
            const isOver = dragOverCol === col.key;

            return (
              <div
                key={col.key}
                className={`kanban-column-container ${isOver ? "drop-zone-active" : ""}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-column-header-card">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: col.indicatorColor,
                          display: "inline-block",
                        }}
                      />
                      <h2 className="fs-6 fw-bold mb-0" style={{ color: "#1E1B4B" }}>
                        {col.title}
                      </h2>
                    </div>

                    <span
                      className="badge rounded-2 font-monospace fw-semibold"
                      style={{
                        backgroundColor: "#FAF9FC",
                        color: "#475569",
                        border: "1px solid #E2E8F0",
                        fontSize: "0.75rem",
                      }}
                    >
                      {colItems.length}
                    </span>
                  </div>

                  <p className="text-muted small mb-0" style={{ fontSize: "0.75rem" }}>
                    {col.subtitle}
                  </p>
                </div>

                <div className="kanban-cards-feed">
                  {colItems.length === 0 ? (
                    <div
                      className="text-center py-5 rounded-2 d-flex flex-column align-items-center justify-content-center flex-grow-1"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                        border: "1px dashed #CBD5E1",
                      }}
                    >
                      <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                        Sin pacientes en espera
                      </span>
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <TriageCard
                        key={item.id}
                        item={item}
                        onMover={handleMoverTarjeta}
                        onFinalizar={handleFinalizar}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReceptionQueue
        activeTriagePetIds={activeTriagePetIds}
        onAdmitPatient={handleAdmitPatient}
        isOpen={isReceptionOpen}
        onToggleOpen={() => setIsReceptionOpen(!isReceptionOpen)}
      />

      <NewTriageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdmitPatient}
        initialColumn={targetColumnForNew}
      />

      <ErrorModal
        error={error}
        title="Error en Tablero de Triage"
        onClose={() => setError(null)}
      />

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmText={feedbackModal.confirmText}
        cancelText={feedbackModal.cancelText}
        confirmVariant={feedbackModal.confirmVariant}
        onConfirm={feedbackModal.onConfirm}
        onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
      />
    </main>
  );
};

export default TriageBoard;
