export type PaymentMethod = "transferencia" | "tarjeta" | "efectivo";
export type PaymentStatus = "pendiente" | "aprobado" | "rechazado";

export interface Payment {
  id: number;
  monto: number | string;
  concepto: string;
  metodo: PaymentMethod;
  estado: PaymentStatus;
  turnoId: number | null;
  presupuestoId: number | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  monto: number;
  concepto: string;
  metodo: PaymentMethod;
  turnoId?: number;
  presupuestoId?: number;
  observaciones?: string;
}
