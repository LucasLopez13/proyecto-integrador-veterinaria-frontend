
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/apiClient";

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
  detalles?: DetalleOrden[];
}

interface ConsultaPendiente {
  id: number;
  fecha?: string;
  turnoId?: number;
  mascota?: {
    nombre?: string;
  };
  conceptosFacturacion?: {
    id: number;
    cantidad: number;
    servicio?: {
      nombre: string;
    };
    producto?: {
      nombre: string;
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

  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<OrdenFacturacion | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [ordenesData, consultasData] = await Promise.all([
        apiFetch<OrdenFacturacion[]>("/facturacion/ordenes"),
        apiFetch<ConsultaPendiente[]>(
          "/facturacion/consultas-pendientes"
        ),
      ]);

      setOrdenes(Array.isArray(ordenesData) ? ordenesData : []);
      setConsultasPendientes(
        Array.isArray(consultasData) ? consultasData : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de facturación."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const generarOrden = async (consultaId: number) => {
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

      setMensaje(`Se generó correctamente la orden de la consulta #${consultaId}.`);

      await cargarDatos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar la orden de facturación."
      );
    } finally {
      setGenerandoId(null);
    }
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

  const formatoMonto = (monto: number | string) =>
    Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    });

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Órdenes de facturación</h1>
          <p className="text-muted mb-0">
            Consultá las órdenes generadas a partir de las consultas médicas.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => void cargarDatos()}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {loading ? (
        <p>Cargando información de facturación...</p>
      ) : (
        <>
          <section className="mb-5">
            <h2 className="h5 mb-3">Consultas pendientes de facturación</h2>

            {consultasPendientes.length === 0 ? (
              <div className="alert alert-light border">
                No hay consultas pendientes de facturación.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Consulta</th>
                      <th>Fecha</th>
                      <th>Mascota</th>
                      <th>Conceptos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasPendientes.map((consulta) => (
                      <tr key={consulta.id}>
                        <td>#{consulta.id}</td>
                        <td>
                          {consulta.fecha
                            ? new Date(consulta.fecha).toLocaleDateString("es-AR")
                            : "No disponible"}
                        </td>
                        <td>{consulta.mascota?.nombre ?? "No disponible"}</td>
                        <td>
                          {consulta.conceptosFacturacion?.length
                            ? consulta.conceptosFacturacion
                                .map(
                                  (concepto) =>
                                    concepto.servicio?.nombre ??
                                    concepto.producto?.nombre ??
                                    "Concepto"
                                )
                                .join(", ")
                            : "Sin conceptos"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={
                              generandoId !== null ||
                              !consulta.conceptosFacturacion?.length
                            }
                            onClick={() => void generarOrden(consulta.id)}
                          >
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

          <hr className="my-4" />

          <section>
            <h2 className="h5 mb-3">Órdenes generadas</h2>

            {ordenes.length === 0 ? (
              <div className="alert alert-light border">
                No hay órdenes de facturación registradas.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>N.º</th>
                      <th>Consulta</th>
                      <th>Fecha de generación</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((orden) => (
                      <tr key={orden.id}>
                        <td>#{orden.id}</td>
                        <td>#{orden.consultaId}</td>
                        <td>
                          {orden.fechaGeneracion
                            ? new Date(orden.fechaGeneracion).toLocaleString("es-AR")
                            : "No disponible"}
                        </td>
                        <td>{formatoMonto(orden.total)}</td>
                        <td>
                          <span
                            className={`badge ${
                              orden.estado === "pagada"
                                ? "text-bg-success"
                                : orden.estado === "anulada"
                                ? "text-bg-danger"
                                : "text-bg-warning"
                            }`}
                          >
                            {orden.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => void verDetalle(orden.id)}
                          >
                            Ver detalle
                          </button>
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

      {loadingDetalle && <p>Cargando detalle...</p>}

      {ordenSeleccionada && (
        <section className="card shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">
                Detalle de orden #{ordenSeleccionada.id}
              </h2>
              <button
                className="btn-close"
                aria-label="Cerrar"
                onClick={() => setOrdenSeleccionada(null)}
              />
            </div>

            <p>
              <strong>Consulta:</strong> #{ordenSeleccionada.consultaId}
            </p>
            <p>
              <strong>Estado:</strong> {ordenSeleccionada.estado}
            </p>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenSeleccionada.detalles?.map((detalle) => (
                    <tr key={detalle.id}>
                      <td>{detalle.descripcion}</td>
                      <td>{detalle.cantidad}</td>
                      <td>{formatoMonto(detalle.precioUnitario)}</td>
                      <td>{formatoMonto(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="h5 text-end">
              Total: {formatoMonto(ordenSeleccionada.total)}
            </h3>
          </div>
        </section>
      )}
    </main>
  );
}

export default BillingManagement;
