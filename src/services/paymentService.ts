import { apiFetch } from "./apiClient";
import type { Payment, CreatePaymentDTO, PaymentStatus } from "../types/Payment";

export const paymentService = {
  async getPayments(token?: string | null): Promise<Payment[]> {
    return apiFetch<Payment[]>("/pagos", { token });
  },

  async getPaymentById(id: number, token?: string | null): Promise<Payment> {
    return apiFetch<Payment>(`/pagos/${id}`, { token });
  },

  async createPayment(
    data: CreatePaymentDTO,
    token?: string | null
  ): Promise<Payment> {
    return apiFetch<Payment>("/pagos", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  async updatePaymentStatus(
    id: number,
    estado: PaymentStatus,
    token?: string | null
  ): Promise<Payment> {
    return apiFetch<Payment>(`/pagos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
      token,
    });
  },
};
