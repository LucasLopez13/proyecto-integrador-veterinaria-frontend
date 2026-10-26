import React, { useState, useEffect } from "react";
import type { Consultation, UpdateConsultationDTO } from "../../types/Consultation";
import { FormFieldError } from "../common/FormFieldError";
import "../../styles/ConsultationModals.css";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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
      setFieldErrors({});
    }
  }, [consulta]);

  if (!consulta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!form.motivoEdicion.trim() || form.motivoEdicion.trim().length < 5) {
      newErrors.motivoEdicion = "Completá este campo con el motivo de edición (mínimo 5 caracteres)";
    }

    const parsedPeso = parseFloat(form.peso);
    if (!form.peso.trim() || isNaN(parsedPeso) || parsedPeso <= 0) {
      newErrors.peso = "Ingresá un peso válido mayor a 0 kg";
    }

    const parsedTemp = parseFloat(form.temperatura);
    if (!form.temperatura.trim() || isNaN(parsedTemp) || parsedTemp < 30 || parsedTemp > 45) {
      newErrors.temperatura = "Ingresá una temperatura fisiológica válida (entre 30 y 45 °C)";
    }

    if (!form.subjetivo.trim()) {
      newErrors.subjetivo = "Completá este campo con la anamnesis";
    }

    if (!form.objetivo.trim()) {
      newErrors.objetivo = "Completá este campo con los hallazgos";
    }

    if (!form.analisis.trim()) {
      newErrors.analisis = "Completá este campo con el diagnóstico";
    }

    if (!form.plan.trim()) {
      newErrors.plan = "Completá este campo con el tratamiento";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
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
        noValidate
        className="audit-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="audit-modal-header">
          <div>
            <h3>
              <i className="bi bi-pencil-square me-2"></i>
              Enmendar Consulta Médica
            </h3>
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
            <i className="bi bi-shield-check text-warning" style={{ fontSize: "1.4rem" }}></i>
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
              className={`form-control ${fieldErrors.motivoEdicion ? "is-invalid" : ""}`}
              rows={2}
              placeholder="Motivo de la enmienda médica"
              value={form.motivoEdicion}
              onChange={(e) => {
                setForm({ ...form, motivoEdicion: e.target.value });
                clearFieldError("motivoEdicion");
              }}
            />
            <FormFieldError error={fieldErrors.motivoEdicion} />
            <small className="text-muted">Este motivo quedará inalterable en el registro de auditoría legal.</small>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-3 col-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-speedometer2 me-1 text-secondary"></i>Peso (kg) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className={`form-control ${fieldErrors.peso ? "is-invalid" : ""}`}
                value={form.peso}
                onChange={(e) => {
                  setForm({ ...form, peso: e.target.value });
                  clearFieldError("peso");
                }}
              />
              <FormFieldError error={fieldErrors.peso} />
            </div>
            <div className="col-md-3 col-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-thermometer-half me-1 text-secondary"></i>Temperatura (°C) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                className={`form-control ${fieldErrors.temperatura ? "is-invalid" : ""}`}
                value={form.temperatura}
                onChange={(e) => {
                  setForm({ ...form, temperatura: e.target.value });
                  clearFieldError("temperatura");
                }}
              />
              <FormFieldError error={fieldErrors.temperatura} />
            </div>
            <div className="col-md-3 col-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-heart-pulse me-1 text-danger"></i>Frec. Cardíaca
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Frecuencia cardíaca (lpm)"
                value={form.frecuenciaCardiaca}
                onChange={(e) => setForm({ ...form, frecuenciaCardiaca: e.target.value })}
              />
            </div>
            <div className="col-md-3 col-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-lungs me-1 text-primary"></i>Frec. Respiratoria
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Frecuencia respiratoria (rpm)"
                value={form.frecuenciaRespiratoria}
                onChange={(e) => setForm({ ...form, frecuenciaRespiratoria: e.target.value })}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary">[S] Subjetivo (Anamnesis) <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${fieldErrors.subjetivo ? "is-invalid" : ""}`}
                rows={3}
                value={form.subjetivo}
                onChange={(e) => {
                  setForm({ ...form, subjetivo: e.target.value });
                  clearFieldError("subjetivo");
                }}
              />
              <FormFieldError error={fieldErrors.subjetivo} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-success">[O] Objetivo (Examen Físico) <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${fieldErrors.objetivo ? "is-invalid" : ""}`}
                rows={3}
                value={form.objetivo}
                onChange={(e) => {
                  setForm({ ...form, objetivo: e.target.value });
                  clearFieldError("objetivo");
                }}
              />
              <FormFieldError error={fieldErrors.objetivo} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-warning">[A] Diagnóstico / Análisis <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${fieldErrors.analisis ? "is-invalid" : ""}`}
                rows={3}
                value={form.analisis}
                onChange={(e) => {
                  setForm({ ...form, analisis: e.target.value });
                  clearFieldError("analisis");
                }}
              />
              <FormFieldError error={fieldErrors.analisis} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-info">[P] Plan & Tratamiento <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${fieldErrors.plan ? "is-invalid" : ""}`}
                rows={3}
                value={form.plan}
                onChange={(e) => {
                  setForm({ ...form, plan: e.target.value });
                  clearFieldError("plan");
                }}
              />
              <FormFieldError error={fieldErrors.plan} />
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
            className="btn btn-outline-secondary rounded-2 px-3 fw-medium"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium"
            disabled={saving}
          >
            {saving ? (
              "Guardando Enmienda..."
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i>
                Guardar Enmienda (v{(consulta.version || 1) + 1})
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
