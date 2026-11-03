import { apiFetch } from "./apiClient";
import type {
  CreatePrescripcionDTO,
  Prescripcion,
  ConfirmarPrescripcionResponse,
} from "../types/Prescripcion";

export const prescripcionService = {
  async create(consultaId: number,data: CreatePrescripcionDTO,token?: string | null): Promise<Prescripcion> {
    return apiFetch<Prescripcion>(`/prescripcion/consulta/${consultaId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }
    );
  },

  async getByConsultaId(consultaId: number,token?: string | null): Promise<Prescripcion[]> {
    return apiFetch<Prescripcion[]>(`/prescripcion/consulta/${consultaId}`,
      { token }
    );
  },

  async confirm(prescripcionId: number,token?: string | null): Promise<ConfirmarPrescripcionResponse> {
    return apiFetch<ConfirmarPrescripcionResponse>(`/prescripcion/${prescripcionId}/confirmar`,
      {
        method: "POST",
        token,
      }
    );
  },

};