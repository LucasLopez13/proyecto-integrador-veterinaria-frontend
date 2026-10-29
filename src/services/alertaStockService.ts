
import type { RespuestaAlertasStock } from "../types/AlertaStock";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const alertaStockService = {
  async getAll(
    diasVencimiento = 30,
    token?: string
  ): Promise<RespuestaAlertasStock> {
    const params = new URLSearchParams({
      diasVencimiento: String(diasVencimiento),
    });

    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/alertas-stock?${params.toString()}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "No se pudieron cargar las alertas"
      );
    }

    return data as RespuestaAlertasStock;
  },
};
