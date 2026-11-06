import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { alertaStockService } from "../services/alertaStockService";
import { inventarioService } from "../services/inventarioService";
import type {
  AlertaStock,
  RespuestaAlertasStock,
} from "../types/AlertaStock";
import type {
  ProductoConLotes,
  MovimientoStockItem,
} from "../types/Inventario";
import "../styles/AlertasStock.css";

function AlertasStock() {
  const { token } = useAuth();

  const [pestanaActiva, setPestanaActiva] = useState<"alertas" | "movimientos">("alertas");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "stock_critico" | "proximo_vencer" | "normal">("todos");
  const [datos, setDatos] = useState<RespuestaAlertasStock | null>(null);
  const [dias, setDias] = useState(30);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [movimientos, setMovimientos] = useState<MovimientoStockItem[]>([]);
  const [cargandoMovs, setCargandoMovs] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productosInventario, setProductosInventario] = useState<ProductoConLotes[]>([]);
  const [prodIdSel, setProdIdSel] = useState("");
  const [loteIdSel, setLoteIdSel] = useState("");
  const [cantidadConsumo, setCantidadConsumo] = useState("");
  const [observacionesConsumo, setObservacionesConsumo] = useState("");
  const [guardandoConsumo, setGuardandoConsumo] = useState(false);
  const [errorConsumoModal, setErrorConsumoModal] = useState<string | null>(null);
  const [exitoConsumoModal, setExitoConsumoModal] = useState<string | null>(null);

  const cargarAlertas = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await alertaStockService.getAll(dias, token ?? undefined);
      setDatos(resultado);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las alertas."
      );
    } finally {
      setCargando(false);
    }
  }, [dias, token]);

  const cargarMovimientos = useCallback(async () => {
    setCargandoMovs(true);
    try {
      const hist = await inventarioService.getHistorialMovimientos(40, token ?? undefined);
      setMovimientos(hist);
    } catch (err) {
      console.error("Error al cargar historial de movimientos:", err);
    } finally {
      setCargandoMovs(false);
    }
  }, [token]);

  const cargarCatalogoModal = useCallback(async () => {
    try {
      const listado = await inventarioService.getProductosConLotes(token ?? undefined);
      setProductosInventario(listado);
    } catch (err) {
      console.error("Error al cargar catalogo para consumo:", err);
    }
  }, [token]);

  useEffect(() => {
    void cargarAlertas();
    void cargarCatalogoModal();
  }, [cargarAlertas, cargarCatalogoModal]);

  useEffect(() => {
    if (pestanaActiva === "movimientos") {
      void cargarMovimientos();
    }
  }, [pestanaActiva, cargarMovimientos]);

  const abrirModalConsumo = () => {
    setProdIdSel("");
    setLoteIdSel("");
    setCantidadConsumo("");
    setObservacionesConsumo("");
    setErrorConsumoModal(null);
    setExitoConsumoModal(null);
    void cargarCatalogoModal();
    setModalAbierto(true);
  };

  const productoSeleccionado = productosInventario.find((p) => String(p.id) === String(prodIdSel));
  const lotesDisponibles = productoSeleccionado ? productoSeleccionado.lotesDisponibles : [];
  const loteSeleccionado = lotesDisponibles.find((l) => String(l.id) === String(loteIdSel));

  const handleConfirmarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorConsumoModal(null);
    setExitoConsumoModal(null);

    if (!prodIdSel || !productoSeleccionado) {
      setErrorConsumoModal("Por favor selecciona un medicamento o insumo.");
      return;
    }
    if (!loteIdSel || !loteSeleccionado) {
      setErrorConsumoModal("Por favor selecciona un lote valido.");
      return;
    }
    const cantNum = parseFloat(cantidadConsumo);
    if (isNaN(cantNum) || cantNum <= 0) {
      setErrorConsumoModal("Ingresa una cantidad valida mayor a 0.");
      return;
    }
    if (cantNum > loteSeleccionado.stockActual) {
      setErrorConsumoModal(
        `Stock insuficiente en lote ${loteSeleccionado.numeroLote}. Disponible: ${loteSeleccionado.stockActual} ${productoSeleccionado.unidadMedida}.`
      );
      return;
    }

    try {
      setGuardandoConsumo(true);
      const res = await inventarioService.registrarConsumo(
        {
          productoId: Number(prodIdSel),
          loteId: Number(loteIdSel),
          cantidad: cantNum,
          observaciones: observacionesConsumo.trim() || undefined,
        },
        token ?? undefined
      );

      setExitoConsumoModal(
        `Deduccion de ${res.cantidadConsumida} ${res.producto.unidadMedida} completada. Nuevo stock lote: ${res.lote.stockActual}, producto: ${res.producto.stockActual}.`
      );
      setCantidadConsumo("");
      setObservacionesConsumo("");

      void cargarAlertas();
      if (pestanaActiva === "movimientos") {
        void cargarMovimientos();
      }
      void cargarCatalogoModal();
    } catch (err: any) {
      setErrorConsumoModal(err.message || "Error al procesar la deduccion de stock.");
    } finally {
      setGuardandoConsumo(false);
    }
  };

  const criticas =
    datos?.alertas.filter((alerta) => alerta.nivel === "CRITICO").length ?? 0;

  const advertencias =
    datos?.alertas.filter((alerta) => alerta.nivel === "ADVERTENCIA").length ?? 0;

  return (
    <main className="alertas-page">
      <header className="alertas-header">
        <div>
          <p className="alertas-eyebrow">VETCARE . INVENTARIO</p>
          <h1>Alertas de stock y vencimiento</h1>
          <p className="alertas-subtitle">
            Controla los productos con stock bajo y los lotes vencidos o
            proximos a vencer. Deduccion fraccionada disponible.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3 py-2 fw-medium"
            style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
            onClick={abrirModalConsumo}
          >
            <i className="bi bi-dash-circle"></i>
            <span>Registrar Consumo Directo</span>
          </button>

          <button
            type="button"
            className="alertas-refresh"
            onClick={() => {
              void cargarAlertas();
              if (pestanaActiva === "movimientos") void cargarMovimientos();
            }}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      <div className="d-flex gap-2 border-bottom mb-4 pb-2">
        <button
          type="button"
          className={`btn btn-sm ${pestanaActiva === "alertas" ? "btn-dark fw-bold" : "btn-outline-secondary"}`}
          onClick={() => setPestanaActiva("alertas")}
        >
          <i className="bi bi-bell me-1"></i>
          Alertas Activas ({datos?.total ?? 0})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${pestanaActiva === "movimientos" ? "btn-dark fw-bold" : "btn-outline-secondary"}`}
          onClick={() => setPestanaActiva("movimientos")}
        >
          <i className="bi bi-clock-history me-1"></i>
          Historial de Movimientos
        </button>
      </div>

      {pestanaActiva === "alertas" && (
        <>
          <section className="alertas-resumen" aria-label="Resumen de alertas">
            <article className="alerta-resumen-card">
              <span>Total de alertas</span>
              <strong>{datos?.total ?? 0}</strong>
            </article>

            <article className="alerta-resumen-card alerta-resumen-critica">
              <span>Criticas</span>
              <strong>{criticas}</strong>
            </article>

            <article className="alerta-resumen-card alerta-resumen-advertencia">
              <span>Advertencias</span>
              <strong>{advertencias}</strong>
            </article>
          </section>

          <section className="alertas-filtros d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <span className="small fw-semibold text-muted me-1">
                <i className="bi bi-funnel me-1"></i> Estado:
              </span>
              {[
                { key: "todos", label: "Todas las Alertas" },
                { key: "stock_critico", label: "Stock Crítico" },
                { key: "proximo_vencer", label: "Próximo a Vencer" },
                { key: "normal", label: "Normal" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`btn btn-sm rounded-2 fw-medium ${
                    filtroEstado === item.key ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  style={
                    filtroEstado === item.key
                      ? { backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }
                      : undefined
                  }
                  onClick={() =>
                    setFiltroEstado(item.key as "todos" | "stock_critico" | "proximo_vencer" | "normal")
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2">
              <label htmlFor="diasVencimiento" className="mb-0">
                Avisar por vencimientos dentro de:
              </label>

              <select
                id="diasVencimiento"
                value={dias}
                onChange={(event) => setDias(Number(event.target.value))}
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
                <option value={180}>180 dias</option>
                <option value={365}>365 dias</option>
              </select>
            </div>
          </section>

          {cargando && (
            <p className="alertas-estado" role="status">
              Cargando alertas...
            </p>
          )}

          {!cargando && error && (
            <div className="alertas-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void cargarAlertas()}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && filtroEstado === "normal" && (
            <section className="alertas-lista" aria-label="Productos con stock normal">
              {productosInventario
                .filter((p) => Number(p.stockActual) > Number(p.alertaStockMinimo))
                .map((prod) => (
                  <article key={prod.id} className="alerta-card" style={{ borderLeft: "4px solid #059669" }}>
                    <div className="alerta-card-header">
                      <div>
                        <span
                          className="alerta-badge"
                          style={{ backgroundColor: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                        >
                          STOCK NORMAL
                        </span>
                        <h2>{prod.nombre}</h2>
                      </div>
                      <span
                        className="alerta-tipo"
                        style={{ color: "#059669", fontWeight: 600 }}
                      >
                        Disponible para consumo
                      </span>
                    </div>
                    <p className="alerta-mensaje">
                      Stock disponible por encima del umbral mínimo ({prod.alertaStockMinimo} {prod.unidadMedida}).
                    </p>
                    <dl className="alerta-detalles">
                      <div>
                        <dt>Stock actual</dt>
                        <dd>{prod.stockActual} {prod.unidadMedida}</dd>
                      </div>
                      <div>
                        <dt>Umbral mínimo</dt>
                        <dd>{prod.alertaStockMinimo} {prod.unidadMedida}</dd>
                      </div>
                      {prod.lotesDisponibles?.[0] && (
                        <>
                          <div>
                            <dt>Lote FEFO activo</dt>
                            <dd>{prod.lotesDisponibles[0].numeroLote}</dd>
                          </div>
                          <div>
                            <dt>Vencimiento</dt>
                            <dd>{prod.lotesDisponibles[0].fechaVencimiento}</dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </article>
                ))}
            </section>
          )}

          {!cargando &&
            !error &&
            filtroEstado !== "normal" &&
            (() => {
              const alertasFiltradas = (datos?.alertas ?? []).filter((alerta) => {
                if (filtroEstado === "stock_critico") {
                  return alerta.tipo === "STOCK_CRITICO";
                }
                if (filtroEstado === "proximo_vencer") {
                  return alerta.tipo === "PROXIMO_A_VENCER" || alerta.tipo === "PRODUCTO_VENCIDO";
                }
                return true;
              });

              if (alertasFiltradas.length === 0) {
                return (
                  <div className="alertas-vacio">
                    <span aria-hidden="true">
                      <i className="bi bi-check2-circle"></i>
                    </span>
                    <h2>No hay alertas pendientes</h2>
                    <p>
                      No se encontraron productos ni lotes para el filtro seleccionado.
                    </p>
                  </div>
                );
              }

              return (
                <section className="alertas-lista" aria-label="Listado de alertas">
                  {alertasFiltradas.map((alerta) => (
                    <AlertaCard
                      key={`${alerta.tipo}-${alerta.loteId ?? alerta.productoId}`}
                      alerta={alerta}
                    />
                  ))}
                </section>
              );
            })()}
        </>
      )}

      {pestanaActiva === "movimientos" && (
        <section className="bg-white p-3 rounded-3 border shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 fw-bold mb-0 text-dark">
              Ultimos Movimientos de Stock y Consumo Fraccionado
            </h2>
            <span className="badge bg-secondary-subtle text-secondary small">
              Registros auditados
            </span>
          </div>

          {cargandoMovs ? (
            <p className="text-muted small py-3 text-center">Cargando historial de movimientos...</p>
          ) : movimientos.length === 0 ? (
            <p className="text-muted small py-3 text-center">No hay registros de movimientos en el sistema.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Insumo / Farmaco</th>
                    <th>Lote</th>
                    <th>Tipo</th>
                    <th className="text-center">Cantidad</th>
                    <th>Usuario</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => {
                    const esEgreso = m.tipoMovimiento?.esSuma === false;
                    return (
                      <tr key={m.id}>
                        <td className="text-nowrap text-muted">
                          {new Date(m.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </td>
                        <td className="fw-semibold text-dark">
                          {m.producto?.nombre || `Producto #${m.productoId}`}
                        </td>
                        <td>
                          {m.lote ? (
                            <span className="badge bg-secondary-subtle text-secondary">
                              Lote {m.lote.numeroLote}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              esEgreso
                                ? "bg-danger-subtle text-danger"
                                : "bg-success-subtle text-success"
                            }`}
                          >
                            {m.tipoMovimiento?.nombre || (esEgreso ? "Consumo" : "Ingreso")}
                          </span>
                        </td>
                        <td className="text-center fw-bold">
                          <span className={esEgreso ? "text-danger" : "text-success"}>
                            {esEgreso ? "-" : "+"}
                            {m.cantidad} {m.producto?.unidadMedida || ""}
                          </span>
                        </td>
                        <td className="text-muted">
                          {m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : "Sistema"}
                        </td>
                        <td className="text-muted small">
                          {m.observaciones || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {modalAbierto && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-box-seam me-2 text-primary"></i>
                  Registrar Consumo Fraccionado Directo
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalAbierto(false)}
                  aria-label="Cerrar"
                ></button>
              </div>

              <form onSubmit={handleConfirmarConsumo}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Debita una fraccion o dosis de insumo del lote correspondiente fuera del flujo de consulta.
                  </p>

                  {errorConsumoModal && (
                    <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {errorConsumoModal}
                    </div>
                  )}

                  {exitoConsumoModal && (
                    <div className="alert alert-success py-2 px-3 small rounded-2 mb-3">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      {exitoConsumoModal}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="modalProdSel" className="form-label small fw-semibold text-muted">
                      Medicamento o Insumo
                    </label>
                    <select
                      id="modalProdSel"
                      className="form-select form-select-sm"
                      value={prodIdSel}
                      onChange={(e) => {
                        setProdIdSel(e.target.value);
                        setLoteIdSel("");
                        setErrorConsumoModal(null);
                      }}
                      required
                    >
                      <option value="">-- Seleccionar producto --</option>
                      {productosInventario.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (Stock actual: {p.stockActual} {p.unidadMedida})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="modalLoteSel" className="form-label small fw-semibold text-muted">
                      Lote Disponible
                    </label>
                    <select
                      id="modalLoteSel"
                      className="form-select form-select-sm"
                      value={loteIdSel}
                      onChange={(e) => {
                        setLoteIdSel(e.target.value);
                        setErrorConsumoModal(null);
                      }}
                      disabled={!prodIdSel}
                      required
                    >
                      <option value="">-- Seleccionar lote --</option>
                      {lotesDisponibles.map((l) => (
                        <option key={l.id} value={l.id}>
                          Lote {l.numeroLote} ({l.stockActual} {productoSeleccionado?.unidadMedida} - Vence {l.fechaVencimiento})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="modalCantidad" className="form-label small fw-semibold text-muted">
                      Cantidad a debitar ({productoSeleccionado?.unidadMedida || "unid."})
                    </label>
                    <input
                      id="modalCantidad"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ej: 2.5"
                      className="form-control form-control-sm"
                      value={cantidadConsumo}
                      onChange={(e) => {
                        setCantidadConsumo(e.target.value);
                        setErrorConsumoModal(null);
                      }}
                      disabled={!loteIdSel}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="modalObs" className="form-label small fw-semibold text-muted">
                      Observaciones / Destino de uso
                    </label>
                    <input
                      id="modalObs"
                      type="text"
                      placeholder="Ej: Administracion en internacion, canino en guardia"
                      className="form-control form-control-sm"
                      value={observacionesConsumo}
                      onChange={(e) => setObservacionesConsumo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setModalAbierto(false)}
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-3"
                    disabled={guardandoConsumo || !loteIdSel || !cantidadConsumo}
                    style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                  >
                    {guardandoConsumo ? "Procesando..." : "Confirmar Deduccion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AlertaCard({ alerta }: { alerta: AlertaStock }) {
  const esCritica = alerta.nivel === "CRITICO";

  const tipoTexto: Record<AlertaStock["tipo"], string> = {
    STOCK_CRITICO: "Stock critico",
    PRODUCTO_VENCIDO: "Producto vencido",
    PROXIMO_A_VENCER: "Proximo a vencer",
  };

  return (
    <article
      className={`alerta-card ${esCritica ? "alerta-card-critica" : "alerta-card-advertencia"}`}
    >
      <div className="alerta-card-icono" aria-hidden="true">
        <i className={`bi ${esCritica ? "bi-exclamation-octagon-fill" : "bi-exclamation-triangle-fill"}`}></i>
      </div>

      <div className="alerta-card-contenido">
        <div className="alerta-card-titulo">
          <h2>{tipoTexto[alerta.tipo]}</h2>
          <span className={`alerta-badge ${esCritica ? "badge-critica" : "badge-advertencia"}`}>
            {esCritica ? "CRITICA" : "ADVERTENCIA"}
          </span>
        </div>

        <h3>{alerta.producto}</h3>
        <p>{alerta.mensaje}</p>

        <div className="alerta-detalles">
          <span>
            Stock disponible: <strong>{alerta.stockActual} {alerta.unidadMedida}</strong>
          </span>

          {alerta.stockMinimo !== undefined && (
            <span>
              Stock minimo: <strong>{alerta.stockMinimo} {alerta.unidadMedida}</strong>
            </span>
          )}

          {alerta.numeroLote && (
            <span>
              Lote: <strong>{alerta.numeroLote}</strong>
            </span>
          )}

          {alerta.fechaVencimiento && (
            <span>
              Vencimiento: <strong>{formatearFecha(alerta.fechaVencimiento)}</strong>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

export default AlertasStock;
