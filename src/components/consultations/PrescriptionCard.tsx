import { useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type { Prescripcion } from "../../types/Prescripcion";
import { FeedbackModal, type FeedbackModalState } from "../common/FeedbackModal";

interface PrescriptionCardProps {
  prescripcion: Prescripcion;
  token?: string | null;
  onConfirmada: (prescripcion: Prescripcion) => void;
}

export default function PrescriptionCard({
  prescripcion,
  token,
  onConfirmada,
}: PrescriptionCardProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const ejecutarConfirmacion = async () => {
    if (confirmando || prescripcion.confirmadaPorProfesional) return;
    try {
      setConfirmando(true);
      setError(null);

      const respuesta = await prescripcionService.confirm(
        prescripcion.id,
        token
      );
      onConfirmada(respuesta.prescripcion);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Prescripcion Confirmada",
        message: `La prescripcion de ${prescripcion.medicamento} fue confirmada y emitida en el recetario digital del paciente.`,
        confirmText: "Entendido",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo confirmar la prescripcion."
      );
    } finally {
      setConfirmando(false);
    }
  };

  const solicitarConfirmacion = () => {
    if (confirmando || prescripcion.confirmadaPorProfesional) return;
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      confirmVariant: "primary",
      title: "Confirmar Prescripcion Medica",
      message: `¿Confirmas que revisaste la dosis (${prescripcion.dosisTotal ?? "-"} mg / ${prescripcion.volumenMl ?? "-"} ml cada ${prescripcion.frecuenciaHoras} hs por ${prescripcion.duracionDias} dias) para ${prescripcion.medicamento}? Esta accion emitira la receta medica y no se puede deshacer.`,
      confirmText: "Si, confirmar prescripcion",
      cancelText: "Revisar datos",
      onConfirm: () => void ejecutarConfirmacion(),
    });
  };

  const confirmada = prescripcion.confirmadaPorProfesional;

  return (
    <div
      className="rounded-3 p-4 mb-3 bg-white shadow-sm"
      style={{ border: "1px solid var(--vet-border-tint, #EDE9FE)" }}
    >
      <div
        className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3 pb-3 border-bottom"
        style={{ borderColor: "#F1F5F9" }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-2 d-flex align-items-center justify-content-center"
            style={{
              width: "38px",
              height: "38px",
              backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
              color: "var(--vet-primary, #6D28D9)",
              border: "1px solid var(--vet-border-tint, #EDE9FE)",
            }}
          >
            <i className="bi bi-capsule-pill fs-5"></i>
          </div>
          <div>
            <h4
              className="h6 fw-bold mb-0"
              style={{ color: "var(--vet-text-main, #1E1B4B)" }}
            >
              {prescripcion.medicamento}
            </h4>
            <span className="text-muted small">
              Concentracion: {prescripcion.concentracion}{" "}
              {prescripcion.unidadConcentracion} · Dosis:{" "}
              {prescripcion.dosisIndicada} {prescripcion.unidadDosis}
            </span>
          </div>
        </div>

        <span
          className="badge px-3 py-2 rounded-pill fw-semibold"
          style={{
            backgroundColor: confirmada ? "#ECFDF5" : "#FFFBEB",
            color: confirmada ? "#059669" : "#D97706",
            border: `1px solid ${confirmada ? "#A7F3D0" : "#FDE68A"}`,
          }}
        >
          <i
            className={`bi me-1 ${
              confirmada ? "bi-check2-circle" : "bi-clock-history"
            }`}
          ></i>
          {confirmada ? "Confirmada" : "Pendiente de confirmacion"}
        </span>
      </div>

      <div
        className="row g-3 small p-3 rounded-2 mb-3"
        style={{ backgroundColor: "#FAF9FC", border: "1px solid #F1F5F9" }}
      >
        <div className="col-sm-6 col-md-4">
          <span className="text-muted d-block">Peso de referencia</span>
          <strong className="text-dark">{prescripcion.pesoKg} kg</strong>
        </div>
        <div className="col-sm-6 col-md-4">
          <span className="text-muted d-block">Dosis total por toma</span>
          <strong style={{ color: "var(--vet-primary, #6D28D9)" }}>
            {prescripcion.dosisTotal != null
              ? `${prescripcion.dosisTotal} mg`
              : "No calculada"}
          </strong>
        </div>
        <div className="col-sm-6 col-md-4">
          <span className="text-muted d-block">Volumen a administrar</span>
          <strong style={{ color: "var(--vet-primary, #6D28D9)" }}>
            {prescripcion.volumenMl != null
              ? `${prescripcion.volumenMl} ml`
              : "No calculado"}
          </strong>
        </div>
        <div className="col-sm-6 col-md-4">
          <span className="text-muted d-block">Frecuencia</span>
          <strong className="text-dark">
            Cada {prescripcion.frecuenciaHoras} horas
          </strong>
        </div>
        <div className="col-sm-6 col-md-4">
          <span className="text-muted d-block">Duracion del tratamiento</span>
          <strong className="text-dark">{prescripcion.duracionDias} dias</strong>
        </div>
        {prescripcion.indicaciones && (
          <div className="col-12 pt-2 border-top" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-muted d-block">Indicaciones adicionales</span>
            <span className="text-dark">{prescripcion.indicaciones}</span>
          </div>
        )}
      </div>

      {!confirmada && (
        <div
          className="rounded-2 p-3 mb-3 small d-flex align-items-start gap-2"
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            color: "#92400E",
          }}
        >
          <i className="bi bi-exclamation-triangle-fill mt-1"></i>
          <div>
            Revisa el medicamento, la dosis, la concentracion y los resultados
            antes de confirmar. El sistema realiza calculos matematicos exactos,
            pero requiere tu validacion clinica profesional.
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger rounded-2 py-2 small mt-2 mb-3">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-end align-items-center">
        {!confirmada ? (
          <button
            type="button"
            className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium d-inline-flex align-items-center gap-2"
            style={{
              backgroundColor: "var(--vet-primary, #6D28D9)",
              borderColor: "var(--vet-primary, #6D28D9)",
            }}
            onClick={solicitarConfirmacion}
            disabled={confirmando}
          >
            <i className="bi bi-check2-circle"></i>
            {confirmando ? "Confirmando..." : "Confirmar prescripcion"}
          </button>
        ) : (
          <span className="small fw-semibold" style={{ color: "#059669" }}>
            <i className="bi bi-patch-check-fill me-1"></i>
            Prescripcion validada y emitida por el profesional
          </span>
        )}
      </div>

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
