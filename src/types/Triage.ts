import type { Pet } from "./Pet";

export type TriageColumn =
  | "EMERGENCIA_CRITICA"
  | "URGENCIA_MODERADA"
  | "CONSULTA_PROGRAMADA"
  | "INTERNACION_QUIROFANO";

export interface TriageItem {
  id: number;
  columna: TriageColumn;
  nombrePaciente: string;
  especie: string;
  raza?: string | null;
  nombreTutor?: string | null;
  telefonoTutor?: string | null;
  motivo: string;
  fechaLlegada: string;
  notas?: string | null;
  estado: string;
  mascotaId?: number | null;
  veterinarioAsignadoId?: number | null;
  turnoId?: number | null;
  mascota?: Pet;
  veterinarioAsignado?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface CreateTriageDTO {
  columna: TriageColumn;
  nombrePaciente: string;
  especie: string;
  raza?: string;
  nombreTutor?: string;
  telefonoTutor?: string;
  motivo: string;
  fechaLlegada?: string;
  notas?: string;
  mascotaId?: number | null;
  veterinarioAsignadoId?: number | null;
  turnoId?: number | null;
}
