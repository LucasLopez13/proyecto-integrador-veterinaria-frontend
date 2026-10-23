import type {
  TriageItem,
  CreateTriageDTO,
  TriageColumn,
} from "../types/Triage";
import { apiFetch } from "./apiClient";

export const triageService = {
  async getKanban(token?: string | null): Promise<TriageItem[]> {
    return apiFetch<TriageItem[]>("/triage", { token });
  },

  async getById(id: number, token?: string | null): Promise<TriageItem> {
    return apiFetch<TriageItem>(`/triage/${id}`, { token });
  },

  async createTriage(
    data: CreateTriageDTO,
    token?: string | null
  ): Promise<TriageItem> {
    return apiFetch<TriageItem>("/triage", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async moverTriage(
    id: number,
    columna: TriageColumn,
    token?: string | null
  ): Promise<TriageItem> {
    return apiFetch<TriageItem>(`/triage/${id}/mover`, {
      method: "PUT",
      body: JSON.stringify({ columna }),
      token,
    });
  },

  async updateTriage(
    id: number,
    data: Partial<CreateTriageDTO>,
    token?: string | null
  ): Promise<TriageItem> {
    return apiFetch<TriageItem>(`/triage/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    });
  },

  async finalizarTriage(
    id: number,
    token?: string | null
  ): Promise<{ message: string; id: number }> {
    return apiFetch<{ message: string; id: number }>(`/triage/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
