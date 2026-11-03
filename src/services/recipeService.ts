import { apiFetch } from "./apiClient";
import type { Recipe } from "../types/Recipe";

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    return apiFetch<Recipe[]>("/recetas");
  },

  async getById(id: number): Promise<Recipe> {
    return apiFetch<Recipe>(`/recetas/${id}`);
  },
};
