import React, { useState } from "react";
import type { Consultation } from "../../types/Consultation";

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

  if (!consulta) return null;

  const handleConfirm = async () => {
    if (!motivo.trim() || motivo.trim().length < 5) {
      alert("El motivo de anulación es obligatorio (mínimo 5 caracteres).");
      return;
    }
    await onConfirm(motivo.trim());
  };

  return (
    <div className="audit-modal-backdrop" onClick={onClose}>
      <div className="audit-modal-container" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <div>
            <h3 className="text-danger">🚫 Anular Consulta Médica</h3>
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
            <strong>⚠️ Prohibición de Borrado Físico:</strong>
            <div style={{ marginTop: 4 }}>
              Por normativa legal y médica, los registros clínicos nunca se eliminan físicamente de la base de datos.
              Esta consulta será dada de baja lógicamente y el evento quedará asentado en el registro de auditoría.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              * Motivo de la anulación (obligatorio):
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Ej. Registro duplicado accidentalmente, paciente atendido en otra sede..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
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
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "Anulando..." : "Confirmar Anulación Lógica"}
          </button>
        </div>
      </div>
    </div>
  );
};
