import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Pet } from "../types/Pet";
import "../styles/Pets.css";

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mascotas");

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
            Todavía no tenés mascotas registradas.
          </div>
        ) : (
          <div className="row mt-4">
            {pets.map((pet) => (
              <div className="col-md-6 col-lg-4 mb-3" key={pet.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="card-title">{pet.nombre}</h2>

                    <p className="card-text">
                      <strong>Especie:</strong> {pet.especie}
                    </p>

                    <p className="card-text">
                      <strong>Raza:</strong> {pet.raza}
                    </p>

                    <p className="card-text">
                      <strong>Edad:</strong> {pet.edad} años
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