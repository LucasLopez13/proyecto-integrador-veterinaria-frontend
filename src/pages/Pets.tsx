import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import "../styles/Pets.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/mascotas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las mascotas");
        }

        const data = await response.json();
        setPets(data);
      } catch (err: any) {
        console.error("Error al cargar mascotas:", err);
        setError(err.message || "Error al cargar mascotas");
      } finally {
        setLoading(false);
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

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando tus mascotas...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger mt-4">{error}</div>
        ) : pets.length === 0 ? (
          <div className="alert alert-info mt-4">
            No tenés mascotas registradas. Hacé clic en <strong>"Registrar mascota"</strong> para agregar una.
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
                      <strong>Raza:</strong> {pet.raza || "No especificada"}
                    </p>

                    <p className="card-text">
                      <strong>Edad:</strong> {pet.edad !== undefined && pet.edad !== null ? `${pet.edad} años` : "No especificada"}
                    </p>

                    <p className="card-text">
                      <strong>Sexo:</strong> {pet.sexo || "No especificado"}
                    </p>

                    <div className="d-flex gap-2 mt-3">
                      <Link
                        to={`/turnos/nuevo?mascota=${pet.id}`}
                        className="btn btn-primary btn-sm flex-grow-1"
                      >
                        Solicitar turno
                      </Link>

                      <Link
                        to={`/profesional/mascotas/${pet.id}`}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Ver detalles
                      </Link>
                    </div>
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