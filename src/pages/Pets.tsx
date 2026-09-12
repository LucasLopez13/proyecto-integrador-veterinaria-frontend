import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import "../styles/Pets.css";

function Pets() {
  const pets: Pet[] = [];

  return (
    <main className="pets-page">
      <div className="container py-4">
        <div className="pets-header">
          <h1>Mis mascotas</h1>

          <Link to="/mascotas/nueva" className="btn btn-primary">
            Registrar mascota
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="alert alert-info mt-4">
            Todavía no tenés mascotas registradas.
          </div>
        ) : (
          <div className="row mt-4">
            {pets.map((pet) => (
              <div className="col-md-6 col-lg-4 mb-3" key={pet.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="card-title">{pet.name}</h2>
                    <p className="card-text">
                      <strong>Especie:</strong> {pet.species}
                    </p>
                    <p className="card-text">
                      <strong>Raza:</strong> {pet.breed}
                    </p>
                    <p className="card-text">
                      <strong>Edad:</strong> {pet.age} años
                    </p>

                    <Link
                      to={`/turnos/nuevo?mascota=${pet.id}`}
                      className="btn btn-outline-primary"
                    >
                      Solicitar turno
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Pets;