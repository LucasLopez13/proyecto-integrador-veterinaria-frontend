import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NewPet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function NewPet() {
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("macho");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/mascotas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          especie: especie.trim(),
          raza: raza.trim() || undefined,
          edad: edad ? Number(edad) : undefined,
          sexo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar la mascota");
      }

      navigate("/mascotas");
    } catch (err: any) {
      console.error("Error al registrar mascota:", err);
      setError(err.message || "No se pudo registrar la mascota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="new-pet-page">
      <div className="new-pet-card">
        <h1>Registrar mascota</h1>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Ej: Firulais"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="species" className="form-label">
              Especie *
            </label>
            <input
              type="text"
              id="species"
              className="form-control"
              placeholder="Ej: Perro, Gato, Ave..."
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="breed" className="form-label">
              Raza
            </label>
            <input
              type="text"
              id="breed"
              className="form-control"
              placeholder="Ej: Mestizo, Caniche..."
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="age" className="form-label">
                Edad (años)
              </label>
              <input
                type="number"
                id="age"
                className="form-control"
                min="0"
                placeholder="Ej: 3"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="sexo" className="form-label">
                Sexo
              </label>
              <select
                id="sexo"
                className="form-select"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
              >
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
                <option value="desconocido">Desconocido</option>
              </select>
            </div>
          </div>

          <div className="new-pet-actions mt-3">
            <Link to="/mascotas" className="btn btn-outline-secondary">
              Cancelar
            </Link>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registrando..." : "Registrar mascota"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default NewPet;