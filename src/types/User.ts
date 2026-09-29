export type UserRole = "cliente" | "profesional";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: UserRole;
  name?: string;
  role?: UserRole;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: UserRole;
}