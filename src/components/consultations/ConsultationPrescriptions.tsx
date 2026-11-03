import { useEffect, useState } from "react";
import { prescripcionService } from "../../services/prescripcionService";
import type { Prescripcion } from "../../types/Prescripcion";

interface ConsultationPrescriptionsProps {
  consultaId: number;
}

export default function ConsultationPrescriptions({
  consultaId,
}: ConsultationPrescriptionsProps) {
  const [prescripciones, setPrescripciones] = useState<Prescripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setPrescripciones([]);
    setError(null);
    setAbierto(false);
    setCargado(false);
  }, [consultaId]);

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
        className="btn w-100 d-flex justify-content-between align-items-center p-3 text-start rounded-2"
        style={{
          backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
          border: "1px solid var(--vet-border-tint, #EDE9FE)",
          color: "var(--vet-text-main, #1E1B4B)",
        }}
        onClick={togglePrescripciones}
        aria-expanded={abierto}
      >
        <span className="fw-semibold d-inline-flex align-items-center">
          <i
            className="bi bi-capsule-pill me-2"
            style={{ color: "var(--vet-primary, #6D28D9)" }}
          ></i>
          Prescripciones medicas y posologia
          {cargado && (
            <span
              className="badge rounded-pill ms-2"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                color: "#FFFFFF",
              }}
            >
              {prescripciones.length}
            </span>
          )}
        </span>
        <i
          className={`bi ${abierto ? "bi-chevron-up" : "bi-chevron-down"}`}
          style={{ color: "var(--vet-primary, #6D28D9)" }}
        />
      </button>

      {abierto && (
        <div
          className="rounded-bottom-3 p-3 bg-white"
          style={{
            border: "1px solid var(--vet-border-tint, #EDE9FE)",
            borderTop: "none",
          }}
        >
          {loading ? (
            <p className="text-muted small mb-0">
              Cargando prescripciones...
            </p>
          ) : error ? (
            <div className="alert alert-warning mb-0 small py-2">
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
                  className="rounded-3 p-3"
                  style={{
                    backgroundColor: "#FAF9FC",
                    border: "1px solid var(--vet-border-tint, #EDE9FE)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <h4
                      className="h6 fw-bold mb-0"
                      style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                    >
                      {p.medicamento}
                    </h4>
                    <span
                      className="badge rounded-pill px-3 py-1 fw-semibold"
                      style={{
                        backgroundColor: p.confirmadaPorProfesional
                          ? "#ECFDF5"
                          : "#FFFBEB",
                        color: p.confirmadaPorProfesional
                          ? "#059669"
                          : "#D97706",
                        border: `1px solid ${
                          p.confirmadaPorProfesional ? "#A7F3D0" : "#FDE68A"
                        }`,
                      }}
                    >
                      {p.confirmadaPorProfesional
                        ? "Confirmada"
                        : "Pendiente de confirmacion"}
                    </span>
                  </div>
                  <div className="row g-2 small">
                    <div className="col-md-6">
                      <strong>Concentracion:</strong> {p.concentracion}{" "}
                      {p.unidadConcentracion}
                    </div>
                    <div className="col-md-6">
                      <strong>Dosis indicada:</strong> {p.dosisIndicada}{" "}
                      {p.unidadDosis}
                    </div>
                    <div className="col-md-6">
                      <strong>Peso utilizado:</strong> {p.pesoKg} kg
                    </div>
                    <div className="col-md-6">
                      <strong>Dosis total:</strong>{" "}
                      <span
                        className="fw-semibold"
                        style={{ color: "var(--vet-primary, #6D28D9)" }}
                      >
                        {p.dosisTotal != null
                          ? `${p.dosisTotal} mg`
                          : "No calculada"}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <strong>Volumen:</strong>{" "}
                      <span
                        className="fw-semibold"
                        style={{ color: "var(--vet-primary, #6D28D9)" }}
                      >
                        {p.volumenMl != null
                          ? `${p.volumenMl} ml`
                          : "No calculado"}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <strong>Frecuencia:</strong> Cada {p.frecuenciaHoras}{" "}
                      horas
                    </div>
                    <div className="col-md-6">
                      <strong>Duracion:</strong> {p.duracionDias} dias
                    </div>
                    {p.indicaciones && (
                      <div className="col-12">
                        <strong>Indicaciones:</strong> {p.indicaciones}
                      </div>
                    )}
                  </div>
                  {!p.confirmadaPorProfesional && (
                    <p className="text-warning-emphasis small mt-2 mb-0">
                      Prescripcion pendiente de revision profesional. No debe
                      considerarse una indicacion confirmada.
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
