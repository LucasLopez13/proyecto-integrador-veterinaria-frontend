export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado";

export interface Appointment {
  id: number;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  petId: number;
}