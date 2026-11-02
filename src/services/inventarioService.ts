import type {
  ProductoConLotes,
  RegistrarConsumoDTO,
  ResultadoConsumo,
  MovimientoStockItem
} from "../types/Inventario";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const inventarioService = {
  async getProductosConLotes(token?: string): Promise<ProductoConLotes[]> {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/inventario/productos-lotes`, {
      headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo obtener el catalogo de productos y lotes.");
    }

    return data as ProductoConLotes[];
  },

  async registrarConsumo(
    dto: RegistrarConsumoDTO,
    token?: string
  ): Promise<ResultadoConsumo> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/inventario/consumo`, {
      method: "POST",
      headers,
      body: JSON.stringify(dto)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo registrar la deduccion de stock.");
    }

    return data as ResultadoConsumo;
  },

  async getMovimientosByConsulta(
    consultaId: number,
    token?: string
  ): Promise<MovimientoStockItem[]> {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/inventario/consulta/${consultaId}`, {
      headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudieron obtener los consumos de la consulta.");
    }

    return data as MovimientoStockItem[];
  },

  async getHistorialMovimientos(
    limite = 50,
    token?: string
  ): Promise<MovimientoStockItem[]> {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/inventario/movimientos?limite=${limite}`, {
      headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo obtener el historial de movimientos.");
    }

    return data as MovimientoStockItem[];
  }
};
