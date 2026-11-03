import React, { useState } from "react";
import type { Consultation } from "../../types/Consultation";
import { FormFieldError } from "../common/FormFieldError";
import "../../styles/ConsultationModals.css";

interface ConsultationAnnulModalProps {
  consulta: Consultation | null;
  petName: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
}

export const ConsultationAnnulModal: React.FC<ConsultationAnnulModalProps> = ({
  consulta,
  petName,
  saving,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState<string | null>(null);

  if (!consulta) return null;

  const handleConfirm = async () => {
    if (!motivo.trim() || motivo.trim().length < 5) {
      setMotivoError("El motivo de anulacion es obligatorio (minimo 5 caracteres).");
      return;
    }
    setMotivoError(null);
    await onConfirm(motivo.trim());
  };

  return (
    <div className="audit-modal-backdrop" onClick={onClose}>
      <div className="audit-modal-container" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <div>
            <h3 className="text-danger">
              <i className="bi bi-slash-circle me-2"></i>
              Anular Consulta Medica
            </h3>
            <p>Consulta #{consulta.id} · Paciente: {petName}</p>
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
          <div className="alert alert-danger" style={{ fontSize: "0.85rem" }}>
            <strong>
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              Prohibicion de Borrado Fisico:
            </strong>
            <div style={{ marginTop: 4 }}>
              Por normativa legal y medica, los registros clinicos nunca se eliminan fisicamente de la base de datos.
              Esta consulta sera dada de baja logicamente y el evento quedara asentado en el registro de auditoria.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              * Motivo de la anulacion (obligatorio):
            </label>
            <textarea
              className={`form-control ${motivoError ? "is-invalid" : ""}`}
              rows={3}
              placeholder="Motivo de la anulacion"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (motivoError) setMotivoError(null);
              }}
            />
            <FormFieldError error={motivoError || undefined} />
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
            type="button"
            className="btn btn-danger rounded-2 shadow-sm px-4 fw-medium"
            style={{ backgroundColor: "#DC2626", borderColor: "#DC2626" }}
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "Anulando..." : "Confirmar Anulacion Logica"}
          </button>
        </div>
      </div>
    </div>
  );
};
