import type { Pet } from "./Pet";

export type AppointmentStatus =
  | "pendiente"
  | "confirmado"
  | "cancelado"
  | "atendido"
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
  consulta?: {
    id: number;
    ordenFacturacion?: {
      id: number;
      estado: "pendiente" | "pagada" | "anulada";
      total: number | string;
    };
  };
}

export interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}