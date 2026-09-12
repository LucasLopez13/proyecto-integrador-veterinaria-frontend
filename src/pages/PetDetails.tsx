import type { Pet } from "../types/Pet";
import "../styles/PetDetails.css";

function PetDetails() {
  const pet: Pet | null = null;

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
          <h1>{pet.name}</h1>

          <p>
            <strong>Especie:</strong> {pet.species}
          </p>

          <p>
            <strong>Raza:</strong> {pet.breed}
          </p>

          <p>
            <strong>Edad:</strong> {pet.age} años
          </p>
        </div>
      </div>
    </main>
  );
}

export default PetDetails;