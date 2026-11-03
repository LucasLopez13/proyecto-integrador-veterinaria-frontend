export interface CreatePrescripcionDTO {
  medicamento: string;
  concentracion: number;
  unidadConcentracion: string;
  dosisIndicada: number;
  unidadDosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  indicaciones?: string | null;
}

export interface Prescripcion extends CreatePrescripcionDTO {
  id: number;
  consultaId: number;
  pesoKg: number;
  dosisTotal: number | null;
  volumenMl: number | null;
  confirmadaPorProfesional: boolean;
  fechaConfirmacion: string | null;
  confirmadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmarPrescripcionResponse {
  mensaje: string;
  prescripcion: Prescripcion;
}