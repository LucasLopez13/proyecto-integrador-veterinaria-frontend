import { useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type { CreatePrescripcionDTO, Prescripcion } from "../../types/Prescripcion";
import { FeedbackModal, type FeedbackModalState } from "../common/FeedbackModal";

interface PrescriptionFormProps {
  consultaId: number;
  pesoKg?: number;
  token?: string | null;
  onPrescripcionCreada: (prescripcion: Prescripcion) => void;
  onSavingChange?: (saving: boolean) => void;
}

export default function PrescriptionForm({
  consultaId,
  pesoKg,
  token,
  onSavingChange,
  onPrescripcionCreada,
}: PrescriptionFormProps) {
  const [medicamento, setMedicamento] = useState("");
  const [concentracion, setConcentracion] = useState("");
  const [unidadConcentracion, setUnidadConcentracion] = useState("mg/ml");
  const [dosisIndicada, setDosisIndicada] = useState("");
  const [unidadDosis, setUnidadDosis] = useState("mg/kg");
  const [frecuenciaHoras, setFrecuenciaHoras] = useState("");
  const [duracionDias, setDuracionDias] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescripcionCreada, setPrescripcionCreada] =
    useState<Prescripcion | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const concentracionNum = Number(concentracion);
  const dosisNum = Number(dosisIndicada);
  const pesoRef = Number(pesoKg || 0);
  const previewDosisTotal =
    pesoRef > 0 && Number.isFinite(dosisNum) && dosisNum > 0
      ? Number((pesoRef * dosisNum).toFixed(2))
      : null;
  const previewVolumenMl =
    previewDosisTotal !== null &&
    Number.isFinite(concentracionNum) &&
    concentracionNum > 0
      ? Number((previewDosisTotal / concentracionNum).toFixed(2))
      : null;

  const ejecutarCreacion = async (datos: CreatePrescripcionDTO) => {
    try {
      setSaving(true);
      onSavingChange?.(true);
      const nuevaPrescripcion = await prescripcionService.create(
        consultaId,
        datos,
        token
      );

      setPrescripcionCreada(nuevaPrescripcion);
      onPrescripcionCreada(nuevaPrescripcion);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la prescripcion."
      );
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (saving || prescripcionCreada) return;

    setError(null);

    const frecuenciaNum = Number(frecuenciaHoras);
    const duracionNum = Number(duracionDias);

    if (!medicamento.trim()) {
      setError("Ingresa el nombre del medicamento.");
      return;
    }
    if (
      !Number.isFinite(concentracionNum) ||
      concentracionNum <= 0 ||
      !Number.isFinite(dosisNum) ||
      dosisNum <= 0
    ) {
      setError("La concentracion y la dosis deben ser mayores a cero.");
      return;
    }
    if (
      !Number.isInteger(frecuenciaNum) ||
      frecuenciaNum <= 0 ||
      !Number.isInteger(duracionNum) ||
      duracionNum <= 0
    ) {
      setError(
        "La frecuencia y la duracion deben ser numeros enteros positivos."
      );
      return;
    }

    const datos: CreatePrescripcionDTO = {
      medicamento: medicamento.trim(),
      concentracion: concentracionNum,
      unidadConcentracion,
      dosisIndicada: dosisNum,
      unidadDosis,
      frecuenciaHoras: frecuenciaNum,
      duracionDias: duracionNum,
      indicaciones: indicaciones.trim() || null,
    };

    const resumenCalculo =
      previewDosisTotal !== null && previewVolumenMl !== null
        ? ` (Dosis calculada: ${previewDosisTotal} mg / ${previewVolumenMl} ml por toma)`
        : "";

    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      confirmVariant: "primary",
      title: "Registrar Prescripcion Farmacologica",
      message: `¿Deseas registrar la prescripcion de ${datos.medicamento}${resumenCalculo} cada ${datos.frecuenciaHoras} horas durante ${datos.duracionDias} dias?`,
      confirmText: "Crear y calcular",
      cancelText: "Cancelar",
      onConfirm: () => void ejecutarCreacion(datos),
    });
  };

  return (
    <div
      className="soap-section-card"
      style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
    >
      <div className="soap-section-header">
        <div
          className="soap-badge-letter"
          style={{
            backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
            color: "var(--vet-primary, #6D28D9)",
            border: "1px solid var(--vet-border-tint, #EDE9FE)",
          }}
        >
          Rx
        </div>
        <div>
          <h3
            className="h6 fw-bold mb-0"
            style={{ color: "var(--vet-text-main, #1E1B4B)" }}
          >
            Nueva Prescripcion Medica y Calculo Posologico
          </h3>
          <small className="text-muted">
            Los calculos se realizan automaticamente utilizando el peso
            registrado en la consulta SOAP
            {pesoRef > 0 ? ` (${pesoRef} kg)` : ""}
          </small>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-2 py-2 small mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">
              Medicamento / Principio Activo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control rounded-2"
              placeholder="Ej: Meloxicam, Amoxicilina..."
              value={medicamento}
              onChange={(e) => setMedicamento(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">
              Concentracion <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0.001"
              step="any"
              placeholder="Ej: 20"
              className="form-control rounded-2"
              value={concentracion}
              onChange={(e) => setConcentracion(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">
              Unidad de concentracion
            </label>
            <select
              className="form-select rounded-2"
              value={unidadConcentracion}
              onChange={(e) => setUnidadConcentracion(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            >
              <option value="mg/ml">mg/ml</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">
              Dosis indicada <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0.001"
              step="any"
              placeholder="Ej: 0.2"
              className="form-control rounded-2"
              value={dosisIndicada}
              onChange={(e) => setDosisIndicada(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">
              Unidad de dosis
            </label>
            <select
              className="form-select rounded-2"
              value={unidadDosis}
              onChange={(e) => setUnidadDosis(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            >
              <option value="mg/kg">mg/kg</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">
              Frecuencia (cada cuantas horas) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Ej: 12 o 24"
              className="form-control rounded-2"
              value={frecuenciaHoras}
              onChange={(e) => setFrecuenciaHoras(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">
              Duracion del tratamiento (dias) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Ej: 5"
              className="form-control rounded-2"
              value={duracionDias}
              onChange={(e) => setDuracionDias(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>

          {previewDosisTotal !== null && previewVolumenMl !== null && (
            <div className="col-12">
              <div
                className="rounded-2 p-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{
                  backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                  border: "1px solid var(--vet-border-tint, #EDE9FE)",
                }}
              >
                <div className="small">
                  <span
                    className="fw-bold d-block"
                    style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                  >
                    <i
                      className="bi bi-calculator me-1"
                      style={{ color: "var(--vet-primary, #6D28D9)" }}
                    ></i>
                    Vista previa posologica dinamica ({pesoRef} kg)
                  </span>
                  <span className="text-muted">
                    Calculado automaticamente segun concentracion y dosis por kg
                  </span>
                </div>
                <div className="d-flex gap-3">
                  <div className="text-end">
                    <span className="text-muted small d-block">Dosis por toma</span>
                    <strong style={{ color: "var(--vet-primary, #6D28D9)" }}>
                      {previewDosisTotal} mg
                    </strong>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small d-block">Volumen a administrar</span>
                    <strong style={{ color: "var(--vet-primary, #6D28D9)" }}>
                      {previewVolumenMl} ml
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-12">
            <label className="form-label small fw-semibold text-muted">
              Indicaciones adicionales para el tutor
            </label>
            <textarea
              className="form-control rounded-2"
              rows={3}
              maxLength={2000}
              placeholder="Ej: Administrar junto con el alimento..."
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            />
          </div>
        </div>

        {!prescripcionCreada && (
          <div className="d-flex justify-content-end mt-4">
            <button
              type="submit"
              className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                borderColor: "var(--vet-primary, #6D28D9)",
              }}
              disabled={saving}
            >
              <i className="bi bi-calculator"></i>
              {saving
                ? "Guardando prescripcion..."
                : "Crear prescripcion y calcular"}
            </button>
          </div>
        )}
      </form>

      {prescripcionCreada && (
        <div className="alert alert-success rounded-2 mt-3 mb-0 small">
          <i className="bi bi-check-circle me-2"></i>
          Prescripcion creada correctamente. Revisa y confirma los resultados en
          la tarjeta inferior.
        </div>
      )}

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        confirmVariant={feedbackModal.confirmVariant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmText={feedbackModal.confirmText}
        cancelText={feedbackModal.cancelText}
        onConfirm={feedbackModal.onConfirm}
        onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
      />
    </div>
  );
}
