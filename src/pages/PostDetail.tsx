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
    return (
      <main className="container mt-4">
        <p>Cargando publicación...</p>
      </main>
    );
  }

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="card-title mb-3">
                {post.descripcion}
              </h2>

              {post.PostImages?.map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt="Imagen del post"
                  className="img-fluid rounded mb-3"
                />
              ))}

              <div>
                {post.Tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="badge text-bg-secondary me-2"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-3">Comentarios</h3>

              {comments.length === 0 ? (
                <p className="text-muted">
                  Todavía no hay comentarios.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-bottom pb-2 mb-2"
                  >
                    <strong>{comment.userNickName}:</strong>{" "}
                    {comment.texto}
                  </div>
                ))
              )}

              <div className="mt-4">
                <CommentForm
                  postId={post.id}
                  onCommentAdded={loadComments}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}