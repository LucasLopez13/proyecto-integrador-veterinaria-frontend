import type {
  Consultation,
  CreateConsultationDTO,
  UpdateConsultationDTO,
  ConsultationVersion,
} from "../types/Consultation";
import { apiFetch } from "./apiClient";

export const consultationService = {
  async createConsultation(
    data: CreateConsultationDTO,
    token?: string | null
  ): Promise<Consultation> {
    return apiFetch<Consultation>("/consultas", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async updateConsultation(
    id: number,
    data: UpdateConsultationDTO,
    token?: string | null
  ): Promise<Consultation> {
    return apiFetch<Consultation>(`/consultas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    });
  },

  async getConsultationsByPet(
    mascotaId: number,
    token?: string | null
  ): Promise<Consultation[]> {
    return apiFetch<Consultation[]>(`/consultas/mascota/${mascotaId}`, { token });
  },

  async getConsultationById(
    id: number,
    token?: string | null
  ): Promise<Consultation> {
    return apiFetch<Consultation>(`/consultas/${id}`, { token });
  },

  async getConsultationVersions(
    id: number,
    token?: string | null
  ): Promise<ConsultationVersion[]> {
    return apiFetch<ConsultationVersion[]>(`/consultas/${id}/versiones`, { token });
  },

  async anularConsultation(
    id: number,
    motivoAnulacion: string,
    token?: string | null
  ): Promise<{ message: string; consultaId: number; versionAnulacion: number }> {
    return apiFetch<{ message: string; consultaId: number; versionAnulacion: number }>(
      `/consultas/${id}`,
      {
        method: "DELETE",
        body: JSON.stringify({ motivoAnulacion }),
        token,
      }
    );
  },
};
