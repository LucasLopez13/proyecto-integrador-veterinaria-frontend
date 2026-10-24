import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/apiClient";
import { SPECIES_OPTIONS } from "../constants";
import { ErrorModal } from "../components/common/ErrorModal";
import { BackButton } from "../components/common/BackButton";

function NewPet() {
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState<string>(SPECIES_OPTIONS[0]);
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [sexo, setSexo] = useState("macho");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/mascotas", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombre.trim(),
          especie: especie.trim(),
          raza: raza.trim() || undefined,
          edad: edad ? Number(edad) : undefined,
          peso: peso ? Number(peso) : undefined,
          sexo,
        }),
      });

      navigate("/mascotas");
    } catch (err: any) {
      setError(err.message || "No se pudo registrar la mascota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-5" style={{ backgroundColor: "#FAF9FC", minHeight: "calc(100vh - 65px)" }}>
      <div className="container" style={{ maxWidth: "720px" }}>
        {/* Back Link */}
        <div className="mb-3">
          <BackButton to="/mascotas" text="Volver a Mis Mascotas" />
        </div>

        <div className="card rounded-3 p-4 p-md-5 bg-white shadow-sm border" style={{ borderColor: "#EDE9FE" }}>
          {/* Header */}
          <div className="mb-4 pb-2 border-bottom border-light-subtle">
            <h2 className="fw-bold mb-1" style={{ color: "#1E1B4B" }}>Registrar Nueva Mascota</h2>
            <p className="text-muted small mb-0">Completá los datos básicos para abrir su historia clínica</p>
          </div>

          {error && <div className="alert alert-danger rounded-2 py-2 px-3 small mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* 2-column grid */}
            <div className="row g-3">
              {/* Nombre */}
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Nombre del Paciente <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control rounded-2"
                  placeholder="Nombre de la mascota"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              {/* Especie dropdown */}
              <div className="col-md-6">
                <label htmlFor="species" className="form-label">
                  Especie <span className="text-danger">*</span>
                </label>
                <select
                  id="species"
                  className="form-select rounded-2"
                  value={especie}
                  onChange={(e) => setEspecie(e.target.value)}
                  required
                >
                  {SPECIES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Raza */}
              <div className="col-md-6">
                <label htmlFor="breed" className="form-label">
                  Raza
                </label>
                <input
                  type="text"
                  id="breed"
                  className="form-control rounded-2"
                  placeholder="Raza de la mascota"
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                />
              </div>

              {/* Edad */}
              <div className="col-md-6">
                <label htmlFor="age" className="form-label">
                  Edad (años)
                </label>
                <input
                  type="number"
                  id="age"
                  className="form-control rounded-2"
                  min="0"
                  max="40"
                  placeholder="Edad en años"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                />
              </div>

              {/* Peso */}
              <div className="col-md-6">
                <label htmlFor="peso" className="form-label">
                  Peso aproximado (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="peso"
                  className="form-control rounded-2"
                  placeholder="Peso en kilogramos"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>

              {/* Sexo radio buttons */}
              <div className="col-md-6">
                <label className="form-label d-block">
                  Sexo <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-3 pt-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sexoRadio"
                      id="sexoMacho"
                      value="macho"
                      checked={sexo === "macho"}
                      onChange={() => setSexo("macho")}
                    />
                    <label className="form-check-label" htmlFor="sexoMacho">
                      Macho
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sexoRadio"
                      id="sexoHembra"
                      value="hembra"
                      checked={sexo === "hembra"}
                      onChange={() => setSexo("hembra")}
                    />
                    <label className="form-check-label" htmlFor="sexoHembra">
                      Hembra
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons with rounded-2: "Cancelar" (btn-light) and "Guardar Mascota" (btn-primary #6D28D9) */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light-subtle">
              <Link to="/mascotas" className="btn btn-light rounded-2 px-3">
                Cancelar
              </Link>

              <button
                type="submit"
                className="btn btn-primary rounded-2 px-4 shadow-sm"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Mascota"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ErrorModal
        error={error}
        title="Error al Registrar Mascota"
        onClose={() => setError(null)}
      />
    </main>
  );
}

export default NewPet;