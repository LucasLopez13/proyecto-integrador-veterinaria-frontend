import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/apiClient";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { MetricCard } from "../components/common/MetricCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

interface DetalleOrden {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string;
}

interface OrdenFacturacion {
  id: number;
  consultaId: number;
  fechaGeneracion: string;
  total: number | string;
  estado: "pendiente" | "pagada" | "anulada";
  metodoPago?: string;
  fechaPago?: string;
  comprobante?: string;
  detalles?: DetalleOrden[];
  consulta?: {
    id: number;
    turnoId?: number | null;
    mascota?: {
      id: number;
      nombre: string;
      especie?: string;
    };
    veterinario?: {
      id: number;
      nombre: string;
      apellido: string;
    };
  };
}

interface ConsultaPendiente {
  id: number;
  fecha?: string;
  turnoId?: number;
  mascota?: {
    nombre?: string;
    especie?: string;
  };
  conceptosFacturacion?: {
    id: number;
    cantidad: number;
    servicio?: {
      nombre: string;
      precioUnitario?: number | string;
      unidadMedida?: string;
    };
    producto?: {
      nombre: string;
      precioUnitario?: number | string;
      unidadMedida?: string;
    };
  }[];
}

function BillingManagement() {
  const [ordenes, setOrdenes] = useState<OrdenFacturacion[]>([]);
  const [consultasPendientes, setConsultasPendientes] = useState<
    ConsultaPendiente[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [generandoId, setGenerandoId] = useState<number | null>(null);
  const [actualizandoOrdenId, setActualizandoOrdenId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<
    "todas" | "pendiente" | "pagada" | "anulada"
  >("todas");

  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<OrdenFacturacion | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [modalState, setModalState] = useState<FeedbackModalState | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [ordenesData, consultasData] = await Promise.all([
        apiFetch<OrdenFacturacion[]>("/facturacion/ordenes"),
        apiFetch<ConsultaPendiente[]>("/facturacion/consultas-pendientes"),
      ]);

      setOrdenes(Array.isArray(ordenesData) ? ordenesData : []);
      setConsultasPendientes(
        Array.isArray(consultasData) ? consultasData : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de facturacion."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const formatoMonto = (monto: number | string) =>
    Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    });

  const ejecutarGenerarOrden = async (consultaId: number) => {
    try {
      setError("");
      setMensaje("");
      setGenerandoId(consultaId);

      await apiFetch(
        `/facturacion/consultas/${consultaId}/orden-facturacion`,
        {
          method: "POST",
        }
      );

      setMensaje(
        `Se genero correctamente la orden de facturacion para la consulta #${consultaId}. Ya se encuentra disponible para el cliente.`
      );

      await cargarDatos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar la orden de facturacion."
      );
    } finally {
      setGenerandoId(null);
    }
  };

  const solicitarGenerarOrden = (consulta: ConsultaPendiente) => {
    const conceptosLista = consulta.conceptosFacturacion?.length
      ? consulta.conceptosFacturacion
          .map(
            (c) =>
              `${c.servicio?.nombre ?? c.producto?.nombre ?? "Concepto"} (x${c.cantidad})`
          )
          .join(", ")
      : "Sin conceptos";

    setModalState({
      isOpen: true,
      type: "confirm",
      confirmVariant: "primary",
      title: "Confirmar Generacion de Orden",
      message: `¿Confirmas la emision de la orden de facturacion para la consulta #${consulta.id} (${consulta.mascota?.nombre ?? "Paciente"}: ${conceptosLista})? Una vez emitida, le aparecera al cliente para abonar.`,
      confirmText: "Si, generar orden",
      cancelText: "Cancelar",
      onConfirm: () => void ejecutarGenerarOrden(consulta.id),
    });
  };

  const ejecutarCambioEstadoOrden = async (
    orden: OrdenFacturacion,
    nuevoEstado: "pagada" | "anulada"
  ) => {
    try {
      setError("");
      setMensaje("");
      setActualizandoOrdenId(orden.id);

      await apiFetch<OrdenFacturacion>(
        `/facturacion/ordenes/${orden.id}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      setOrdenSeleccionada(null);
      await cargarDatos();

      setMensaje(
        `La orden de facturacion #${orden.id} fue marcada como ${nuevoEstado}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado de la orden."
      );
    } finally {
      setActualizandoOrdenId(null);
    }
  };

  const solicitarCambioEstadoOrden = (
    orden: OrdenFacturacion,
    nuevoEstado: "pagada" | "anulada"
  ) => {
    const esPago = nuevoEstado === "pagada";
    setModalState({
      isOpen: true,
      type: "confirm",
      confirmVariant: esPago ? "primary" : "danger",
      title: esPago ? "Confirmar Cobro de Orden" : "Confirmar Anulacion de Orden",
      message: esPago
        ? `¿Confirmas que la orden #${orden.id} por ${formatoMonto(orden.total)} fue abonada? Se registrara como pagada en el sistema.`
        : `¿Estas seguro de que deseas anular la orden de facturacion #${orden.id}?`,
      confirmText: esPago ? "Marcar como pagada" : "Anular orden",
      cancelText: "Cancelar",
      onConfirm: () => void ejecutarCambioEstadoOrden(orden, nuevoEstado),
    });
  };

  const verDetalle = async (id: number) => {
    try {
      setLoadingDetalle(true);
      setError("");

      const data = await apiFetch<OrdenFacturacion>(
        `/facturacion/ordenes/${id}`
      );

      setOrdenSeleccionada(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el detalle."
      );
    } finally {
      setLoadingDetalle(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(
    (o) => filtroEstado === "todas" || o.estado === filtroEstado
  );

  const totalOrdenes = ordenes.length;
  const ordenesPendientesCount = ordenes.filter(
    (o) => o.estado === "pendiente"
  ).length;
  const ordenesPagadasCount = ordenes.filter(
    (o) => o.estado === "pagada"
  ).length;

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "var(--vet-bg-canvas, #FAF9FC)",
        paddingBottom: "60px",
      }}
    >
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                color: "var(--vet-primary, #6D28D9)",
                border: "1px solid var(--vet-border-tint, #EDE9FE)",
                fontSize: "1.4rem",
              }}
            >
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <div>
              <h1
                className="h3 fw-bold mb-1"
                style={{ color: "var(--vet-text-main, #1E1B4B)" }}
              >
                Ordenes de Facturacion
              </h1>
              <p className="text-muted small mb-0">
                Emision de liquidaciones clinicas, control de cargos y estado de
                cobro
              </p>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-medium"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                borderColor: "var(--vet-primary, #6D28D9)",
              }}
              onClick={() => void cargarDatos()}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger rounded-2 shadow-sm mb-4">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="alert alert-success rounded-2 shadow-sm mb-4">
            {mensaje}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <MetricCard
              label="Consultas por Facturar"
              value={consultasPendientes.length}
              icon="bi-clipboard2-check"
              iconBg="#F5F3FF"
              iconColor="#6D28D9"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              label="Ordenes Pendientes de Cobro"
              value={ordenesPendientesCount}
              icon="bi-clock-history"
              iconBg="#FEF3C7"
              iconColor="#D97706"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              label="Ordenes Pagadas"
              value={`${ordenesPagadasCount} / ${totalOrdenes}`}
              icon="bi-check-circle"
              iconBg="#D1FAE5"
              iconColor="#059669"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando informacion de facturacion..." />
        ) : (
          <>
            <section
              className="bg-white rounded-3 shadow-sm p-4 mb-4"
              style={{ border: "1px solid var(--vet-border-tint, #EDE9FE)" }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h2
                    className="h5 fw-bold mb-1"
                    style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                  >
                    <i
                      className="bi bi-file-earmark-plus me-2"
                      style={{ color: "var(--vet-primary, #6D28D9)" }}
                    ></i>
                    Consultas pendientes de facturacion
                  </h2>
                  <p className="text-muted small mb-0">
                    Consultas medicas con servicios o productos cargados listas
                    para emitir su orden de cobro al cliente.
                  </p>
                </div>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                    color: "var(--vet-primary, #6D28D9)",
                    border: "1px solid var(--vet-border-tint, #EDE9FE)",
                  }}
                >
                  {consultasPendientes.length} pendiente(s)
                </span>
              </div>

              {consultasPendientes.length === 0 ? (
                <div
                  className="rounded-2 p-4 text-center small text-muted"
                  style={{
                    backgroundColor: "#FAF9FC",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <i className="bi bi-check2-circle fs-4 d-block mb-1 text-success"></i>
                  No hay consultas pendientes de facturacion en este momento.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Consulta</th>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Conceptos Registrados</th>
                        <th className="text-end">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultasPendientes.map((consulta) => (
                        <tr key={consulta.id}>
                          <td className="fw-bold" style={{ color: "var(--vet-primary, #6D28D9)" }}>
                            #{consulta.id}
                          </td>
                          <td>
                            {consulta.fecha
                              ? new Date(consulta.fecha).toLocaleDateString("es-AR")
                              : "No disponible"}
                          </td>
                          <td className="fw-semibold text-dark">
                            {consulta.mascota?.nombre ?? "No disponible"}
                          </td>
                          <td>
                            {consulta.conceptosFacturacion?.length ? (
                              <div className="d-flex flex-wrap gap-1">
                                {consulta.conceptosFacturacion.map((concepto) => (
                                  <span
                                    key={concepto.id}
                                    className="badge rounded-pill fw-medium"
                                    style={{
                                      backgroundColor: "#F5F3FF",
                                      color: "#6D28D9",
                                      border: "1px solid #EDE9FE",
                                    }}
                                  >
                                    {concepto.servicio?.nombre ??
                                      concepto.producto?.nombre ??
                                      "Concepto"}{" "}
                                    ({concepto.producto?.unidadMedida ? `${concepto.cantidad} ${concepto.producto.unidadMedida}` : `x${concepto.cantidad}`})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted small">Sin conceptos</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary rounded-2 shadow-sm px-3 fw-medium d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: "var(--vet-primary, #6D28D9)",
                                borderColor: "var(--vet-primary, #6D28D9)",
                              }}
                              disabled={
                                generandoId !== null ||
                                !consulta.conceptosFacturacion?.length
                              }
                              onClick={() => solicitarGenerarOrden(consulta)}
                            >
                              <i className="bi bi-receipt"></i>
                              {generandoId === consulta.id
                                ? "Generando..."
                                : "Generar orden"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section
              className="bg-white rounded-3 shadow-sm p-4"
              style={{ border: "1px solid var(--vet-border-tint, #EDE9FE)" }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                  <h2
                    className="h5 fw-bold mb-1"
                    style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                  >
                    <i
                      className="bi bi-card-checklist me-2"
                      style={{ color: "var(--vet-primary, #6D28D9)" }}
                    ></i>
                    Ordenes de facturacion emitidas
                  </h2>
                  <p className="text-muted small mb-0">
                    Las ordenes emitidas son visibles para el tutor en Mis Turnos
                    y pueden ser abonadas por el cliente o cobradas en recepcion.
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {[
                    { value: "todas", label: "Todas", icon: "bi-collection" },
                    { value: "pendiente", label: "Pendientes", icon: "bi-clock-history" },
                    { value: "pagada", label: "Pagadas", icon: "bi-check2-circle" },
                    { value: "anulada", label: "Anuladas", icon: "bi-x-circle" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn btn-sm rounded-2 fw-medium d-inline-flex align-items-center gap-1 px-3 ${
                        filtroEstado === opt.value
                          ? "btn-primary text-white"
                          : "btn-outline-secondary bg-white text-dark border"
                      }`}
                      style={
                        filtroEstado === opt.value
                          ? {
                              backgroundColor: "var(--vet-primary, #6D28D9)",
                              borderColor: "var(--vet-primary, #6D28D9)",
                            }
                          : { borderColor: "var(--vet-border-tint, #EDE9FE)" }
                      }
                      onClick={() =>
                        setFiltroEstado(
                          opt.value as "todas" | "pendiente" | "pagada" | "anulada"
                        )
                      }
                    >
                      <i className={`bi ${opt.icon}`}></i>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {ordenesFiltradas.length === 0 ? (
                <EmptyState
                  icon="bi-receipt"
                  title="No hay ordenes para el filtro seleccionado"
                  description="Genera una orden desde las consultas pendientes o cambia el filtro de estado."
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nro. Orden</th>
                        <th>Consulta / Paciente</th>
                        <th>Fecha de Emision</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenesFiltradas.map((orden) => (
                        <tr key={orden.id}>
                          <td className="fw-bold" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            #{orden.id}
                          </td>
                          <td>
                            <span className="fw-semibold text-dark">
                              Consulta #{orden.consultaId}
                            </span>
                            {orden.consulta?.mascota?.nombre && (
                              <span className="text-muted small d-block">
                                Paciente: {orden.consulta.mascota.nombre}
                              </span>
                            )}
                          </td>
                          <td>
                            {orden.fechaGeneracion
                              ? new Date(orden.fechaGeneracion).toLocaleString("es-AR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "No disponible"}
                          </td>
                          <td>
                            <strong
                              style={{ color: "var(--vet-primary, #6D28D9)" }}
                            >
                              {formatoMonto(orden.total)}
                            </strong>
                          </td>
                          <td>
                            <span
                              className="badge rounded-pill px-3 py-2 fw-semibold text-capitalize"
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
                                border: `1px solid ${
                                  orden.estado === "pagada"
                                    ? "#A7F3D0"
                                    : orden.estado === "anulada"
                                    ? "#FCA5A5"
                                    : "#FDE68A"
                                }`,
                              }}
                            >
                              <i
                                className={`bi me-1 ${
                                  orden.estado === "pagada"
                                    ? "bi-check2-circle"
                                    : orden.estado === "anulada"
                                    ? "bi-x-circle"
                                    : "bi-clock-history"
                                }`}
                              ></i>
                              {orden.estado}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-2 fw-medium"
                                onClick={() => void verDetalle(orden.id)}
                                disabled={loadingDetalle}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Detalle
                              </button>
                              {orden.estado === "pendiente" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm rounded-2 text-white fw-medium"
                                    style={{
                                      backgroundColor: "#059669",
                                      borderColor: "#059669",
                                    }}
                                    disabled={actualizandoOrdenId === orden.id}
                                    onClick={() =>
                                      solicitarCambioEstadoOrden(orden, "pagada")
                                    }
                                  >
                                    <i className="bi bi-check2 me-1"></i>
                                    Marcar pagada
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-2 fw-medium"
                                    disabled={actualizandoOrdenId === orden.id}
                                    onClick={() =>
                                      solicitarCambioEstadoOrden(orden, "anulada")
                                    }
                                  >
                                    Anular
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {ordenSeleccionada && (
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(30, 27, 75, 0.45)" }}
            onClick={() => setOrdenSeleccionada(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-content rounded-3 border-0 shadow"
                style={{ border: "1px solid var(--vet-border-tint, #EDE9FE)" }}
              >
                <div
                  className="modal-header border-bottom"
                  style={{
                    backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i
                      className="bi bi-receipt fs-4"
                      style={{ color: "var(--vet-primary, #6D28D9)" }}
                    ></i>
                    <div>
                      <h3
                        className="h5 fw-bold mb-0"
                        style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                      >
                        Detalle de Orden #{ordenSeleccionada.id}
                      </h3>
                      <span className="small text-muted">
                        Consulta medica #{ordenSeleccionada.consultaId}
                        {ordenSeleccionada.consulta?.mascota?.nombre
                          ? ` · Paciente: ${ordenSeleccionada.consulta.mascota.nombre}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setOrdenSeleccionada(null)}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <span className="small text-muted">
                      Fecha de generacion:{" "}
                      <strong className="text-dark">
                        {ordenSeleccionada.fechaGeneracion
                          ? new Date(
                              ordenSeleccionada.fechaGeneracion
                            ).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "No disponible"}
                      </strong>
                    </span>
                    <span
                      className="badge rounded-pill px-3 py-2 fw-semibold text-capitalize"
                      style={{
                        backgroundColor:
                          ordenSeleccionada.estado === "pagada"
                            ? "#ECFDF5"
                            : ordenSeleccionada.estado === "anulada"
                            ? "#FEF2F2"
                            : "#FFFBEB",
                        color:
                          ordenSeleccionada.estado === "pagada"
                            ? "#059669"
                            : ordenSeleccionada.estado === "anulada"
                            ? "#DC2626"
                            : "#D97706",
                      }}
                    >
                      Estado: {ordenSeleccionada.estado}
                    </span>
                  </div>

                  {ordenSeleccionada.estado === "pagada" && (
                    <div className="alert alert-success py-2 px-3 small mb-3 d-flex flex-wrap gap-3 align-items-center">
                      <div>
                        <strong>Metodo de pago:</strong>{" "}
                        <span className="text-capitalize">{ordenSeleccionada.metodoPago || "Efectivo"}</span>
                      </div>
                      {ordenSeleccionada.fechaPago && (
                        <div>
                          <strong>Fecha de pago:</strong>{" "}
                          {new Date(ordenSeleccionada.fechaPago).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </div>
                      )}
                      {ordenSeleccionada.comprobante && (
                        <div>
                          <strong>Comprobante:</strong> {ordenSeleccionada.comprobante}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="table-responsive">
                    <table className="table table-sm align-middle border">
                      <thead className="table-light">
                        <tr>
                          <th>Concepto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio Unitario</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordenSeleccionada.detalles?.map((detalle) => (
                          <tr key={detalle.id}>
                            <td className="fw-medium">{detalle.descripcion}</td>
                            <td className="text-center">{detalle.cantidad}</td>
                            <td className="text-end">
                              {formatoMonto(detalle.precioUnitario)}
                            </td>
                            <td className="text-end fw-semibold">
                              {formatoMonto(detalle.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="d-flex justify-content-between align-items-center p-3 rounded-2 mt-3"
                    style={{
                      backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                      border: "1px solid var(--vet-border-tint, #EDE9FE)",
                    }}
                  >
                    <span
                      className="fw-bold"
                      style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                    >
                      Total de la Orden
                    </span>
                    <span
                      className="fs-5 fw-bold"
                      style={{ color: "var(--vet-primary, #6D28D9)" }}
                    >
                      {formatoMonto(ordenSeleccionada.total)}
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  {ordenSeleccionada.estado === "pendiente" && (
                    <button
                      type="button"
                      className="btn btn-sm text-white rounded-2 px-3 fw-medium"
                      style={{
                        backgroundColor: "#059669",
                        borderColor: "#059669",
                      }}
                      onClick={() =>
                        solicitarCambioEstadoOrden(ordenSeleccionada, "pagada")
                      }
                    >
                      <i className="bi bi-check2 me-1"></i>
                      Marcar como pagada
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-2 px-3"
                    onClick={() => setOrdenSeleccionada(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
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

export default BillingManagement;
