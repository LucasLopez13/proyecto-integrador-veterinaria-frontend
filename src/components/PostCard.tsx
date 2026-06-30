import { Link } from "react-router-dom";
import type { Post } from "../types/Post";

type PostCardProps = {
  post: Post;
};

export default function PostCard({
  post,
}: PostCardProps) {
  return (
    <div className="card shadow-sm mb-4">

      <div className="card-body">

        <h5 className="card-title">
          {post.descripcion}
        </h5>

        {post.PostImages?.map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt="Imagen del post"
            className="img-fluid rounded mb-2"
          />
        ))}

        <div className="mt-2">
          {post.Tags?.map((tag) => (
            <span
                key={tag.id}
                className="badge bg-primary me-2"
            >
                 #{tag.name}
            </span>
      ))}
    </div>

        <p className="text-muted mt-3">
          Comentarios visibles: {post.Comments?.length || 0}
        </p>

        <Link
          to={`/post/${post.id}`}
          className="btn btn-primary"
        >
          Ver más
        </Link>

      </div>

    </div>
  );
}