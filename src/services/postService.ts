import API_URL from "./api";
import type { Post } from "../types/Post";

type CreatePostData = {
  descripcion: string;
  userNickName: string;
  tags?: string[];
  imagenesUrls?: string[];
};

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/post`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las publicaciones.");
  }

  return response.json();
}

export async function createPost(post: CreatePostData): Promise<Post> {
  const response = await fetch(`${API_URL}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "No se pudo crear la publicación.");
  }

  return response.json();
}