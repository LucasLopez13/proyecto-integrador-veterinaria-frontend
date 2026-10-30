
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { alertaStockService } from "../services/alertaStockService";
import type {
  AlertaStock,
  RespuestaAlertasStock,
} from "../types/AlertaStock";
import "../styles/AlertasStock.css";

function AlertasStock() {
  const { token } = useAuth();

  const [datos, setDatos] = useState<RespuestaAlertasStock | null>(null);
  const [dias, setDias] = useState(30);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    void cargarAlertas();
  }, [cargarAlertas]);

  const criticas =
    datos?.alertas.filter((alerta) => alerta.nivel === "CRITICO").length ?? 0;

  const advertencias =
    datos?.alertas.filter((alerta) => alerta.nivel === "ADVERTENCIA").length ?? 0;

  return (
    <main className="alertas-page">
      <header className="alertas-header">
        <div>
          <p className="alertas-eyebrow">VETCARE · INVENTARIO</p>
          <h1>Alertas de stock y vencimiento</h1>
          <p className="alertas-subtitle">
            Controlá los productos con stock bajo y los lotes vencidos o
            próximos a vencer.
          </p>
        </div>

        <button
          type="button"
          className="alertas-refresh"
          onClick={() => void cargarAlertas()}
          disabled={cargando}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {cargando ? "Actualizando..." : "Actualizar alertas"}
        </button>
      </header>

      <section className="alertas-resumen" aria-label="Resumen de alertas">
        <article className="alerta-resumen-card">
          <span>Total de alertas</span>
          <strong>{datos?.total ?? 0}</strong>
        </article>

        <article className="alerta-resumen-card alerta-resumen-critica">
          <span>Críticas</span>
          <strong>{criticas}</strong>
        </article>

        <article className="alerta-resumen-card alerta-resumen-advertencia">
          <span>Advertencias</span>
          <strong>{advertencias}</strong>
        </article>
      </section>

      <section className="alertas-filtros">
        <label htmlFor="diasVencimiento">
          Avisar por vencimientos dentro de:
        </label>

        <select
          id="diasVencimiento"
          value={dias}
          onChange={(event) => setDias(Number(event.target.value))}
        >
          <option value={7}>7 días</option>
          <option value={15}>15 días</option>
          <option value={30}>30 días</option>
          <option value={60}>60 días</option>
          <option value={90}>90 días</option>
          <option value={180}>180 días</option>
          <option value={365}>365 días</option>
        </select>
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

      {!cargando && !error && datos?.alertas.length === 0 && (
        <div className="alertas-vacio">
          <span aria-hidden="true">
            <i className="bi bi-check2-circle"></i>
          </span>
          <h2>No hay alertas pendientes</h2>
          <p>
            No se encontraron productos con stock crítico ni lotes que requieran
            atención para el período seleccionado.
          </p>
        </div>
      )}

      {!cargando && !error && datos && datos.alertas.length > 0 && (
        <section className="alertas-lista" aria-label="Listado de alertas">
          {datos.alertas.map((alerta) => (
            <AlertaCard key={`${alerta.tipo}-${alerta.loteId ?? alerta.productoId}`} alerta={alerta} />
          ))}
        </section>
      )}
    </main>
  );
}

function AlertaCard({ alerta }: { alerta: AlertaStock }) {
  const esCritica = alerta.nivel === "CRITICO";

  const tipoTexto: Record<AlertaStock["tipo"], string> = {
    STOCK_CRITICO: "Stock crítico",
    PRODUCTO_VENCIDO: "Producto vencido",
    PROXIMO_A_VENCER: "Próximo a vencer",
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
            {esCritica ? "CRÍTICA" : "ADVERTENCIA"}
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
              Stock mínimo: <strong>{alerta.stockMinimo} {alerta.unidadMedida}</strong>
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
