import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { TriageItem, TriageColumn } from "../../types/Triage";
import { TriageTimer } from "./TriageTimer";

interface TriageCardProps {
  item: TriageItem;
  onMover: (id: number, columna: TriageColumn) => void;
  onFinalizar: (id: number, nombre: string) => void;
}

const COLUMNAS_INFO: { id: TriageColumn; label: string; badge: string }[] = [
  { id: "CONSULTA_PROGRAMADA", label: "🟢 Consulta Programada", badge: "success" },
  { id: "URGENCIA_MODERADA", label: "🟡 Urgencia Moderada", badge: "warning" },
  { id: "EMERGENCIA_CRITICA", label: "🔴 Emergencia Crítica", badge: "danger" },
  { id: "INTERNACION_QUIROFANO", label: "🏥 Internación/Quirófano", badge: "primary" },
];

export const TriageCard: React.FC<TriageCardProps> = ({
  item,
  onMover,
  onFinalizar,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", item.id.toString());
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getSpeciesIcon = (especie: string) => {
    const esp = especie.toLowerCase();
    if (esp.includes("can") || esp.includes("perr")) return "🐶";
    if (esp.includes("fel") || esp.includes("gat")) return "🐱";
    if (esp.includes("av") || esp.includes("paj")) return "🦜";
    if (esp.includes("cone") || esp.includes("roed")) return "🐰";
    return "🐾";
  };

  return (
    <div
      className={`triage-card column-${item.columna.toLowerCase()} ${
        isDragging ? "dragging" : ""
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Encabezado de la tarjeta con nombre del paciente e icono */}
      <div className="triage-card-header">
        <div className="patient-title-group">
          <span className="species-icon" title={item.especie}>
            {getSpeciesIcon(item.especie)}
          </span>
          <div>
            <h5 className="patient-name mb-0">{item.nombrePaciente}</h5>
            <small className="patient-breed text-muted">
              {item.especie} {item.raza ? `• ${item.raza}` : ""}
            </small>
          </div>
        </div>

        {/* Indicador de paciente registrado o walk-in */}
        {item.mascotaId ? (
          <span className="badge bg-secondary-subtle text-secondary" title="Paciente registrado en sistema">
            Registrado
          </span>
        ) : (
          <span className="badge bg-light text-dark border" title="Ingreso directo sin registro previo">
            Ingreso Directo
          </span>
        )}
      </div>

      {/* Motivo de consulta / emergencia */}
      <div className="triage-card-reason my-2">
        <strong>Motivo:</strong>
        <p className="mb-1 text-dark">{item.motivo}</p>
      </div>

      {/* Cronómetro en tiempo real */}
      <TriageTimer fechaLlegada={item.fechaLlegada} columna={item.columna} />

      {/* Datos del tutor */}
      <div className="triage-card-tutor mt-2">
        <small className="text-muted d-block">
          👤 <strong>Tutor:</strong> {item.nombreTutor || "No especificado"}
        </small>
        {item.telefonoTutor && (
          <small className="text-muted d-block">
            📞 <strong>Tel:</strong>{" "}
            <a href={`tel:${item.telefonoTutor}`} className="text-decoration-none">
              {item.telefonoTutor}
            </a>
          </small>
        )}
      </div>

      {/* Notas / Observaciones expandibles */}
      {item.notas && (
        <div className="triage-card-notes mt-2">
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "▲ Ocultar notas" : "▼ Ver notas clínicas"}
          </button>
          {showNotes && (
            <div className="notes-box p-2 mt-1 rounded bg-light border small text-muted">
              {item.notas}
            </div>
          )}
        </div>
      )}

      {/* Barra de control y movimiento entre columnas */}
      <div className="triage-card-actions mt-3 pt-2 border-top">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="small text-muted mb-0">Mover a:</label>
          <select
            className="form-select form-select-sm w-auto py-0 px-2"
            value={item.columna}
            onChange={(e) => onMover(item.id, e.target.value as TriageColumn)}
            title="Cambiar estado en sala"
          >
            {COLUMNAS_INFO.map((col) => (
              <option key={col.id} value={col.id} disabled={col.id === item.columna}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-1 flex-wrap">
          {item.mascotaId && (
            <>
              <Link
                to={`/profesional/atencion?mascotaId=${item.mascotaId}`}
                className="btn btn-primary btn-sm flex-grow-1"
                title="Iniciar consulta médica SOAP"
              >
                🩺 Atender
              </Link>
              <Link
                to={`/profesional/mascotas/${item.mascotaId}`}
                className="btn btn-outline-secondary btn-sm"
                title="Ver historia clínica"
              >
                📋 Ficha
              </Link>
            </>
          )}

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onFinalizar(item.id, item.nombrePaciente)}
            title="Egresar o dar de alta al paciente de la guardia"
          >
            ✅ Egresar
          </button>
        </div>
      </div>
    </div>
  );
};
