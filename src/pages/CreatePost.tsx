import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost } from "../services/postService";
import { getTags } from "../services/tagService";
import type { Tag } from "../types/Tag";

export default function CreatePost() {
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSeleccionado, setTagSeleccionado] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const data = await getTags();
    setTags(data);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user) return;

    await createPost({
      descripcion,
      userNickName: user.nickName,
      imagenesUrls: imagenUrl
        ? [imagenUrl]
        : [],
      tags: tagSeleccionado
        ? [tagSeleccionado]
        : [],
    });

    navigate("/profile");
  };

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm auth-card">
            <div className="card-body">
              <h2 className="card-title mb-4">
                Crear publicación
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Descripción
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={descripcion}
                    onChange={(e) =>
                      setDescripcion(e.target.value)
                    }
                    minLength={5}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    URL de imagen
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={imagenUrl}
                    onChange={(e) =>
                      setImagenUrl(e.target.value)
                    }
                    pattern="https?://.*"
                    placeholder="https://..."
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Etiqueta
                  </label>

                  <select
                    className="form-select"
                    value={tagSeleccionado}
                    onChange={(e) =>
                      setTagSeleccionado(e.target.value)
                    }
                  >
                    <option value="">
                      Sin etiqueta
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

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}