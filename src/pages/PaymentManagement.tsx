
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import type { Payment, PaymentStatus } from "../types/Payment";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { MetricCard } from "../components/common/MetricCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

function PaymentManagement() {
  const { token } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | "todos">("pendiente");
  const [modalState, setModalState] = useState<FeedbackModalState | null>(null);

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

  const ejecutarCambioEstado = async (
    pago: Payment,
    estado: "aprobado" | "rechazado"
  ) => {
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

  const solicitarConfirmacion = (
    pago: Payment,
    estado: "aprobado" | "rechazado"
  ) => {
    const esAprobacion = estado === "aprobado";
    const accion = esAprobacion ? "aprobar" : "rechazar";

    setModalState({
      isOpen: true,
      type: "confirm",
      confirmVariant: esAprobacion ? "primary" : "danger",
      title: esAprobacion ? "Confirmar aprobación" : "Confirmar rechazo",
      message: `¿Estás seguro de que deseás ${accion} el pago #${pago.id} por valor de ${formatoMonto(pago.monto)}?`,
      confirmText: esAprobacion ? "Aprobar pago" : "Rechazar pago",
      cancelText: "Cancelar",
      onConfirm: () => void ejecutarCambioEstado(pago, estado),
    });
  };

  const pagosFiltrados = payments.filter(
    (pago) => filter === "todos" || pago.estado === filter
  );

  const totalCount = payments.length;
  const pendingCount = payments.filter((p) => p.estado === "pendiente").length;
  const approvedCount = payments.filter((p) => p.estado === "aprobado").length;

  const formatoMonto = (monto: number | string) =>
    Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    });

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Gestión de Pagos
            </h1>
            <p className="text-muted small mb-0">
              Administración de cobros, verificación de transferencias y estados de pago
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link
              to="/profesional/turnos"
              className="btn btn-outline-secondary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
            >
              <i className="bi bi-calendar-check"></i> Agenda de Turnos
            </Link>
            <button
              type="button"
              className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
              style={{ backgroundColor: "var(--primary-violet, #6D28D9)", borderColor: "var(--primary-violet, #6D28D9)" }}
              onClick={() => void cargarPagos()}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}
        {message && <div className="alert alert-success rounded-2 shadow-sm mb-4">{message}</div>}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <MetricCard
              label="Total Pagos Registrados"
              value={totalCount}
              icon="bi-wallet2"
              iconBg="#F5F3FF"
              iconColor="#6D28D9"
            />
          </div>

          <div className="col-12 col-md-4">
            <MetricCard
              label="Pagos Pendientes"
              value={pendingCount}
              icon="bi-clock-history"
              iconBg="#FEF3C7"
              iconColor="#D97706"
            />
          </div>

          <div className="col-12 col-md-4">
            <MetricCard
              label="Pagos Aprobados"
              value={approvedCount}
              icon="bi-check-circle"
              iconBg="#D1FAE5"
              iconColor="#059669"
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {[
            { value: "pendiente", label: "Pendientes", icon: "bi-clock-history" },
            { value: "aprobado", label: "Aprobados", icon: "bi-check2-circle" },
            { value: "rechazado", label: "Rechazados", icon: "bi-x-circle" },
            { value: "todos", label: "Todos", icon: "bi-collection" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm rounded-2 fw-medium d-inline-flex align-items-center gap-1 shadow-sm px-3 ${
                filter === option.value
                  ? "btn-primary text-white"
                  : "btn-outline-secondary bg-white text-dark border"
              }`}
              style={
                filter === option.value
                  ? {
                      backgroundColor: "var(--primary-violet, #6D28D9)",
                      borderColor: "var(--primary-violet, #6D28D9)",
                    }
                  : { borderColor: "var(--lavender-border, #EDE9FE)" }
              }
              onClick={() =>
                setFilter(option.value as PaymentStatus | "todos")
              }
            >
              <i className={`bi ${option.icon}`}></i>
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando cobros y pagos..." />
        ) : pagosFiltrados.length === 0 ? (
          <EmptyState
            icon="bi-wallet2"
            title="No hay pagos para el filtro seleccionado"
            description="Los pagos registrados por los tutores aparecerán listados aquí para su verificación."
          />
        ) : (
          <div className="row g-3">
            {pagosFiltrados.map((pago) => (
              <div className="col-12 col-lg-6" key={pago.id}>
                <article
                  className="card h-100 shadow-sm border rounded-3 overflow-hidden bg-white"
                  style={{ borderColor: "var(--lavender-border, #EDE9FE)" }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3 pb-3 border-bottom" style={{ borderColor: "#F1F5F9" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-2 d-flex align-items-center justify-content-center"
                          style={{ width: "38px", height: "38px", backgroundColor: "var(--lavender-tint, #F5F3FF)", color: "var(--primary-violet, #6D28D9)" }}
                        >
                          <i className="bi bi-receipt fs-5"></i>
                        </div>
                        <div>
                          <h2 className="h6 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            Pago #{pago.id}
                          </h2>
                          <span className="text-muted small">
                            {pago.createdAt
                              ? new Date(pago.createdAt).toLocaleString("es-AR")
                              : "Fecha no disponible"}
                          </span>
                        </div>
                      </div>

                      <span
                        className="badge px-3 py-2 rounded-pill fw-semibold text-capitalize"
                        style={{
                          backgroundColor:
                            pago.estado === "aprobado"
                              ? "var(--color-success-bg, #ECFDF5)"
                              : pago.estado === "rechazado"
                              ? "var(--color-danger-bg, #FEF2F2)"
                              : "var(--color-warning-bg, #FFFBEB)",
                          color:
                            pago.estado === "aprobado"
                              ? "var(--color-success, #059669)"
                              : pago.estado === "rechazado"
                              ? "var(--color-danger, #DC2626)"
                              : "var(--color-warning, #D97706)",
                          border: `1px solid ${
                            pago.estado === "aprobado"
                              ? "#A7F3D0"
                              : pago.estado === "rechazado"
                              ? "#FCA5A5"
                              : "#FDE68A"
                          }`,
                        }}
                      >
                        <i
                          className={`bi me-1 ${
                            pago.estado === "aprobado"
                              ? "bi-check2-circle"
                              : pago.estado === "rechazado"
                              ? "bi-x-circle"
                              : "bi-clock-history"
                          }`}
                        ></i>
                        {pago.estado}
                      </span>
                    </div>

                    <div className="mb-3 d-flex align-items-baseline gap-2">
                      <span className="text-muted small">Monto registrado:</span>
                      <strong className="fs-5 fw-bold" style={{ color: "var(--primary-violet, #6D28D9)" }}>
                        {formatoMonto(pago.monto)}
                      </strong>
                    </div>

                    <div className="small text-secondary mb-3 p-3 rounded-2" style={{ backgroundColor: "#FAF9FC" }}>
                      <div className="mb-2">
                        <strong className="text-dark">Concepto:</strong> {pago.concepto}
                      </div>
                      <div className="mb-2">
                        <strong className="text-dark">Método:</strong>{" "}
                        <span className="text-capitalize">{pago.metodo}</span>
                      </div>
                      <div className="mb-2">
                        <strong className="text-dark">Turno asociado:</strong>{" "}
                        {pago.turnoId ? `#${pago.turnoId}` : "No asociado"}
                      </div>

                      {pago.turno?.usuario && (
                        <div className="mb-2">
                          <strong className="text-dark">Tutor responsable:</strong>{" "}
                          {pago.turno.usuario.nombre} {pago.turno.usuario.apellido}
                          {pago.turno.usuario.telefono ? ` · ${pago.turno.usuario.telefono}` : ""}
                        </div>
                      )}

                      {pago.turno?.mascota && (
                        <div>
                          <strong className="text-dark">Paciente:</strong>{" "}
                          {pago.turno.mascota.nombre} ({pago.turno.mascota.especie})
                        </div>
                      )}
                    </div>

                  {pago.observaciones && (
                    <p className="mb-3">
                      <strong>Observaciones:</strong> {pago.observaciones}
                    </p>
                  )}

                  {pago.estado === "pendiente" && (
                    <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top" style={{ borderColor: "#F1F5F9" }}>
                      <button
                        type="button"
                        className="btn btn-sm rounded-2 fw-medium shadow-sm d-inline-flex align-items-center gap-1 px-3 text-white"
                        style={{ backgroundColor: "var(--color-success, #059669)", borderColor: "var(--color-success, #059669)" }}
                        disabled={updatingId !== null}
                        onClick={() => solicitarConfirmacion(pago, "aprobado")}
                      >
                        <i className="bi bi-check2"></i>
                        {updatingId === pago.id
                          ? "Actualizando..."
                          : "Aprobar pago"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-2 fw-medium d-inline-flex align-items-center gap-1 px-3"
                        disabled={updatingId !== null}
                        onClick={() => solicitarConfirmacion(pago, "rechazado")}
                      >
                        <i className="bi bi-x-lg"></i>
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

        {modalState && (
          <FeedbackModal
            {...modalState}
            onClose={() => setModalState(null)}
          />
        )}
      </div>
    </main>
  );
}

export default PaymentManagement;
