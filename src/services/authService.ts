import type { AuthResponse, LoginCredentials, RegisterData } from "../types/User";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al iniciar sesión");
    }

    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = data.message || "Error al registrarse";
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map((err: any) => err.message).join(". ");
      }
      throw new Error(errorMessage);
    }

    return data;
  },

  async getProfile(token: string): Promise<{ user: any }> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sesión inválida");
    }

    return data;
  },
};
