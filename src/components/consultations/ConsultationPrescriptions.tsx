import { useEffect, useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type { Prescripcion } from "../../types/Prescripcion";
interface ConsultationPrescriptionsProps { consultaId: number;}

export default function ConsultationPrescriptions({
  consultaId,
}: ConsultationPrescriptionsProps) {
  const [prescripciones, setPrescripciones] = useState<Prescripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);
  useEffect(() => {setPrescripciones([]);setError(null);setAbierto(false);setCargado(false);}, [consultaId]);
  const cargarPrescripciones = async () => {
    if (cargado || loading) return;
    try {
      setLoading(true);
      setError(null);
      const data = await prescripcionService.getByConsultaId(consultaId);
      setPrescripciones(data);
      setCargado(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las prescripciones."
      );
    } finally {
      setLoading(false);
    }
  };
  const togglePrescripciones = () => {
    if (!abierto && !cargado) {
      void cargarPrescripciones();
    }
    setAbierto((prev) => !prev);
  };
  return (
    <section className="mt-3 pt-3 border-top border-light-subtle">
      <button
        type="button"
        className="btn btn-light w-100 d-flex justify-content-between align-items-center p-3 text-start"
        onClick={togglePrescripciones}
        aria-expanded={abierto}
      >
        <span className="fw-semibold">
          <i className="bi bi-capsule me-2 text-primary"></i>
          Prescripciones médicas
          {cargado && (
            <span className="badge bg-secondary ms-2">
              {prescripciones.length}
            </span>
          )}
        </span>
        <i
          className={`bi ${
            abierto ? "bi-chevron-up" : "bi-chevron-down"
          }`}
        />
      </button>
      {abierto && (
        <div className="border rounded-bottom-3 p-3">
          {loading ? (
            <p className="text-muted small mb-0">
              Cargando prescripciones...
            </p>
          ) : error ? (
            <div className="alert alert-warning mb-0">
              {error}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary ms-2"
                onClick={() => void cargarPrescripciones()}
              >
                Reintentar
              </button>
            </div>
          ) : prescripciones.length === 0 ? (
            <p className="text-muted small mb-0">
              Esta consulta no tiene prescripciones registradas.
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {prescripciones.map((p) => (
                <article
                  key={p.id}
                  className="border rounded-3 p-3 bg-white"
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h4 className="h6 fw-bold mb-0">
                      {p.medicamento}
                    </h4>
                    <span
                      className={`badge ${
                        p.confirmadaPorProfesional
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {p.confirmadaPorProfesional
                        ? "Confirmada"
                        : "Pendiente de confirmación"}
                    </span>
                  </div>
                  <div className="row g-2 small">
                    <div className="col-md-6">
                      <strong>Concentración:</strong>{" "}
                      {p.concentracion} {p.unidadConcentracion}
                    </div>
                    <div className="col-md-6">
                      <strong>Dosis indicada:</strong>{" "}
                      {p.dosisIndicada} {p.unidadDosis}
                    </div>
                    <div className="col-md-6">
                      <strong>Peso utilizado:</strong> {p.pesoKg} kg
                    </div>
                    <div className="col-md-6">
                      <strong>Dosis total:</strong>{" "}
                      {p.dosisTotal != null
                        ? `${p.dosisTotal} mg`
                        : "No calculada"}
                    </div>
                    <div className="col-md-6">
                      <strong>Volumen:</strong>{" "}
                      {p.volumenMl != null
                        ? `${p.volumenMl} ml`
                        : "No calculado"}
                    </div>
                    <div className="col-md-6">
                      <strong>Frecuencia:</strong>{" "}
                      Cada {p.frecuenciaHoras} horas
                    </div>
                    <div className="col-md-6">
                      <strong>Duración:</strong>{" "}
                      {p.duracionDias} días
                    </div>
                    {p.indicaciones && (
                      <div className="col-12">
                        <strong>Indicaciones:</strong>{" "}
                        {p.indicaciones}
                      </div>
                    )}
                  </div>
                  {!p.confirmadaPorProfesional && (
                    <p className="text-warning-emphasis small mt-3 mb-0">
                      Prescripción pendiente de revisión profesional.
                      No debe considerarse una indicación confirmada.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}