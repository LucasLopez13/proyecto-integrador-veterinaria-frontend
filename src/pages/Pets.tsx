import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import "../styles/Pets.css";

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/mascotas"
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las mascotas");
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("Error al cargar mascotas:", error);
      }
    };

    cargarMascotas();
  }, []);

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
            No tenés mascotas registradas.
          </div>
        ) : (
          <div className="row g-4 mt-2">
            {pets.map((pet) => (
              <div className="col-md-6 col-lg-4" key={pet.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <div className="pet-icon">🐾</div>

                    <h5 className="card-title">{pet.nombre}</h5>

                    <p className="card-text">
                      <strong>Especie:</strong> {pet.especie}
                    </p>

                    <p className="card-text">
                      <strong>Raza:</strong> {pet.raza}
                    </p>

                    <p className="card-text">
                      <strong>Edad:</strong> {pet.edad} años
                    </p>

                    <p className="card-text">
                      <strong>Sexo:</strong> {pet.sexo}
                    </p>

                    <Link
                      to={`/turnos/nuevo?mascota=${pet.id}`}
                      className="btn btn-primary"
                    >
                      Solicitar turno
                    </Link>

                    <Link
                      to={`/mascotas/${pet.id}`}
                      className="btn btn-outline-secondary"
                    >
                      Ver detalles
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