export type UserRole = "cliente" | "profesional";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}