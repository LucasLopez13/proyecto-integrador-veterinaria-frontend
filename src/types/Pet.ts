export interface PetOwner {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
}

export interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sexo: string;
  peso?: number | null;
  usuarioId: number;
  usuario?: PetOwner;
  dueno?: PetOwner;
}