import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Appointment, PaginatedAppointments } from "../types/Appointment";
import { apiFetch } from "../services/apiClient";
import { MONTH_NAMES } from "../utils/dateUtils";
import { BUSINESS_HOURS_SLOTS } from "../constants";
import { getSpeciesIcon } from "../utils/speciesIcon";
import { AppointmentStatusBadge } from "../components/common/AppointmentStatusBadge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { ErrorModal } from "../components/common/ErrorModal";
import { FormFieldError } from "../components/common/FormFieldError";
import { Pagination } from "../components/common/Pagination";

export type MetodoPago = "transferencia" | "tarjeta" | "efectivo";

interface DetalleOrdenCliente {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string;
}

interface OrdenFacturacionCliente {
  id: number;
  consultaId: number;
  fechaGeneracion: string;
  total: number | string;
  estado: "pendiente" | "pagada" | "anulada";
  metodoPago?: string;
  fechaPago?: string;
  comprobante?: string;
  detalles?: DetalleOrdenCliente[];
  consulta?: {
    id: number;
    turnoId?: number | null;
    mascotaId?: number;
    mascota?: {
      id: number;
      nombre: string;
      especie?: string;
    };
  };
}

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ordenesFacturacion, setOrdenesFacturacion] = useState<OrdenFacturacionCliente[]>([]);
  const [paymentFormOrdenId, setPaymentFormOrdenId] = useState<number | null>(null);
  const [paymentMetodo, setPaymentMetodo] = useState<MetodoPago>("transferencia");
  const [paymentObservaciones, setPaymentObservaciones] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentMessageOrdenId, setPaymentMessageOrdenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
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

  const cargarOrdenes = async () => {
    try {
      const data = await apiFetch<OrdenFacturacionCliente[]>("/facturacion/mis-ordenes");
      setOrdenesFacturacion(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("No se pudieron cargar las ordenes de facturacion:", err);
    }
  };

  useEffect(() => {
    cargarTurnos(1);
    cargarOrdenes();
  }, []);

  const handlePagarOrden = async (ordenId: number) => {
    setPaymentError(null);
    setPaymentMessage(null);

    try {
      setPaymentLoading(true);

      await apiFetch<{ message: string; orden: OrdenFacturacionCliente }>(
        `/facturacion/ordenes/${ordenId}/pagar`,
        {
          method: "POST",
          body: JSON.stringify({
            metodoPago: paymentMetodo,
            comprobante: paymentObservaciones.trim() || undefined,
          }),
        }
      );

      await cargarOrdenes();

      setPaymentFormOrdenId(null);
      setPaymentMetodo("transferencia");
      setPaymentObservaciones("");
      setPaymentMessageOrdenId(ordenId);
      setPaymentMessage("¡Pago registrado con exito! La factura ha quedado abonada.");
    } catch (err: any) {
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
      message: "¿Estas seguro de que deseas cancelar este turno veterinario? Esta accion no se puede deshacer.",
      confirmText: "Si, Cancelar Turno",
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

  const hoyStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const isSlotInPast = (slotStr: string, dateStr: string) => {
    if (dateStr !== hoyStr) return false;
    const now = new Date();
    const [slotH, slotM] = slotStr.split(":").map(Number);
    return (
      slotH < now.getHours() ||
      (slotH === now.getHours() && slotM <= now.getMinutes())
    );
  };

  const handleReprogramarTurno = async (id: number) => {
    setRescheduleError(null);

    if (!nuevaFecha || !nuevaHora) {
      setRescheduleError("Selecciona una nueva fecha y horario (formato 24 hs) para reprogramar el turno.");
      return;
    }

    if (nuevaHora < "08:00" || nuevaHora > "20:00") {
      setRescheduleError("El horario de reprogramacion debe ser entre las 08:00 y las 20:00 hs.");
      return;
    }

    const fechaHoraCombinada = `${nuevaFecha}T${nuevaHora}:00`;

    if (new Date(fechaHoraCombinada).getTime() <= Date.now()) {
      setRescheduleError("No podes reprogramar un turno para una fecha u horario que ya ha transcurrido.");
      return;
    }

    try {
      await apiFetch<Appointment>(`/turnos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fecha: new Date(fechaHoraCombinada).toISOString(),
        }),
      });

      await cargarTurnos(currentPage);

      setReprogramandoId(null);
      setNuevaFecha("");
      setNuevaHora("");
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

  const turnosIdsEnVista = new Set(appointments.map((a) => a.id));
  const ordenesSinTurnoEnVista = ordenesFacturacion.filter(
    (o) => !o.consulta?.turnoId || !turnosIdsEnVista.has(o.consulta.turnoId)
  );

  return (
    <main style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--vet-bg-canvas, #FAF9FC)", paddingBottom: "60px" }}>
      <div className="container py-4" style={{ maxWidth: "860px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Mis Turnos y Facturacion
            </h1>
            <p className="text-muted small mb-0">
              Consulta tus citas veterinarias, liquidaciones clinicas y abona tus facturas emitidas
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

        {ordenesSinTurnoEnVista.length > 0 && (
          <section className="mb-4">
            <h2 className="h6 fw-bold mb-3" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              <i className="bi bi-receipt me-2" style={{ color: "var(--vet-primary, #6D28D9)" }}></i>
              Ordenes de Facturacion de Consultas Clinicas
            </h2>
            <div className="d-flex flex-column gap-3">
              {ordenesSinTurnoEnVista.map((orden) => {
                return (
                  <div
                    key={orden.id}
                    className="bg-white rounded-3 border p-3 shadow-sm"
                    style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
                  >
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                      <div>
                        <span className="fw-bold" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                          Orden de Facturacion #{orden.id}
                        </span>
                        <span className="text-muted small ms-2">
                          Consulta #{orden.consultaId}
                          {orden.consulta?.mascota?.nombre
                            ? ` · ${orden.consulta.mascota.nombre}`
                            : ""}
                        </span>
                      </div>
                      <span
                        className="badge rounded-pill px-3 py-1 fw-semibold text-capitalize"
                        style={{
                          backgroundColor:
                            orden.estado === "pagada"
                              ? "#ECFDF5"
                              : orden.estado === "anulada"
                                ? "#FEF2F2"
                                : "#FFFBEB",
                          color:
                            orden.estado === "pagada"
                              ? "#059669"
                              : orden.estado === "anulada"
                                ? "#DC2626"
                                : "#D97706",
                        }}
                      >
                        {orden.estado}
                      </span>
                    </div>

                    {orden.detalles && orden.detalles.length > 0 && (
                      <div className="small text-muted mb-2">
                        {orden.detalles
                          .map(
                            (d) =>
                              `${d.descripcion} (x${d.cantidad}: $${Number(d.subtotal).toLocaleString("es-AR")})`
                          )
                          .join(" · ")}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top border-light-subtle">
                      <span className="small">
                        Total facturado:{" "}
                        <strong style={{ color: "var(--vet-primary, #6D28D9)" }}>
                          ${Number(orden.total).toLocaleString("es-AR")}
                        </strong>
                      </span>

                      {orden.estado === "pagada" ? (
                        <div className="small text-success fw-semibold">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Factura abonada mediante <span className="text-capitalize">{orden.metodoPago || "transferencia"}</span>
                          {orden.fechaPago ? ` el ${new Date(orden.fechaPago).toLocaleDateString("es-AR")}` : ""}.
                        </div>
                      ) : orden.estado === "anulada" ? (
                        <div className="small text-danger fw-semibold">
                          <i className="bi bi-x-circle-fill me-1"></i>
                          Orden anulada.
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1 shadow-sm px-3"
                          style={{
                            backgroundColor: "var(--vet-primary, #6D28D9)",
                            borderColor: "var(--vet-primary, #6D28D9)",
                          }}
                          onClick={() => {
                            setPaymentFormOrdenId(orden.id);
                            setPaymentMetodo("transferencia");
                            setPaymentObservaciones("");
                            setPaymentError(null);
                            setPaymentMessage(null);
                          }}
                        >
                          <i className="bi bi-credit-card me-1"></i>
                          Abonar factura (${Number(orden.total).toLocaleString("es-AR")})
                        </button>
                      )}
                    </div>

                    {paymentFormOrdenId === orden.id && (
                      <form
                        className="mt-3 p-3 rounded-2 border"
                        style={{ backgroundColor: "#FAF9FC", borderColor: "var(--vet-border-tint, #EDE9FE)" }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handlePagarOrden(orden.id);
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="h6 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            <i className="bi bi-credit-card me-2 text-primary"></i>
                            Abonar Orden #{orden.id}
                          </h5>
                          <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                            Total: ${Number(orden.total).toLocaleString("es-AR")}
                          </span>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-12 col-sm-6">
                            <label htmlFor={`metodo-orden-${orden.id}`} className="form-label small fw-semibold">
                              Metodo de pago
                            </label>
                            <select
                              id={`metodo-orden-${orden.id}`}
                              className="form-select form-select-sm"
                              value={paymentMetodo}
                              onChange={(e) => setPaymentMetodo(e.target.value as MetodoPago)}
                            >
                              <option value="transferencia">Transferencia Bancaria</option>
                              <option value="tarjeta">Tarjeta de Debito / Credito</option>
                              <option value="efectivo">Efectivo en Clinica</option>
                            </select>
                          </div>

                          <div className="col-12 col-sm-6">
                            <label htmlFor={`obs-orden-${orden.id}`} className="form-label small fw-semibold">
                              Comprobante / Detalle (opcional)
                            </label>
                            <input
                              id={`obs-orden-${orden.id}`}
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Ej: Nro. de transferencia o comprobante"
                              value={paymentObservaciones}
                              onChange={(e) => setPaymentObservaciones(e.target.value)}
                            />
                          </div>
                        </div>

                        {paymentError && (
                          <div className="alert alert-danger py-2 small mb-3">
                            {paymentError}
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm rounded-2 fw-medium px-3"
                            style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? "Procesando pago..." : "Confirmar pago"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm rounded-2"
                            disabled={paymentLoading}
                            onClick={() => {
                              setPaymentFormOrdenId(null);
                              setPaymentError(null);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}

                    {paymentMessage && paymentMessageOrdenId === orden.id && (
                      <div className="alert alert-success py-2 small mt-2 mb-0">
                        {paymentMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {loading ? (
          <LoadingSpinner message="Cargando tus turnos..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="bi-calendar-check"
            title="No tenes turnos solicitados"
            description="Cuando solicites una cita, vas a poder darle seguimiento desde esta seccion."
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
                const ordenVinculada = ordenesFacturacion.find(
                  (o) => o.consulta?.turnoId === appointment.id
                );

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
                            <strong>Motivo:</strong> {appointment.motivo || "Consulta de rutina / Revision"}
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
                                setNuevaHora("");
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

                    {ordenVinculada && (
                      <div className="mt-3 pt-3 border-top border-light-subtle">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                          <h4 className="small fw-bold mb-0">
                            <i className="bi bi-credit-card me-2" style={{ color: "var(--vet-primary, #6D28D9)" }}></i>
                            {`Facturacion de la Consulta (Orden #${ordenVinculada.id})`}
                          </h4>
                          <span
                            className="badge rounded-pill px-2 py-1 text-capitalize"
                            style={{
                              backgroundColor:
                                ordenVinculada.estado === "pagada"
                                  ? "#ECFDF5"
                                  : ordenVinculada.estado === "anulada"
                                    ? "#FEF2F2"
                                    : "#FFFBEB",
                              color:
                                ordenVinculada.estado === "pagada"
                                  ? "#059669"
                                  : ordenVinculada.estado === "anulada"
                                    ? "#DC2626"
                                    : "#D97706",
                            }}
                          >
                            Factura {ordenVinculada.estado}
                          </span>
                        </div>

                        <div
                          className="rounded-2 p-2 mb-2 small"
                          style={{
                            backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                            border: "1px solid var(--vet-border-tint, #EDE9FE)",
                          }}
                        >
                          {ordenVinculada.detalles && ordenVinculada.detalles.length > 0 && (
                            <div className="text-muted mb-1">
                              {ordenVinculada.detalles
                                .map(
                                  (d) =>
                                    `${d.descripcion} x${d.cantidad} ($${Number(d.subtotal).toLocaleString("es-AR")})`
                                )
                                .join(" · ")}
                            </div>
                          )}
                          <div className="fw-semibold" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            Importe total facturado:{" "}
                            <span style={{ color: "var(--vet-primary, #6D28D9)" }}>
                              ${Number(ordenVinculada.total).toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">
                          {ordenVinculada.estado === "pagada" ? (
                            <div className="small text-success fw-semibold">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Factura abonada mediante <span className="text-capitalize">{ordenVinculada.metodoPago || "transferencia"}</span>
                              {ordenVinculada.fechaPago ? ` el ${new Date(ordenVinculada.fechaPago).toLocaleDateString("es-AR")}` : ""}.
                            </div>
                          ) : ordenVinculada.estado === "anulada" ? (
                            <div className="small text-danger fw-semibold">
                              <i className="bi bi-x-circle-fill me-1"></i>
                              Orden de facturacion anulada.
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1 shadow-sm px-3"
                              style={{
                                backgroundColor: "var(--vet-primary, #6D28D9)",
                                borderColor: "var(--vet-primary, #6D28D9)",
                              }}
                              onClick={() => {
                                setPaymentFormOrdenId(ordenVinculada.id);
                                setPaymentMetodo("transferencia");
                                setPaymentObservaciones("");
                                setPaymentError(null);
                                setPaymentMessage(null);
                              }}
                            >
                              <i className="bi bi-credit-card me-1"></i>
                              {`Abonar factura ($${Number(ordenVinculada.total).toLocaleString("es-AR")})`}
                            </button>
                          )}
                        </div>

                        {paymentFormOrdenId === ordenVinculada.id && (
                          <form
                            className="mt-3 p-3 rounded-2 border"
                            style={{ backgroundColor: "#FAF9FC", borderColor: "var(--vet-border-tint, #EDE9FE)" }}
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handlePagarOrden(ordenVinculada.id);
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="h6 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                                <i className="bi bi-credit-card me-2 text-primary"></i>
                                Abonar Orden #{ordenVinculada.id}
                              </h5>
                              <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                                Total: ${Number(ordenVinculada.total).toLocaleString("es-AR")}
                              </span>
                            </div>

                            <div className="row g-2 mb-3">
                              <div className="col-12 col-sm-6">
                                <label htmlFor={`metodo-turno-${ordenVinculada.id}`} className="form-label small fw-semibold">
                                  Metodo de pago
                                </label>
                                <select
                                  id={`metodo-turno-${ordenVinculada.id}`}
                                  className="form-select form-select-sm"
                                  value={paymentMetodo}
                                  onChange={(e) => setPaymentMetodo(e.target.value as MetodoPago)}
                                >
                                  <option value="transferencia">Transferencia Bancaria</option>
                                  <option value="tarjeta">Tarjeta de Debito / Credito</option>
                                  <option value="efectivo">Efectivo en Clinica</option>
                                </select>
                              </div>

                              <div className="col-12 col-sm-6">
                                <label htmlFor={`obs-turno-${ordenVinculada.id}`} className="form-label small fw-semibold">
                                  Comprobante / Detalle (opcional)
                                </label>
                                <input
                                  id={`obs-turno-${ordenVinculada.id}`}
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Ej: Nro. de operacion o comprobante"
                                  value={paymentObservaciones}
                                  onChange={(e) => setPaymentObservaciones(e.target.value)}
                                />
                              </div>
                            </div>

                            {paymentError && (
                              <div className="alert alert-danger py-2 small mb-3">
                                {paymentError}
                              </div>
                            )}

                            <div className="d-flex gap-2">
                              <button
                                type="submit"
                                className="btn btn-primary btn-sm rounded-2 fw-medium px-3"
                                style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                                disabled={paymentLoading}
                              >
                                {paymentLoading ? "Procesando pago..." : "Confirmar pago"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-2"
                                disabled={paymentLoading}
                                onClick={() => {
                                  setPaymentFormOrdenId(null);
                                  setPaymentError(null);
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        )}

                        {paymentMessage && paymentMessageOrdenId === ordenVinculada.id && (
                          <div className="alert alert-success py-2 small mt-2 mb-0">
                            {paymentMessage}
                          </div>
                        )}
                      </div>
                    )}

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
                            type="date"
                            min={hoyStr}
                            value={nuevaFecha}
                            onChange={(e) => {
                              const nextDate = e.target.value;
                              setNuevaFecha(nextDate);
                              if (nuevaHora && isSlotInPast(nuevaHora, nextDate)) {
                                setNuevaHora("");
                              }
                              if (rescheduleError) setRescheduleError(null);
                            }}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            onFocus={(e) => e.currentTarget.showPicker?.()}
                            className={`form-control form-control-sm rounded-2 ${rescheduleError ? "is-invalid" : ""}`}
                            style={{ maxWidth: "170px", cursor: "pointer" }}
                          />
                          <select
                            id={`reschedule-time-${appointment.id}`}
                            value={nuevaHora}
                            onChange={(e) => {
                              setNuevaHora(e.target.value);
                              if (rescheduleError) setRescheduleError(null);
                            }}
                            className={`form-select form-select-sm rounded-2 ${rescheduleError ? "is-invalid" : ""}`}
                            style={{ maxWidth: "160px", cursor: "pointer" }}
                          >
                            <option value="">Horario (24 hs)</option>
                            {BUSINESS_HOURS_SLOTS.filter(
                              (h) => !isSlotInPast(h, nuevaFecha)
                            ).map((h) => (
                              <option key={h} value={h}>
                                {h} hs
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleReprogramarTurno(appointment.id)}
                            className="btn btn-primary btn-sm rounded-2 fw-medium px-3"
                          >
                            Confirmar Reprogramacion
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
