import React, { useEffect, useState } from "react";
import type { TriageItem, TriageColumn, CreateTriageDTO } from "../types/Triage";
import { triageService } from "../services/triageService";
import { TriageCard } from "../components/triage/TriageCard";
import { NewTriageModal } from "../components/triage/NewTriageModal";
import "../styles/TriageBoard.css";

interface ColumnConfig {
  key: TriageColumn;
  title: string;
  subtitle: string;
  icon: string;
  badgeClass: string;
  themeColor: string;
}

// Orden requerido: Consulta programada, Urgencia moderada, Emergencia Crítica e Internación/Quirófano
const COLUMNAS: ColumnConfig[] = [
  {
    key: "CONSULTA_PROGRAMADA",
    title: "Consulta Programada",
    subtitle: "Turnos agendados del día y controles",
    icon: "🟢",
    badgeClass: "badge-programada",
    themeColor: "#198754",
  },
  {
    key: "URGENCIA_MODERADA",
    title: "Urgencia Moderada",
    subtitle: "Atención prioritaria - Monitoreo constante",
    icon: "🟡",
    badgeClass: "badge-moderada",
    themeColor: "#ffc107",
  },
  {
    key: "EMERGENCIA_CRITICA",
    title: "Emergencia Crítica",
    subtitle: "Riesgo vital - Atención inmediata",
    icon: "🔴",
    badgeClass: "badge-critica",
    themeColor: "#dc3545",
  },
  {
    key: "INTERNACION_QUIROFANO",
    title: "Internación / Quirófano",
    subtitle: "En cirugía, anestesia o internación activa",
    icon: "🏥",
    badgeClass: "badge-internacion",
    themeColor: "#0d6efd",
  },
];

export const TriageBoard: React.FC = () => {
  const [items, setItems] = useState<TriageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dragOverCol, setDragOverCol] = useState<TriageColumn | null>(null);

  // Modal para ingresar paciente sin turno o walk-in
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetColumnForNew, setTargetColumnForNew] = useState<TriageColumn>("URGENCIA_MODERADA");

  const cargarTablero = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || "";
      const data = await triageService.getKanban(token);
      setItems(data);
    } catch (err: any) {
      console.error("Error al cargar tablero de triage:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTablero();

    // Auto-recarga periódica cada 30 segundos
    const timerId = setInterval(() => {
      const token = localStorage.getItem("token") || "";
      if (token) {
        triageService
          .getKanban(token)
          .then((data) => setItems(data))
          .catch(() => {});
      }
    }, 30000);

    return () => clearInterval(timerId);
  }, []);

  // Mover tarjeta (Drag & Drop o Selector)
  const handleMoverTarjeta = async (id: number, nuevaColumna: TriageColumn) => {
    const itemActual = items.find((it) => it.id === id);
    if (!itemActual || itemActual.columna === nuevaColumna) return;

    // Actualización optimista en el front
    const itemsAnteriores = [...items];
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, columna: nuevaColumna } : it))
    );

    try {
      const token = localStorage.getItem("token") || "";
      await triageService.moverTriage(id, nuevaColumna, token);
    } catch (err: any) {
      // Revertir ante error
      setItems(itemsAnteriores);
      alert(`No se pudo mover el paciente: ${err.message || "Error desconocido"}`);
    }
  };

  // Drag and drop handlers
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

  // Egresar paciente (Dar de alta o finalizar atención en guardia)
  const handleFinalizar = async (id: number, nombrePaciente: string) => {
    const confirm = window.confirm(
      `¿Desea egresar a "${nombrePaciente}" del tablero de guardia?\n\nEsto finalizará su permanencia en el triage.`
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token") || "";
      await triageService.finalizarTriage(id, token);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err: any) {
      alert(`Error al egresar paciente: ${err.message || "Error desconocido"}`);
    }
  };

  // Crear nuevo ingreso (agendar paciente que llegó sin turno)
  const handleCreateTriage = async (dto: CreateTriageDTO) => {
    const token = localStorage.getItem("token") || "";
    const nuevo = await triageService.createTriage(dto, token);
    setItems((prev) => [nuevo, ...prev]);
  };

  const handleOpenModal = (col: TriageColumn = "URGENCIA_MODERADA") => {
    setTargetColumnForNew(col);
    setIsModalOpen(true);
  };

  // Filtrado de tarjetas
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

  // Estadísticas en el orden exacto solicitado:
  // Consulta programada, Urgencia moderada, Emergencia Crítica e Internación/Quirófano
  const countProgramados = items.filter((i) => i.columna === "CONSULTA_PROGRAMADA").length;
  const countModerados = items.filter((i) => i.columna === "URGENCIA_MODERADA").length;
  const countCriticos = items.filter((i) => i.columna === "EMERGENCIA_CRITICA").length;
  const countInternados = items.filter((i) => i.columna === "INTERNACION_QUIROFANO").length;

  return (
    <main className="triage-page">
      <div className="container-fluid px-4 py-4">
        {/* Cabecera del Tablero */}
        <div className="triage-header mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h1 className="h2 mb-1 d-flex align-items-center gap-2">
                <span>🚨</span> Tablero Kanban de Triage y Guardia
              </h1>
              <p className="text-muted mb-0">
                Monitoreo en tiempo real, clasificación y gestión de pacientes en sala
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={cargarTablero}
                disabled={loading}
                title="Actualizar datos del tablero"
              >
                <span>🔄</span> {loading ? "Cargando..." : "Actualizar"}
              </button>

              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm"
                onClick={() => handleOpenModal("CONSULTA_PROGRAMADA")}
                title="Ingresar o agendar paciente que llegó a la clínica"
              >
                <span>➕</span> Ingresar Paciente
              </button>
            </div>
          </div>

          {/* Barra de métricas y filtros en el orden exacto solicitado */}
          <div className="triage-metrics-bar mt-3 p-3 rounded bg-white shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex gap-3 flex-wrap">
              <div className="metric-pill">
                <strong>Total en Sala:</strong> {items.length}
              </div>
              <div className="metric-pill text-success">
                <strong>🟢 Programados:</strong> {countProgramados}
              </div>
              <div className="metric-pill text-warning">
                <strong>🟡 Moderados:</strong> {countModerados}
              </div>
              <div className="metric-pill text-danger">
                <strong>🔴 Críticos:</strong> {countCriticos}
              </div>
              <div className="metric-pill text-primary">
                <strong>🏥 Quirófano / Internados:</strong> {countInternados}
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="🔍 Buscar paciente, tutor o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "260px" }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={cargarTablero}>
              Reintentar
            </button>
          </div>
        )}

        {/* Tablero Kanban con las 4 Columnas */}
        <div className="kanban-board-container">
          <div className="row g-3 flex-nowrap kanban-scroll-row">
            {COLUMNAS.map((col) => {
              const colItems = filteredItems.filter((it) => it.columna === col.key);
              const isOver = dragOverCol === col.key;

              return (
                <div key={col.key} className="col-12 col-md-6 col-xl-3 kanban-col-wrapper">
                  <div
                    className={`kanban-column ${col.badgeClass} ${
                      isOver ? "column-drag-over" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={(e) => handleDragLeave(e, col.key)}
                    onDrop={(e) => handleDrop(e, col.key)}
                  >
                    {/* Encabezado de la Columna */}
                    <div className="column-header">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="col-icon">{col.icon}</span>
                          <h3 className="col-title mb-0">{col.title}</h3>
                        </div>
                        <span className="col-badge">{colItems.length}</span>
                      </div>
                      <p className="col-subtitle small mb-0">{col.subtitle}</p>

                      <button
                        type="button"
                        className="btn btn-sm btn-light w-100 mt-2 py-1 text-muted add-card-btn"
                        onClick={() => handleOpenModal(col.key)}
                        title={`Ingresar paciente directamente en ${col.title}`}
                      >
                        + Ingresar aquí
                      </button>
                    </div>

                    {/* Lista de Tarjetas */}
                    <div className="column-body">
                      {colItems.length === 0 ? (
                        <div className="empty-column-placeholder">
                          <span className="placeholder-icon">📥</span>
                          <p className="placeholder-text">Sin pacientes en esta columna</p>
                          <small className="placeholder-sub">
                            Arrastre una tarjeta aquí o presione "+ Ingresar"
                          </small>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de ingreso para pacientes sin turno previo o emergencias */}
      <NewTriageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTriage}
        initialColumn={targetColumnForNew}
      />
    </main>
  );
};

export default TriageBoard;
