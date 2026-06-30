import { Link } from "react-router-dom";
import type { Post } from "../types/Post";

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <div>
      <h3>{post.descripcion}</h3>

      {post.PostImages?.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt="Imagen del post"
          width="200"
        />
      ))}

      {post.Tags?.map((tag) => (
        <span key={tag.id}>#{tag.name} </span>
      ))}

      <p>
        Comentarios visibles: {post.Comments?.length || 0}
      </p>

      <Link to={`/post/${post.id}`}>
        Ver más
      </Link>
    </div>
  );
}