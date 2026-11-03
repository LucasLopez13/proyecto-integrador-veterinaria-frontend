import { useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type {CreatePrescripcionDTO, Prescripcion,} from "../../types/Prescripcion";

interface PrescriptionFormProps {
  consultaId: number;
  token?: string | null;
  onPrescripcionCreada: (prescripcion: Prescripcion) => void;
  onSavingChange?: (saving: boolean) => void;
}

export default function PrescriptionForm({
  consultaId,
  token,
  onSavingChange,
  onPrescripcionCreada,
}: PrescriptionFormProps) {
  const [medicamento, setMedicamento] = useState("");
  const [concentracion, setConcentracion] = useState("");
  const [unidadConcentracion, setUnidadConcentracion] =
    useState("mg/ml");
  const [dosisIndicada, setDosisIndicada] = useState("");
  const [unidadDosis, setUnidadDosis] = useState("mg/kg");
  const [frecuenciaHoras, setFrecuenciaHoras] = useState("");
  const [duracionDias, setDuracionDias] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescripcionCreada, setPrescripcionCreada] =
    useState<Prescripcion | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving || prescripcionCreada) return;

    setError(null);

    const concentracionNum = Number(concentracion);
    const dosisNum = Number(dosisIndicada);
    const frecuenciaNum = Number(frecuenciaHoras);
    const duracionNum = Number(duracionDias);

    if (!medicamento.trim()) {
      setError("Ingresá el nombre del medicamento.");
      return;
    }
    if (
      !Number.isFinite(concentracionNum) ||
      concentracionNum <= 0 ||
      !Number.isFinite(dosisNum) ||
      dosisNum <= 0
    ) {
      setError("La concentración y la dosis deben ser mayores a cero.");
      return;
    }
    if (
      !Number.isInteger(frecuenciaNum) ||
      frecuenciaNum <= 0 ||
      !Number.isInteger(duracionNum) ||
      duracionNum <= 0
    ) {
      setError("La frecuencia y la duración deben ser números enteros positivos.");
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
          : "No se pudo crear la prescripción."
      );
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  return (
    <div className="soap-section-card">
      <h3 className="h5 fw-bold mb-3">
        Nueva prescripción médica
      </h3>
      <p className="text-muted small">
        Completá los datos indicados por el profesional.
        Los cálculos se realizarán utilizando el peso registrado
        en la consulta SOAP.
      </p>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">

          <div className="col-md-6">
            <label className="form-label">
              Medicamento *
            </label>
            <input
              type="text"
              className="form-control"
              value={medicamento}
              onChange={(e) => setMedicamento(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Concentración *
            </label>
            <input
              type="number"
              min="0.001"
              step="any"
              className="form-control"
              value={concentracion}
              onChange={(e) => setConcentracion(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Unidad de concentración
            </label>
            <select
              className="form-select"
              value={unidadConcentracion}
              onChange={(e) => setUnidadConcentracion(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            >
              <option value="mg/ml">mg/ml</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Dosis indicada *
            </label>
            <input
              type="number"
              min="0.001"
              step="any"
              className="form-control"
              value={dosisIndicada}
              onChange={(e) => setDosisIndicada(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Unidad de dosis
            </label>
            <select
              className="form-select"
              value={unidadDosis}
              onChange={(e) => setUnidadDosis(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            >
              <option value="mg/kg">mg/kg</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Frecuencia (horas) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-control"
              value={frecuenciaHoras}
              onChange={(e) => setFrecuenciaHoras(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">
              Duración (días) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-control"
              value={duracionDias}
              onChange={(e) => setDuracionDias(e.target.value)}
              disabled={saving || !!prescripcionCreada}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">
              Indicaciones adicionales
            </label>
            <textarea
              className="form-control"
              rows={3}
              maxLength={2000}
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              disabled={saving || !!prescripcionCreada}
            />
          </div>
        </div>
        {!prescripcionCreada && (
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={saving}
          >
            {saving
              ? "Guardando prescripción..."
              : "Crear prescripción y calcular"}
          </button>
        )}
      </form>
      {prescripcionCreada && (
        <div className="alert alert-success mt-3 mb-0">
            <i className="bi bi-check-circle me-2"></i>
            Prescripción creada correctamente.
            Revisá los resultados en la tarjeta inferior.
        </div>
        
      )}
    </div>
  );
}