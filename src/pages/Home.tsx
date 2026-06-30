import { useEffect, useState } from "react";
import { getPosts } from "../services/postService";
import type { Post } from "../types/Post";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  return (
    <div className="container mt-4">

      <div className="text-center mb-4">
        <h1>UnaHur Anti-Social Net</h1>
        <p className="text-muted">
          Arranca a Postear con el mundo
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">

          {posts.length === 0 ? (
            <div className="alert alert-info">
              No hay publicaciones disponibles.
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

    </div>
  );
}