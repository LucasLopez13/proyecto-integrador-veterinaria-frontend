import type { RespuestaAlertasStock } from "../types/AlertaStock";
import { apiFetch } from "./apiClient";

export const alertaStockService = {
  async getAll(
    diasVencimiento = 30,
    token?: string
  ): Promise<RespuestaAlertasStock> {
    const params = new URLSearchParams({
      diasVencimiento: String(diasVencimiento),
    });

    return await apiFetch<RespuestaAlertasStock>(
      `/alertas-stock?${params.toString()}`,
      { token }
    );
  },
};
