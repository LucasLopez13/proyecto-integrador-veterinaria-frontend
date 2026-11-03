export interface RecipePet {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  usuarioId: number;
}

export interface RecipeProfessional {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

export type RecipeStatus = "activo" | "finalizado" | "cancelado";

export interface Recipe {
  id: number;
  fecha?: string;
  medicamento?: string;
  dosis?: string;
  frecuencia?: number;
  duracion?: number;
  indicaciones?: string;
  estado?: RecipeStatus;
  mascotaId?: number;
  profesionalId?: number;
  mascota?: RecipePet;
  profesional?: RecipeProfessional;
  producto?: {
    id: number;
    nombre: string;
  };
  consulta?: {
    id: number;
    fecha?: string;
    mascota?: RecipePet;
    veterinario?: RecipeProfessional;
  };
  createdAt?: string;
  updatedAt?: string;
}
