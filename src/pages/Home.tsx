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
    <div>
      <h1>Inicio</h1>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}
    </div>
  );
}