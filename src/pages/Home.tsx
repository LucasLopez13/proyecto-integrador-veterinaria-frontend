import { useEffect, useState } from "react";
import { getPosts } from "../services/postService";
import { getTags } from "../services/tagService";
import type { Post } from "../types/Post";
import type { Tag } from "../types/Tag";
import PostCard from "../components/PostCard";
import "../styles/home.css";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagFiltro, setTagFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadPosts();
    loadTags();
  }, []);

const loadPosts = async () => {
  try {
    setLoading(true);
    const data = await getPosts();
    setPosts(data);
  } finally {
    setLoading(false);
  }
};

  const loadTags = async () => {
    const data = await getTags();
    setTags(data);
  };

  const filteredPosts =
    tagFiltro === ""
      ? posts
      : posts.filter((post) =>
          post.Tags?.some(
            (tag) => tag.name === tagFiltro
          )
        );

  return (
    <div className="home-container container mt-4">

<div className="hero-banner text-center mb-5">
  <h1>Bienvenido a UnaHur Anti-Social Net</h1>

  <p className="lead">
    Compartí tus ideas, descubrí nuevas publicaciones e interactuá con la comunidad.
  </p>

  <div className="mt-4">
    <span className="badge bg-light text-dark me-2">
      Publicaciones
    </span>

    <span className="badge bg-light text-dark me-2">
      Comentarios
    </span>

    <span className="badge bg-light text-dark">
      Comunidad
    </span>
  </div>
</div>

      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="mb-4">
            <label className="form-label">
              Filtrar por etiqueta
            </label>

            <select
              className="form-select"
              value={tagFiltro}
              onChange={(e) =>
                setTagFiltro(e.target.value)
              }
            >
              <option value="">
                Todas las etiquetas
              </option>

              {tags.map((tag) => (
                <option
                  key={tag.id}
                  value={tag.name}
                >
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
              
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">
                Cargando...
              </span>
            </div>

            <p className="mt-3 text-muted">
              Cargando publicaciones...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="alert alert-info">
            No hay publicaciones disponibles.
          </div>
        ) : (
          filteredPosts.map((post) => (
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