import { useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type { Prescripcion } from "../../types/Prescripcion";
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

  const confirmarPrescripcion = async () => {
    if (confirmando || prescripcion.confirmadaPorProfesional) return;
    const acepta = window.confirm(
      "¿Confirmás que revisaste los datos y cálculos de esta prescripción? Esta acción no se puede deshacer."
    );
    if (!acepta) return;
    try {
      setConfirmando(true);
      setError(null);

      const respuesta = await prescripcionService.confirm(
        prescripcion.id,
        token
      );
      onConfirmada(respuesta.prescripcion);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo confirmar la prescripción."
      );
    } finally {
      setConfirmando(false);
    }
  };
  const confirmada = prescripcion.confirmadaPorProfesional;
  return (
    <div className="border rounded-3 p-3 mb-3 bg-white">
      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
        <h4 className="h6 fw-bold mb-0">
          {prescripcion.medicamento}
        </h4>
        <span
          className={`badge ${
            confirmada
              ? "bg-success"
              : "bg-warning text-dark"
          }`}
        >
          {confirmada ? "Confirmada" : "Pendiente de confirmación"}
        </span>
      </div>
      <div className="row g-2 small">
        <div className="col-md-6">
          <strong>Concentración:</strong>{" "}
          {prescripcion.concentracion} {prescripcion.unidadConcentracion}
        </div>
        <div className="col-md-6">
          <strong>Dosis indicada:</strong>{" "}
          {prescripcion.dosisIndicada} {prescripcion.unidadDosis}
        </div>
        <div className="col-md-6">
          <strong>Peso utilizado:</strong> {prescripcion.pesoKg} kg
        </div>
        <div className="col-md-6">
          <strong>Dosis total calculada:</strong>{" "}
          {prescripcion.dosisTotal != null
            ? `${prescripcion.dosisTotal} mg`
            : "No calculada"}
        </div>
        <div className="col-md-6">
          <strong>Volumen calculado:</strong>{" "}
          {prescripcion.volumenMl != null
            ? `${prescripcion.volumenMl} ml`
            : "No calculado"}
        </div>
        <div className="col-md-6">
          <strong>Frecuencia:</strong> Cada {prescripcion.frecuenciaHoras} horas
        </div>
        <div className="col-md-6">
          <strong>Duración:</strong> {prescripcion.duracionDias} días
        </div>
        {prescripcion.indicaciones && (
          <div className="col-12">
            <strong>Indicaciones:</strong>{" "}
            {prescripcion.indicaciones}
          </div>
        )}
      </div>
      {!confirmada && (
        <div className="alert alert-warning mt-3 mb-3 small">
          Revisá el medicamento, la dosis, la concentración y los
          resultados antes de confirmar. El sistema realiza cálculos
          matemáticos, pero no valida la seguridad clínica del tratamiento.
        </div>
      )}
      {error && (
        <div className="alert alert-danger mt-3 mb-0">
          {error}
        </div>
      )}
      {!confirmada && (
        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={confirmarPrescripcion}
          disabled={confirmando}
        >
          {confirmando
            ? "Confirmando..."
            : "Confirmar prescripción"}
        </button>
      )}
      {confirmada && (
        <p className="text-success small fw-semibold mt-3 mb-0">
          <i className="bi bi-check-circle-fill me-2"></i>
          Prescripción confirmada por el profesional.
        </p>
      )}
    </div>
  );
}