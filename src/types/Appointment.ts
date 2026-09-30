import type { Pet } from "./Pet";

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
  mascota?: Pet;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
}