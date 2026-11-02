import type {
  ProductoConLotes,
  RegistrarConsumoDTO,
  ResultadoConsumo,
  MovimientoStockItem
} from "../types/Inventario";
import { apiFetch } from "./apiClient";

export const inventarioService = {
  async getProductosConLotes(token?: string): Promise<ProductoConLotes[]> {
    return await apiFetch<ProductoConLotes[]>("/inventario/productos-lotes", { token });
  },

  async registrarConsumo(
    dto: RegistrarConsumoDTO,
    token?: string
  ): Promise<ResultadoConsumo> {
    return await apiFetch<ResultadoConsumo>("/inventario/consumo", {
      method: "POST",
      body: JSON.stringify(dto),
      token
    });
  },

  async getMovimientosByConsulta(
    consultaId: number,
    token?: string
  ): Promise<MovimientoStockItem[]> {
    return await apiFetch<MovimientoStockItem[]>(`/inventario/consulta/${consultaId}`, { token });
  },

  async getHistorialMovimientos(
    limite = 50,
    token?: string
  ): Promise<MovimientoStockItem[]> {
    return await apiFetch<MovimientoStockItem[]>(`/inventario/movimientos?limite=${limite}`, { token });
  }
};
