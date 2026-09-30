import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Pet } from "../types/Pet";
import "../styles/PetDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarMascota = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/mascotas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la mascota");
        }

        const data = await response.json();
        setPet(data);
      } catch (err: any) {
        console.error("Error al cargar mascota:", err);
        setError(err.message || "Error al cargar los datos de la mascota");
      } finally {
        setLoading(false);
      }
    };

    cargarMascota();
  }, [id]);

  if (loading) {
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

  if (error || !pet) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error || "No hay datos de la mascota disponibles."}
          </div>
          <Link to="/mascotas" className="btn btn-outline-secondary mt-3">
            Volver a mis mascotas
          </Link>
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
                {pet.especie} · {pet.raza || "Raza mestiza"}
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
                <strong>{pet.raza || "No especificada"}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🎂</span>

              <div>
                <span className="pet-info-label">Edad</span>
                <strong>
                  {pet.edad !== undefined && pet.edad !== null
                    ? `${pet.edad} años`
                    : "No especificada"}
                </strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">⚥</span>

              <div>
                <span className="pet-info-label">Sexo</span>
                <strong>
                  {pet.sexo
                    ? pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1).toLowerCase()
                    : "No especificado"}
                </strong>
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