
import { useCallback, useEffect, useState } from "react";
import { paymentService } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import type { Payment, PaymentStatus } from "../types/Payment";

function PaymentManagement() {
  const { token } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | "todos">("pendiente");

  const cargarPagos = useCallback(async () => {
    try {
      setError(null);
      const data = await paymentService.getPayments(token);
      setPayments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los pagos."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void cargarPagos();
  }, [cargarPagos]);

  const cambiarEstado = async (
    pago: Payment,
    estado: "aprobado" | "rechazado"
  ) => {
    const accion = estado === "aprobado" ? "aprobar" : "rechazar";

    if (!window.confirm(`¿Querés ${accion} el pago #${pago.id}?`)) {
      return;
    }

    try {
      setUpdatingId(pago.id);
      setError(null);
      setMessage(null);

      await paymentService.updatePaymentStatus(pago.id, estado, token);
      await cargarPagos();

      setMessage(`El pago #${pago.id} quedó ${estado}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el pago."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pagosFiltrados = payments.filter(
    (pago) => filter === "todos" || pago.estado === filter
  );

  const formatoMonto = (monto: number | string) =>
    Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    });

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de pagos</h1>
          <p className="text-muted mb-0">
            Consultá los pagos registrados y actualizá su estado.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => void cargarPagos()}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {[
          { value: "pendiente", label: "Pendientes" },
          { value: "aprobado", label: "Aprobados" },
          { value: "rechazado", label: "Rechazados" },
          { value: "todos", label: "Todos" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${
              filter === option.value
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() =>
              setFilter(option.value as PaymentStatus | "todos")
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando pagos...</p>
      ) : pagosFiltrados.length === 0 ? (
        <div className="alert alert-light border">
          No hay pagos para el filtro seleccionado.
        </div>
      ) : (
        <div className="row g-3">
          {pagosFiltrados.map((pago) => (
            <div className="col-12 col-lg-6" key={pago.id}>
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h2 className="h5 mb-1">Pago #{pago.id}</h2>
                      <span className="text-muted small">
                        {pago.createdAt
                          ? new Date(pago.createdAt).toLocaleString("es-AR")
                          : "Fecha no disponible"}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        pago.estado === "aprobado"
                          ? "text-bg-success"
                          : pago.estado === "rechazado"
                          ? "text-bg-danger"
                          : "text-bg-warning"
                      }`}
                    >
                      {pago.estado}
                    </span>
                  </div>

                  <p className="mb-2">
                    <strong>Monto:</strong> {formatoMonto(pago.monto)}
                  </p>
                  <p className="mb-2">
                    <strong>Concepto:</strong> {pago.concepto}
                  </p>
                  <p className="mb-2">
                    <strong>Método:</strong> {pago.metodo}
                  </p>
                  <p className="mb-2">
                    <strong>Turno:</strong> {pago.turnoId ?? "No asociado"}
                  </p>

                  {pago.observaciones && (
                    <p className="mb-3">
                      <strong>Observaciones:</strong> {pago.observaciones}
                    </p>
                  )}

                  {pago.estado === "pendiente" && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-success"
                        disabled={updatingId !== null}
                        onClick={() => void cambiarEstado(pago, "aprobado")}
                      >
                        {updatingId === pago.id
                          ? "Actualizando..."
                          : "Aprobar pago"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        disabled={updatingId !== null}
                        onClick={() => void cambiarEstado(pago, "rechazado")}
                      >
                        Rechazar pago
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default PaymentManagement;
