import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPosts } from "../services/postService";
import type { Post } from "../types/Post";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts();

    const userPosts = data.filter(
      (post: Post) =>
        post.userNickName === user?.nickName
    );

    setPosts(userPosts);
  };

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="card-title mb-3">
                Mi Perfil
              </h2>

              <p className="mb-3">
                <strong>Usuario:</strong>{" "}
                {user?.nickName}
              </p>

              <button
                className="btn btn-danger"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <h3 className="mb-4">
            Mis publicaciones
          </h3>

          {posts.length === 0 ? (
            <div className="alert alert-info">
              Todavía no realizaste publicaciones.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}