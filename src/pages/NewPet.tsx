import { Link } from "react-router-dom";
import "../styles/NewPet.css";

function NewPet() {
  return (
    <main className="new-pet-page">
      <div className="new-pet-card">
        <h1>Registrar mascota</h1>

        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="species" className="form-label">
              Especie
            </label>
            <input
              type="text"
              id="species"
              className="form-control"
              placeholder="Ej: Perro"
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
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="age" className="form-label">
              Edad
            </label>
            <input
              type="number"
              id="age"
              className="form-control"
              min="0"
              required
            />
          </div>

          <div className="new-pet-actions">
            <Link to="/mascotas" className="btn btn-outline-secondary">
              Cancelar
            </Link>

            <button type="submit" className="btn btn-primary">
              Registrar mascota
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default NewPet;