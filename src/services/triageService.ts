import type {
  TriageItem,
  CreateTriageDTO,
  TriageColumn,
} from "../types/Triage";

const API_URL = import.meta.env.VITE_API_URL;

export const triageService = {
  async getKanban(token: string): Promise<TriageItem[]> {
    const response = await fetch(`${API_URL}/triage`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(
        result.error || result.message || "Error al obtener el tablero de triage"
      );
    }

    return response.json();
  },

  async getById(id: number, token: string): Promise<TriageItem> {
    const response = await fetch(`${API_URL}/triage/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(
        result.error || result.message || "Error al obtener el registro de triage"
      );
    }

    return response.json();
  },

  async createTriage(
    data: CreateTriageDTO,
    token: string
  ): Promise<TriageItem> {
    const response = await fetch(`${API_URL}/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Error al registrar ingreso en triage"
      );
    }

    return result;
  },

  async moverTriage(
    id: number,
    columna: TriageColumn,
    token: string
  ): Promise<TriageItem> {
    const response = await fetch(`${API_URL}/triage/${id}/mover`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ columna }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Error al mover tarjeta de triage"
      );
    }

    return result;
  },

  async updateTriage(
    id: number,
    data: Partial<CreateTriageDTO>,
    token: string
  ): Promise<TriageItem> {
    const response = await fetch(`${API_URL}/triage/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Error al actualizar registro de triage"
      );
    }

    return result;
  },

  async finalizarTriage(
    id: number,
    token: string
  ): Promise<{ message: string; id: number }> {
    const response = await fetch(`${API_URL}/triage/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Error al egresar paciente de guardia"
      );
    }

    return result;
  },
};
