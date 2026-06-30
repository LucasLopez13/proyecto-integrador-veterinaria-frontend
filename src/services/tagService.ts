import API_URL from "./api";
import type { Tag } from "../types/Tag";

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_URL}/tag`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las etiquetas.");
  }

  return response.json();
}