import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Pet } from "../types/Pet";
import "../styles/PetDetails.css";

function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    const cargarMascota = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/mascotas/${id}`
        );

        if (!response.ok) {
          throw new Error("No se pudo cargar la mascota");
        }

        const data = await response.json();
        setPet(data);
      } catch (error) {
        console.error("Error al cargar mascota:", error);
      }
    };

    cargarMascota();
  }, [id]);

  if (!pet) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="pet-details-loading">
            <div className="pet-details-loading-icon">🐾</div>
            <p>Cargando información de la mascota...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-details-page">
      <div className="container py-5">
        <div className="pet-details-card">
          <div className="pet-details-header">
            <div className="pet-details-icon">🐾</div>

            <div>
              <h1>{pet.nombre}</h1>
              <p>
                {pet.especie} · {pet.raza}
              </p>
            </div>
          </div>

          <div className="pet-details-divider"></div>

          <div className="pet-details-info">
            <div className="pet-info-item">
              <span className="pet-info-icon">🐶</span>

              <div>
                <span className="pet-info-label">Especie</span>
                <strong>{pet.especie}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🏷️</span>

              <div>
                <span className="pet-info-label">Raza</span>
                <strong>{pet.raza}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🎂</span>

              <div>
                <span className="pet-info-label">Edad</span>
                <strong>{pet.edad} años</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">⚥</span>

              <div>
                <span className="pet-info-label">Sexo</span>
                <strong>{pet.sexo}</strong>
              </div>
            </div>
          </div>

          <div className="pet-details-actions">
            <Link to="/mascotas" className="btn btn-outline-secondary">
              Volver a mis mascotas
            </Link>

            <Link
              to={`/turnos/nuevo?mascota=${pet.id}`}
              className="btn btn-primary"
            >
              Solicitar turno
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PetDetails;