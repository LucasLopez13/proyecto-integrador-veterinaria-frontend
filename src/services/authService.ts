import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/User";
import { apiFetch } from "./apiClient";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getProfile(token: string): Promise<{ user: User }> {
    return apiFetch<{ user: User }>("/auth/me", { token });
  },
};
