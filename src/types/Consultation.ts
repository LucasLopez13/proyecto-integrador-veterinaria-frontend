import type { Pet } from "./Pet";

export interface Consultation {
  id?: number;
  fecha?: string;
  subjetivo: string;
  objetivo?: string;
  peso: number;
  temperatura: number;
  frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null;
  analisis: string;
  plan: string;
  observaciones?: string | null;
  mascotaId: number;
  veterinarioId?: number;
  turnoId?: number | null;
  mascota?: Pet;
  veterinario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface CreateConsultationDTO {
  subjetivo: string;
  objetivo?: string;
  peso: number;
  temperatura: number;
  frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null;
  analisis: string;
  plan: string;
  observaciones?: string | null;
  mascotaId: number;
  turnoId?: number | null;
}
