import type { Recipe } from "../types/Recipe";

const API_URL = import.meta.env.VITE_API_URL;

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/recetas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar las recetas");
    }

    return await response.json();
  },

  async getById(id: number): Promise<Recipe> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/recetas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la receta");
    }

    return await response.json();
  },
};