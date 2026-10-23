import React from "react";
import type { Consultation } from "../../types/Consultation";

interface ConsultationCardProps {
  consulta: Consultation;
  isProfessional: boolean;
  onOpenAudit: (c: Consultation) => void;
  onOpenEdit: (c: Consultation) => void;
  onOpenAnular: (c: Consultation) => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consulta,
  isProfessional,
  onOpenAudit,
  onOpenEdit,
  onOpenAnular,
}) => {
  const c = consulta;

  return (
    <div
      key={c.id}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "18px 20px",
        marginBottom: "16px",
        background: "#ffffff",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <strong style={{ color: "#0f172a", fontSize: "1rem" }}>
            📅 {c.fecha ? new Date(c.fecha).toLocaleDateString("es-AR") : "Fecha no disponible"}
          </strong>
          <span
            className={`consultation-badge-version ${
              c.version && c.version > 1
                ? "consultation-badge-amended"
                : "consultation-badge-original"
            }`}
            title={
              c.version && c.version > 1
                ? `Versión ${c.version} (Consulta con enmiendas registradas)`
                : "Versión 1 (Registro original inalterado)"
            }
          >
            🏷️ v{c.version || 1} · {c.version && c.version > 1 ? "Enmendada" : "Original"}
          </span>
          {c.veterinario && (
            <span className="text-muted ms-1" style={{ fontSize: "0.875rem" }}>
              por Dr./Dra. {c.veterinario.nombre} {c.veterinario.apellido}
            </span>
          )}
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-light text-dark border" title="Peso actual">
            ⚖️ {c.peso} kg
          </span>
          <span className="badge bg-light text-dark border" title="Temperatura">
            🌡️ {c.temperatura} °C
          </span>
          {c.frecuenciaCardiaca !== null && c.frecuenciaCardiaca !== undefined && (
            <span className="badge bg-light text-dark border" title="Frecuencia Cardíaca">
              💓 {c.frecuenciaCardiaca} lpm
            </span>
          )}
          {c.frecuenciaRespiratoria !== null && c.frecuenciaRespiratoria !== undefined && (
            <span className="badge bg-light text-dark border" title="Frecuencia Respiratoria">
              🫁 {c.frecuenciaRespiratoria} rpm
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <small className="text-primary fw-bold d-block mb-1">[S] Subjetivo (Anamnesis):</small>
          <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.subjetivo}</p>
        </div>

        <div>
          <small className="text-warning fw-bold d-block mb-1">[A] Diagnóstico / Análisis:</small>
          <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.analisis}</p>
        </div>

        <div>
          <small className="text-success fw-bold d-block mb-1">[O] Objetivo (Examen Físico):</small>
          <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>
            {c.objetivo ? c.objetivo : "Sin hallazgos adicionales descriptos"}
          </p>
        </div>

        <div>
          <small className="text-info fw-bold d-block mb-1">[P] Plan & Tratamiento:</small>
          <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.plan}</p>
        </div>
      </div>

      {c.observaciones && (
        <div className="mt-3 pt-2 border-top">
          <small className="text-muted fw-bold d-block">Observaciones / Indicaciones al tutor:</small>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, whiteSpace: "pre-line" }}>{c.observaciones}</p>
        </div>
      )}

      <div className="consultation-actions-bar">
        <button
          type="button"
          className="consultation-action-btn btn-audit"
          onClick={() => onOpenAudit(c)}
          title="Ver historial de cambios inmutables y trazabilidad legal"
        >
          📜 Auditoría e Inmutabilidad (v{c.version || 1})
        </button>

        {isProfessional && (
          <>
            <button
              type="button"
              className="consultation-action-btn btn-amend"
              onClick={() => onOpenEdit(c)}
              title="Crear una nueva versión histórica con enmienda médica"
            >
              ✏️ Enmendar Consulta
            </button>

            <button
              type="button"
              className="consultation-action-btn btn-annul"
              onClick={() => onOpenAnular(c)}
              title="Anulación lógica de la consulta (soft delete)"
            >
              🗑️ Anular
            </button>
          </>
        )}
      </div>
    </div>
  );
};
