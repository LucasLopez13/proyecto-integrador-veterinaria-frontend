import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/apiClient";
import { SPECIES_OPTIONS } from "../constants";
import { ErrorModal } from "../components/common/ErrorModal";
import { BackButton } from "../components/common/BackButton";
import { FormFieldError } from "../components/common/FormFieldError";

function NewPet() {
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState<string>(SPECIES_OPTIONS[0]);
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [sexo, setSexo] = useState("macho");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = "Completá este campo con el nombre de la mascota";
    }

    if (!especie.trim()) {
      newErrors.especie = "Seleccioná la especie de la mascota";
    }

    if (edad.trim()) {
      const edadNum = Number(edad);
      if (isNaN(edadNum) || edadNum < 0 || edadNum > 40) {
        newErrors.edad = "Ingresá una edad válida (entre 0 y 40 años)";
      }
    }

    if (peso.trim()) {
      const pesoNum = Number(peso);
      if (isNaN(pesoNum) || pesoNum <= 0) {
        newErrors.peso = "Ingresá un peso válido mayor a 0 kg";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const fieldOrder = [
        { key: "nombre", id: "name" },
        { key: "especie", id: "species" },
        { key: "edad", id: "age" },
        { key: "peso", id: "peso" },
      ];
      const firstInvalid = fieldOrder.find((f) => newErrors[f.key]);
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid.id);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

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
        <div className="mb-3">
          <BackButton to="/mascotas" text="Volver a Mis Mascotas" />
        </div>

        <div className="card rounded-3 p-4 p-md-5 bg-white shadow-sm border" style={{ borderColor: "#EDE9FE" }}>
          <div className="mb-4 pb-2 border-bottom border-light-subtle">
            <h2 className="fw-bold mb-1" style={{ color: "#1E1B4B" }}>Registrar Nueva Mascota</h2>
            <p className="text-muted small mb-0">Completá los datos básicos para abrir su historia clínica</p>
          </div>

          {error && <div className="alert alert-danger rounded-2 py-2 px-3 small mb-4">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Nombre del Paciente <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className={`form-control rounded-2 ${fieldErrors.nombre ? "is-invalid" : ""}`}
                  placeholder="Nombre de la mascota"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    clearFieldError("nombre");
                  }}
                />
                <FormFieldError error={fieldErrors.nombre} />
              </div>

              <div className="col-md-6">
                <label htmlFor="species" className="form-label">
                  Especie <span className="text-danger">*</span>
                </label>
                <select
                  id="species"
                  className={`form-select rounded-2 ${fieldErrors.especie ? "is-invalid" : ""}`}
                  value={especie}
                  onChange={(e) => {
                    setEspecie(e.target.value);
                    clearFieldError("especie");
                  }}
                >
                  {SPECIES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <FormFieldError error={fieldErrors.especie} />
              </div>

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

              <div className="col-md-6">
                <label htmlFor="age" className="form-label">
                  Edad (años)
                </label>
                <input
                  type="number"
                  id="age"
                  className={`form-control rounded-2 ${fieldErrors.edad ? "is-invalid" : ""}`}
                  min="0"
                  max="40"
                  placeholder="Edad en años"
                  value={edad}
                  onChange={(e) => {
                    setEdad(e.target.value);
                    clearFieldError("edad");
                  }}
                />
                <FormFieldError error={fieldErrors.edad} />
              </div>

              <div className="col-md-6">
                <label htmlFor="peso" className="form-label">
                  Peso aproximado (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="peso"
                  className={`form-control rounded-2 ${fieldErrors.peso ? "is-invalid" : ""}`}
                  placeholder="Peso en kilogramos"
                  value={peso}
                  onChange={(e) => {
                    setPeso(e.target.value);
                    clearFieldError("peso");
                  }}
                />
                <FormFieldError error={fieldErrors.peso} />
              </div>

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