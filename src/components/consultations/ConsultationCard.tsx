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
      className="card rounded-3 p-4 mb-3 bg-white shadow-sm border"
      style={{ borderColor: "#EDE9FE" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light-subtle flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-purple-subtle rounded-2 px-2 py-1 fs-6">
            <i className="bi bi-calendar-event me-1"></i>
            {c.fecha ? new Date(c.fecha).toLocaleDateString("es-AR") : "Fecha no disponible"}
          </span>

          <span
            className={`badge rounded-2 ${
              c.version && c.version > 1
                ? "bg-warning-subtle text-warning border border-warning"
                : "bg-light text-muted border"
            }`}
          >
            v{c.version || 1} · {c.version && c.version > 1 ? "Enmendada" : "Original"}
          </span>

          {c.veterinario && (
            <span className="text-muted ms-1 small">
              por Dr./Dra. {c.veterinario.nombre} {c.veterinario.apellido}
            </span>
          )}
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-light text-dark border rounded-2" title="Peso actual">
            <i className="bi bi-speedometer2 me-1 text-secondary"></i>{c.peso} kg
          </span>
          <span className="badge bg-light text-dark border rounded-2" title="Temperatura">
            <i className="bi bi-thermometer-half me-1 text-secondary"></i>{c.temperatura} °C
          </span>
          {c.frecuenciaCardiaca !== null && c.frecuenciaCardiaca !== undefined && (
            <span className="badge bg-light text-dark border rounded-2" title="Frecuencia Cardíaca">
              <i className="bi bi-heart-pulse me-1 text-danger"></i>{c.frecuenciaCardiaca} lpm
            </span>
          )}
          {c.frecuenciaRespiratoria !== null && c.frecuenciaRespiratoria !== undefined && (
            <span className="badge bg-light text-dark border rounded-2" title="Frecuencia Respiratoria">
              <i className="bi bi-lungs me-1 text-primary"></i>{c.frecuenciaRespiratoria} rpm
            </span>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <small className="text-primary fw-bold d-block mb-1">[S] Subjetivo (Anamnesis):</small>
          <p className="small text-dark mb-0" style={{ whiteSpace: "pre-line" }}>{c.subjetivo}</p>
        </div>

        <div className="col-md-6">
          <small className="text-warning-emphasis fw-bold d-block mb-1">[A] Diagnóstico / Análisis:</small>
          <p className="small text-dark mb-0" style={{ whiteSpace: "pre-line" }}>{c.analisis}</p>
        </div>

        <div className="col-md-6">
          <small className="text-success fw-bold d-block mb-1">[O] Objetivo (Examen Físico):</small>
          <p className="small text-dark mb-0" style={{ whiteSpace: "pre-line" }}>
            {c.objetivo ? c.objetivo : "Sin hallazgos adicionales descriptos"}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-info-emphasis fw-bold d-block mb-1">[P] Plan & Tratamiento:</small>
          <p className="small text-dark mb-0" style={{ whiteSpace: "pre-line" }}>{c.plan}</p>
        </div>
      </div>

      {c.observaciones && (
        <div className="mt-3 pt-2 border-top border-light-subtle">
          <small className="text-muted fw-bold d-block">Observaciones / Indicaciones al tutor:</small>
          <p className="small text-muted mb-0" style={{ whiteSpace: "pre-line" }}>{c.observaciones}</p>
        </div>
      )}

      {c.prescripciones && c.prescripciones.length > 0 && (
        <div className="mt-3 pt-2 border-top border-light-subtle">
          <small className="text-muted fw-bold d-block mb-2">
            <i className="bi bi-capsule me-1 text-purple"></i> Medicamentos Prescriptos:
          </small>
          <div className="d-flex flex-wrap gap-2">
            {c.prescripciones.map((p, idx) => (
              <span key={idx} className="badge bg-purple-subtle rounded-2 p-2 text-start">
                <strong>{p.medicamento}</strong> - {p.dosis} ({p.frecuencia})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-light-subtle flex-wrap">
        <button
          type="button"
          className="btn btn-light btn-sm rounded-2 text-secondary"
          onClick={() => onOpenAudit(c)}
          title="Ver historial de cambios inmutables y trazabilidad legal"
        >
          <i className="bi bi-clock-history me-1"></i> Auditoría (v{c.version || 1})
        </button>

        {isProfessional && (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2"
              onClick={() => onOpenEdit(c)}
              title="Crear una nueva versión histórica con enmienda médica"
            >
              <i className="bi bi-pencil-square me-1"></i> Enmendar
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-2"
              onClick={() => onOpenAnular(c)}
              title="Anulación lógica de la consulta (soft delete)"
            >
              <i className="bi bi-trash3 me-1"></i> Anular
            </button>
          </>
        )}
      </div>
    </div>
  );
};
