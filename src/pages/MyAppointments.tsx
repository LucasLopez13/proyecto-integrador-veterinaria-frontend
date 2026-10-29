import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Appointment, PaginatedAppointments } from "../types/Appointment";
import { apiFetch } from "../services/apiClient";
import { MONTH_NAMES } from "../utils/dateUtils";
import { getSpeciesIcon } from "../utils/speciesIcon";
import { AppointmentStatusBadge } from "../components/common/AppointmentStatusBadge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { ErrorModal } from "../components/common/ErrorModal";
import { FormFieldError } from "../components/common/FormFieldError";
import { Pagination } from "../components/common/Pagination";
import { paymentService } from "../services/paymentService";
import type { Payment, PaymentMethod } from "../types/Payment";


function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentFormTurnoId, setPaymentFormTurnoId] = useState<number | null>(null);
  const [paymentMonto, setPaymentMonto] = useState("");
  const [paymentMetodo, setPaymentMetodo] = useState<PaymentMethod>("transferencia");
  const [paymentObservaciones, setPaymentObservaciones] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMessageTurnoId, setPaymentMessageTurnoId] = useState<number | null>(null);

  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 5;

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const cargarTurnos = async (pageToLoad: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<PaginatedAppointments | Appointment[]>(
        `/turnos?page=${pageToLoad}&limit=${itemsPerPage}`
      );

      if (Array.isArray(res)) {
        setAppointments(res);
        setTotalItems(res.length);
        setTotalPages(Math.ceil(res.length / itemsPerPage) || 1);
      } else {
        setAppointments(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.page || pageToLoad);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnos(1);
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      const data = await paymentService.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("No se pudieron cargar los pagos:", err);
    }
  };

  const handleRegistrarPago = async (turnoId: number) => {
    setPaymentError(null);
    setPaymentMessage(null);

    const monto = Number(paymentMonto);

    if (!paymentMonto.trim() || !Number.isFinite(monto) || monto <= 0) {
      setPaymentError("Ingresá un monto válido mayor que cero.");
      return;
    }

    try {
      setPaymentLoading(true);

      await paymentService.createPayment({
        monto,
        concepto: `Pago de turno #${turnoId}`,
        metodo: paymentMetodo,
        turnoId,
        observaciones: paymentObservaciones.trim() || undefined,
      });

      await cargarPagos();

      setPaymentFormTurnoId(null);
      setPaymentMonto("");
      setPaymentMetodo("transferencia");
      setPaymentObservaciones("");
      setPaymentMessageTurnoId(turnoId);
      setPaymentMessage(`El pago del turno #${turnoId} se registró como pendiente.`);
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "No se pudo registrar el pago."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    cargarTurnos(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSolicitarCancelacion = (id: number) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      title: "¿Cancelar Turno?",
      message: "¿Estás seguro de que deseás cancelar este turno veterinario? Esta acción no se puede deshacer.",
      confirmText: "Sí, Cancelar Turno",
      cancelText: "Mantener Turno",
      onConfirm: () => ejecutarCancelacion(id),
    });
  };

  const ejecutarCancelacion = async (id: number) => {
    try {
      await apiFetch(`/turnos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "cancelado" }),
      });

      await cargarTurnos(currentPage);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Turno Cancelado",
        message: "El turno fue cancelado correctamente.",
        confirmText: "Entendido",
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al cancelar turno",
        message: err.message || "No se pudo cancelar el turno.",
        confirmText: "Entendido",
      });
    }
  };

  const nowForInput = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleReprogramarTurno = async (id: number) => {
    setRescheduleError(null);

    if (!nuevaFecha) {
      setRescheduleError("Seleccioná una nueva fecha y hora para reprogramar el turno.");
      return;
    }

    if (new Date(nuevaFecha).getTime() <= Date.now()) {
      setRescheduleError("No podés reprogramar un turno para una fecha u horario que ya ha transcurrido.");
      return;
    }

    try {
      await apiFetch<Appointment>(`/turnos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fecha: new Date(nuevaFecha).toISOString(),
        }),
      });

      await cargarTurnos(currentPage);

      setReprogramandoId(null);
      setNuevaFecha("");
      setRescheduleError(null);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Turno Reprogramado",
        message: "El turno fue reprogramado exitosamente con la nueva fecha y hora elegidas.",
        confirmText: "Aceptar",
      });
    } catch (err: any) {
      setRescheduleError(err.message || "Error al reprogramar el turno");
    }
  };

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4" style={{ maxWidth: "860px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Mis Turnos
            </h1>
            <p className="text-muted small mb-0">
              Consultá y gestioná las próximas citas veterinarias de tus mascotas
            </p>
          </div>

          <Link
            to="/turnos/nuevo"
            className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
          >
            <i className="bi bi-plus-lg"></i> Solicitar Nuevo Turno
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger rounded-2 shadow-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Cargando tus turnos..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="bi-calendar-check"
            title="No tenés turnos solicitados"
            description="Cuando solicites una cita, vas a poder darle seguimiento desde esta sección."
            actionText="Solicitar mi primer turno"
            actionTo="/turnos/nuevo"
          />
        ) : (
          <>
            <div className="d-flex flex-column gap-3">
              {appointments.map((appointment) => {
                const d = new Date(appointment.fecha);
                const day = String(d.getDate()).padStart(2, "0");
                const month = MONTH_NAMES[d.getMonth()] || "";
                const hours = String(d.getHours()).padStart(2, "0");
                const mins = String(d.getMinutes()).padStart(2, "0");
                const timeStr = `${hours}:${mins} hs`;

                const mascotaNombre = appointment.mascota?.nombre || "Mascota";
                const isReprogramando = reprogramandoId === appointment.id;
                const isPastOrCancelled = ["cancelado", "completado", "atendido"].includes(appointment.estado);

                return (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-3 border border-light-subtle p-3 shadow-sm transition-all"
                    style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
                  >
                    <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-2 d-flex flex-column align-items-center justify-content-center p-2 text-center"
                          style={{
                            width: "74px",
                            height: "74px",
                            backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                            border: "1px solid var(--vet-border-tint, #EDE9FE)",
                            flexShrink: 0
                          }}
                        >
                          <span className="small text-uppercase fw-semibold" style={{ color: "var(--vet-primary, #6D28D9)", fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                            {month}
                          </span>
                          <span className="fw-bold" style={{ color: "var(--vet-text-main, #1E1B4B)", fontSize: "1.3rem", lineHeight: 1.1 }}>
                            {day}
                          </span>
                          <span className="small font-monospace" style={{ color: "var(--vet-primary, #6D28D9)", fontSize: "0.75rem" }}>
                            {timeStr}
                          </span>
                        </div>

                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h3 className="h6 fw-bold mb-0 d-inline-flex align-items-center gap-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                              {getSpeciesIcon(appointment.mascota?.especie)} {mascotaNombre}
                            </h3>
                            <AppointmentStatusBadge status={appointment.estado} />
                          </div>

                          <p className="small text-muted mb-0">
                            <strong>Motivo:</strong> {appointment.motivo || "Consulta de rutina / Revisión"}
                          </p>
                          <small className="text-secondary" style={{ fontSize: "0.8rem" }}>
                            Veterinario: <span className="fw-medium text-dark">Servicio General VetCare</span>
                          </small>
                        </div>
                      </div>

                      {!isPastOrCancelled && (
                        <div className="d-flex align-items-center gap-2 flex-shrink-0 align-self-sm-center">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-2 btn-sm fw-medium px-3"
                            onClick={() => {
                              if (isReprogramando) {
                                setReprogramandoId(null);
                                setRescheduleError(null);
                              } else {
                                setReprogramandoId(appointment.id);
                                setNuevaFecha("");
                                setRescheduleError(null);
                              }
                            }}
                          >
                            {isReprogramando ? "Cerrar" : "Reprogramar"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger rounded-2 btn-sm fw-medium px-3"
                            onClick={() => handleSolicitarCancelacion(appointment.id)}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Sección de pagos */}
                    <div className="mt-3 pt-3 border-top border-light-subtle">
                      <h4 className="small fw-bold mb-2">
                        <i className="bi bi-credit-card me-2"></i>
                        Pago del turno
                      </h4>


                      {(() => {
                        const pagosTurno = payments.filter(
                          (p) => p.turnoId === appointment.id
                        );
                        const pagoActivo = pagosTurno.find(
                          (p) => p.estado === "pendiente" || p.estado === "aprobado"
                        );
                        const puedeRegistrar =
                          !pagoActivo &&
                          (!pagosTurno.length ||
                            pagosTurno.every((p) => p.estado === "rechazado"));

                        if (pagoActivo) {
                          return (
                            <div className="small mb-2">
                              <span>
                                Monto: ${Number(pagoActivo.monto).toLocaleString("es-AR")}
                              </span>
                              {" · "}
                              <span className="fw-semibold">
                                Estado: {pagoActivo.estado}
                              </span>
                              {" · "}
                              <span>Método: {pagoActivo.metodo}</span>
                            </div>
                          );
                        }

                        if (puedeRegistrar && !isPastOrCancelled) {
                          return (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm rounded-2"
                              onClick={() => {
                                setPaymentFormTurnoId(appointment.id);
                                setPaymentMonto("");
                                setPaymentMetodo("transferencia");
                                setPaymentObservaciones("");
                                setPaymentError(null);
                                setPaymentMessage(null);
                              }}
                            >
                              <i className="bi bi-wallet2 me-1"></i>
                              Registrar pago
                            </button>
                          );
                        }

                        return null;
                      })()}


                      {paymentFormTurnoId === appointment.id && (
                        <form
                          className="mt-3 p-3 rounded-2"
                          style={{ backgroundColor: "#FAF9FC" }}
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleRegistrarPago(appointment.id);
                          }}
                        >
                          <div className="mb-3">
                            <label
                              htmlFor={`pago-monto-${appointment.id}`}
                              className="form-label small fw-semibold"
                            >
                              Monto ($)
                            </label>
                            <input
                              id={`pago-monto-${appointment.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={paymentMonto}
                              onChange={(e) => setPaymentMonto(e.target.value)}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor={`pago-metodo-${appointment.id}`}
                              className="form-label small fw-semibold"
                            >
                              Método de pago
                            </label>
                            <select
                              id={`pago-metodo-${appointment.id}`}
                              className="form-select form-select-sm"
                              value={paymentMetodo}
                              onChange={(e) =>
                                setPaymentMetodo(e.target.value as PaymentMethod)
                              }
                            >
                              <option value="transferencia">Transferencia</option>
                              <option value="tarjeta">Tarjeta</option>
                              <option value="efectivo">Efectivo</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor={`pago-observaciones-${appointment.id}`}
                              className="form-label small fw-semibold"
                            >
                              Observaciones (opcional)
                            </label>
                            <textarea
                              id={`pago-observaciones-${appointment.id}`}
                              className="form-control form-control-sm"
                              rows={2}
                              value={paymentObservaciones}
                              onChange={(e) =>
                                setPaymentObservaciones(e.target.value)
                              }
                            />
                          </div>

                          {paymentError && (
                            <div className="alert alert-danger py-2 small">
                              {paymentError}
                            </div>
                          )}

                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary btn-sm"
                              disabled={paymentLoading}
                            >
                              {paymentLoading ? "Registrando..." : "Confirmar registro"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              disabled={paymentLoading}
                              onClick={() => {
                                setPaymentFormTurnoId(null);
                                setPaymentError(null);
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {paymentMessage && paymentMessageTurnoId === appointment.id && (
                        <div className="alert alert-success py-2 small mt-2 mb-0">
                          {paymentMessage}
                        </div>
                      )}
                    </div>

                    {isReprogramando && (

                      <div
                        className="mt-3 pt-3 border-top border-light-subtle"
                        style={{ backgroundColor: "#FAF9FC", padding: "14px", borderRadius: "6px" }}
                      >
                        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
                          <label htmlFor={`reschedule-date-${appointment.id}`} className="small fw-semibold text-muted mb-0">
                            Nueva fecha y hora:
                          </label>
                          <input
                            id={`reschedule-date-${appointment.id}`}
                            type="datetime-local"
                            min={nowForInput}
                            value={nuevaFecha}
                            onChange={(e) => {
                              setNuevaFecha(e.target.value);
                              if (rescheduleError) setRescheduleError(null);
                            }}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            onFocus={(e) => e.currentTarget.showPicker?.()}
                            className={`form-control form-control-sm rounded-2 ${rescheduleError ? "is-invalid" : ""}`}
                            style={{ maxWidth: "240px", cursor: "pointer" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleReprogramarTurno(appointment.id)}
                            className="btn btn-primary btn-sm rounded-2 fw-medium px-3"
                          >
                            Confirmar Reprogramación
                          </button>
                        </div>
                        <FormFieldError error={rescheduleError || undefined} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          confirmText={feedbackModal.confirmText}
          cancelText={feedbackModal.cancelText}
          onConfirm={feedbackModal.onConfirm}
          onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
        />

        <ErrorModal
          error={rescheduleError}
          title="Error al Reprogramar Turno"
          onClose={() => setRescheduleError(null)}
        />
      </div>
    </main>
  );
}

export default MyAppointments;