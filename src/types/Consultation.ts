import type { Pet } from "./Pet";

export interface ConsultationVersion {
  id: number;
  consultaId: number;
  numeroVersion: number;
  autorId: number;
  tipoAccion: "CREACION_INICIAL" | "MODIFICACION_ENMIENDA" | "ANULACION_LOGICA";
  motivoEdicion: string;
  valoresAnteriores?: Record<string, any> | null;
  valoresModificados?: Record<string, any> | null;
  datosCompletosSnapshot?: Record<string, any> | null;
  hashSha256: string;
  fechaVersion: string;
  createdAt: string;
  autor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface Consultation {
  id?: number;
  version?: number;
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
  versiones?: ConsultationVersion[];
  prescripciones?: {
    medicamento: string;
    dosis: string;
    frecuencia: string;
  }[];
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

export interface UpdateConsultationDTO {
  motivoEdicion: string;
  subjetivo?: string;
  objetivo?: string;
  peso?: number;
  temperatura?: number;
  frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null;
  analisis?: string;
  plan?: string;
  observaciones?: string | null;
}
