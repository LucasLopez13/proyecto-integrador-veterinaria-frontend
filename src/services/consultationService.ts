import type { Consultation, CreateConsultationDTO } from "../types/Consultation";

const API_URL = import.meta.env.VITE_API_URL;

export const consultationService = {
  async createConsultation(
    data: CreateConsultationDTO,
    token: string
  ): Promise<{ message: string; consulta: Consultation }> {
    const response = await fetch(`${API_URL}/consultas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || result.message || "Error al registrar la consulta");
    }

    return result;
  },

  async getConsultationsByPet(
    mascotaId: number,
    token: string
  ): Promise<Consultation[]> {
    const response = await fetch(`${API_URL}/consultas/mascota/${mascotaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || result.message || "Error al obtener consultas");
    }

    return response.json();
  },

  async getConsultationById(
    id: number,
    token: string
  ): Promise<Consultation> {
    const response = await fetch(`${API_URL}/consultas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || result.message || "Error al obtener la consulta");
    }

    return response.json();
  },
};
