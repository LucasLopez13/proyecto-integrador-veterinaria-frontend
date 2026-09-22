export type AppointmentStatus =
  | "pendiente"
  | "confirmado"
  | "cancelado"
  | "completado";

export interface Appointment {
  id: number;
  fecha: string;
  motivo: string;
  estado: AppointmentStatus;
  usuarioId: number;
  mascotaId: number;
}