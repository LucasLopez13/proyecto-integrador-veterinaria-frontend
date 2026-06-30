import API_URL from "./api";
import type { User } from "../types/User";

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/user`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios.");
  }

  return response.json();
}

export async function createUser(user: User): Promise<User> {
  const response = await fetch(`${API_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}