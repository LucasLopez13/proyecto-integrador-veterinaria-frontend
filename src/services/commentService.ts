import API_URL from "./api";
import type { Comment } from "../types/Comment";

type CreateCommentData = {
  texto: string;
  userNickName: string;
  postId: number;
};

export async function getCommentsByPost(postId: number): Promise<Comment[]> {
  const response = await fetch(`${API_URL}/comment/post/${postId}`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los comentarios.");
  }

  return response.json();
}

export async function createComment(comment: CreateCommentData): Promise<Comment> {
  const response = await fetch(`${API_URL}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comment),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "No se pudo crear el comentario.");
  }

  return response.json();
}