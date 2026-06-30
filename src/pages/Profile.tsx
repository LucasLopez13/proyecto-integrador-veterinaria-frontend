import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getPosts } from "../services/postService";
import type { Post } from "../types/Post";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts();

    const userPosts = data.filter(
      (post: Post) => post.userNickName === user?.nickName
    );

    setPosts(userPosts);
  };

  return (
    <div>
      <h2>Perfil</h2>

      <p>Usuario: {user?.nickName}</p>

      <button onClick={logout}>
        Cerrar sesión
      </button>

      <h3>Mis publicaciones</h3>

      {posts.map((post) => (
        <div key={post.id}>
          <h4>{post.descripcion}</h4>

          <p>
            Comentarios visibles: {post.Comments?.length || 0}
          </p>

          <Link to={`/post/${post.id}`}>
            Ver más
          </Link>
        </div>
      ))}
    </div>
  );
}