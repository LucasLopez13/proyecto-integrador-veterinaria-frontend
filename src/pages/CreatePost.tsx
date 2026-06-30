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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    await createPost({
      descripcion,
      userNickName: user.nickName,
      imagenesUrls: imagenUrl ? [imagenUrl] : [],
      tags: tagSeleccionado ? [tagSeleccionado] : []
    });

    navigate("/profile");
  };

  return (
    <div>
      <h2>Crear publicación</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            minLength={5}
            required
          />
        </div>

        <div>
          <label>URL de imagen</label>
          <input
            type="text"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            pattern="https?://.*"
          />
        </div>

        <div>
          <label>Etiqueta</label>
          <select
            value={tagSeleccionado}
            onChange={(e) => setTagSeleccionado(e.target.value)}
          >
            <option value="">Sin etiqueta</option>

            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Publicar</button>
      </form>
    </div>
  );
}