import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../services/postService";
import { getCommentsByPost } from "../services/commentService";
import type { Post } from "../types/Post";
import type { Comment } from "../types/Comment";
import CommentForm from "../components/CommentForm";

export default function PostDetail() {
  const { id } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    if (!id) return;

    const data = await getPostById(Number(id));
    setPost(data);
  };

  const loadComments = async () => {
    if (!id) return;

    const data = await getCommentsByPost(Number(id));
    setComments(data);
  };

  if (!post) {
    return <p>Cargando publicación...</p>;
  }

  return (
    <div>
      <h2>{post.descripcion}</h2>

      {post.PostImages?.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt="Imagen del post"
          width="300"
        />
      ))}

      <div>
        {post.Tags?.map((tag) => (
          <span key={tag.id}>#{tag.name} </span>
        ))}
      </div>

      <h3>Comentarios</h3>

      {comments.map((comment) => (
        <p key={comment.id}>
          <strong>{comment.userNickName}:</strong> {comment.texto}
        </p>
      ))}

      <CommentForm postId={post.id} onCommentAdded={loadComments}/>
    </div>
  );
}