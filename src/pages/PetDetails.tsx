import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
        <div className="container py-4">
          <div className="alert alert-info">
            No hay datos de la mascota disponibles.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-details-page">
      <div className="container py-4">
        <div className="pet-details-card">
          <h1>{pet.nombre}</h1>

          <p>
            <strong>Especie:</strong> {pet.especie}
          </p>

          <p>
            <strong>Raza:</strong> {pet.raza}
          </p>

          <p>
            <strong>Edad:</strong> {pet.edad} años
          </p>

          <p>
            <strong>Sexo:</strong> {pet.sexo}
          </p>
        </div>
      </div>
    </main>
  );
}

export default PetDetails;