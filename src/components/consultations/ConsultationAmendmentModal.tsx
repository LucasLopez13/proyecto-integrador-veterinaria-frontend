import React, { useState, useEffect } from "react";
import type { Consultation, UpdateConsultationDTO } from "../../types/Consultation";

interface ConsultationAmendmentModalProps {
  consulta: Consultation | null;
  petName: string;
  saving: boolean;
  onClose: () => void;
  onSave: (data: UpdateConsultationDTO) => Promise<void>;
}

export const ConsultationAmendmentModal: React.FC<ConsultationAmendmentModalProps> = ({
  consulta,
  petName,
  saving,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    motivoEdicion: "",
    subjetivo: "",
    objetivo: "",
    peso: "",
    temperatura: "",
    frecuenciaCardiaca: "",
    frecuenciaRespiratoria: "",
    analisis: "",
    plan: "",
    observaciones: "",
  });

  useEffect(() => {
    if (consulta) {
      setForm({
        motivoEdicion: "",
        subjetivo: consulta.subjetivo || "",
        objetivo: consulta.objetivo || "",
        peso: String(consulta.peso || ""),
        temperatura: String(consulta.temperatura || ""),
        frecuenciaCardiaca: consulta.frecuenciaCardiaca ? String(consulta.frecuenciaCardiaca) : "",
        frecuenciaRespiratoria: consulta.frecuenciaRespiratoria ? String(consulta.frecuenciaRespiratoria) : "",
        analisis: consulta.analisis || "",
        plan: consulta.plan || "",
        observaciones: consulta.observaciones || "",
      });
    }
  }, [consulta]);

  if (!consulta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.motivoEdicion.trim() || form.motivoEdicion.trim().length < 5) {
      alert("Por favor indicá un motivo de edición válido (mínimo 5 caracteres) para garantizar la auditoría médica legal.");
      return;
    }

    await onSave({
      motivoEdicion: form.motivoEdicion.trim(),
      subjetivo: form.subjetivo,
      objetivo: form.objetivo,
      peso: Number(form.peso),
      temperatura: Number(form.temperatura),
      frecuenciaCardiaca: form.frecuenciaCardiaca ? Number(form.frecuenciaCardiaca) : null,
      frecuenciaRespiratoria: form.frecuenciaRespiratoria ? Number(form.frecuenciaRespiratoria) : null,
      analisis: form.analisis,
      plan: form.plan,
      observaciones: form.observaciones,
    });
  };

  return (
    <div className="audit-modal-backdrop" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="audit-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="audit-modal-header">
          <div>
            <h3>✏️ Enmendar Consulta Médica</h3>
            <p>
              Se generará la <strong>Versión v{(consulta.version || 1) + 1}</strong> · Paciente: {petName}
            </p>
          </div>
          <button
            type="button"
            className="audit-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="audit-modal-body">
            <div className="legal-notice-banner legal-notice-banner-warning">
              <span style={{ fontSize: "1.4rem" }}>⚖️</span>
              <div>
                <strong>Aviso de Inmutabilidad Clínica:</strong>
                <div style={{ marginTop: 2, fontSize: "0.82rem" }}>
                  Las consultas médicas finalizadas no se sobreescriben. Esta acción registrará una nueva versión histórica
                  inmutable con tus datos, la marca temporal actual y el motivo justificado a continuación.
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-danger">
                * Motivo de la enmienda / Justificación clínica:
              </label>
              <textarea
                className="form-control"
                rows={2}
                required
                placeholder="Ej. Rectificación de temperatura y posología tras evaluación de análisis complementarios..."
                value={form.motivoEdicion}
                onChange={(e) => setForm({ ...form, motivoEdicion: e.target.value })}
              />
              <small className="text-muted">Este motivo quedará inalterable en el registro de auditoría legal.</small>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-3 col-6">
                <label className="form-label fw-semibold">⚖️ Peso (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-control"
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label fw-semibold">🌡️ Temperatura (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="form-control"
                  value={form.temperatura}
                  onChange={(e) => setForm({ ...form, temperatura: e.target.value })}
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label fw-semibold">💓 Frec. Cardíaca</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="lpm"
                  value={form.frecuenciaCardiaca}
                  onChange={(e) => setForm({ ...form, frecuenciaCardiaca: e.target.value })}
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label fw-semibold">🫁 Frec. Respiratoria</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="rpm"
                  value={form.frecuenciaRespiratoria}
                  onChange={(e) => setForm({ ...form, frecuenciaRespiratoria: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-primary">[S] Subjetivo (Anamnesis)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={form.subjetivo}
                  onChange={(e) => setForm({ ...form, subjetivo: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-success">[O] Objetivo (Examen Físico)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={form.objetivo}
                  onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-warning">[A] Diagnóstico / Análisis</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={form.analisis}
                  onChange={(e) => setForm({ ...form, analisis: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-info">[P] Plan & Tratamiento</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold text-muted">Observaciones para el tutor</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              />
            </div>
          </div>

          <div className="audit-modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Guardando Enmienda..." : `💾 Guardar Enmienda (v${(consulta.version || 1) + 1})`}
            </button>
          </div>
        </form>
    </div>
  );
};
