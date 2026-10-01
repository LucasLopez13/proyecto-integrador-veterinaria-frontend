export interface ClinicalConsultation {
  id: number;
  fecha: string;
  diagnostico: string;
  subjetivo: string;
  objetivo: string;
  evaluacion: string;
  plan: string;
  mascotaId: number;
  profesional: {
    id: number;
    nombre: string;
    apellido: string;
  };
}