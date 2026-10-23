import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { TriageItem, TriageColumn } from "../../types/Triage";
import { TriageTimer } from "./TriageTimer";
import { getSpeciesIcon } from "../../utils/speciesIcon";
import { TRIAGE_COLUMNS_CONFIG, TRIAGE_COLUMNS_ORDER } from "../../constants";

interface TriageCardProps {
  item: TriageItem;
  onMover: (id: number, columna: TriageColumn) => void;
  onFinalizar: (id: number, nombre: string) => void;
}

const COLUMNAS_INFO = TRIAGE_COLUMNS_ORDER.map((key) => ({
  id: key,
  label: TRIAGE_COLUMNS_CONFIG[key].title,
}));

export const TriageCard: React.FC<TriageCardProps> = ({
  item,
  onMover,
  onFinalizar,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", item.id.toString());
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`triage-kanban-card ${isDragging ? "is-dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          {/* Squircle avatar 36x36px */}
          <div className="triage-squircle-avatar">
            {getSpeciesIcon(item.especie)}
          </div>
          <div>
            <h4 className="fs-6 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)", lineHeight: 1.2 }}>
              {item.nombrePaciente}
            </h4>
            <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
              {item.especie} {item.raza ? `· ${item.raza}` : ""}
            </small>
          </div>
        </div>

        {/* Origin tag with rounded-1 */}
        {item.mascotaId ? (
          <span
            className="badge rounded-1 fw-medium"
            style={{
              backgroundColor: "#F1F5F9",
              color: "#475569",
              border: "1px solid #E2E8F0",
              fontSize: "0.7rem",
            }}
          >
            Registrado
          </span>
        ) : (
          <span
            className="badge rounded-1 fw-medium"
            style={{
              backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
              color: "var(--vet-primary, #6D28D9)",
              border: "1px solid var(--vet-border-tint, #EDE9FE)",
              fontSize: "0.7rem",
            }}
          >
            Ingreso Directo
          </span>
        )}
      </div>

      {/* Reason & Symptoms */}
      <div className="my-2">
        <span className="small fw-bold text-dark d-block" style={{ fontSize: "0.8rem" }}>
          Motivo:
        </span>
        <p className="text-dark small mb-0" style={{ fontSize: "0.82rem", lineHeight: 1.35 }}>
          {item.motivo}
        </p>
      </div>

      {/* Real-time Timer Chip */}
      <div className="my-2">
        <TriageTimer fechaLlegada={item.fechaLlegada} columna={item.columna} />
      </div>

      {/* Clinical & Tutor Metadata */}
      <div className="d-flex flex-column gap-1 my-2" style={{ fontSize: "0.78rem" }}>
        {item.nombreTutor && (
          <div className="d-flex align-items-center gap-1 text-secondary">
            <i className="bi bi-person text-secondary"></i>
            <span className="fw-medium text-dark">{item.nombreTutor}</span>
            {item.telefonoTutor && (
              <a
                href={`tel:${item.telefonoTutor}`}
                className="text-decoration-none text-muted ms-1 d-inline-flex align-items-center gap-1"
                title="Llamar al tutor"
              >
                <i className="bi bi-telephone text-primary"></i> {item.telefonoTutor}
              </a>
            )}
          </div>
        )}

        {/* Assigned Veterinarian / Guard Indicator */}
        <div className="d-flex align-items-center gap-1 text-muted">
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--vet-primary, #6D28D9)",
              display: "inline-block",
            }}
          />
          <span>Dra. García (Guardia)</span>
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className="border-top border-light-subtle pt-2 mt-2">
        <div className="d-flex align-items-center justify-content-between gap-2">
          {/* Left: Dropdown select with 6px radius */}
          <select
            className="form-select form-select-sm rounded-2 py-1 px-2"
            style={{ fontSize: "0.78rem", maxWidth: "145px", borderColor: "var(--vet-border-tint, #EDE9FE)" }}
            value={item.columna}
            onChange={(e) => onMover(item.id, e.target.value as TriageColumn)}
            title="Mover columna"
          >
            <option value="" disabled>Mover a...</option>
            {COLUMNAS_INFO.map((col) => (
              <option key={col.id} value={col.id} disabled={col.id === item.columna}>
                {col.label}
              </option>
            ))}
          </select>

          {/* Right: Iniciar Atención or Egresar */}
          <div className="d-flex align-items-center gap-1">
            {item.mascotaId && (
              <Link
                to={`/profesional/atencion?mascotaId=${item.mascotaId}`}
                className="btn btn-outline-primary rounded-2 btn-sm fw-medium px-2 py-1"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--vet-primary, #6D28D9)",
                  borderColor: "var(--vet-primary, #6D28D9)",
                }}
                title="Iniciar Atención SOAP"
              >
                Iniciar Atención
              </Link>
            )}

            <button
              type="button"
              className="btn btn-light rounded-2 btn-sm text-muted p-1"
              style={{ fontSize: "0.75rem", lineHeight: 1 }}
              onClick={() => onFinalizar(item.id, item.nombrePaciente)}
              title="Egresar de sala"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
