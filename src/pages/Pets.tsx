import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import { apiFetch } from "../services/apiClient";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { PetCard } from "../components/pets/PetCard";
import "../styles/Pets.css";

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const data = await apiFetch<Pet[]>("/mascotas");
        setPets(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar mascotas");
      } finally {
        setLoading(false);
      }
    };

    cargarMascotas();
  }, []);

  const handleUpdatePet = (updatedPet: Pet) => {
    setPets((prev) =>
      prev.map((p) => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p))
    );
  };

  const handleDeletePet = (deletedPetId: number) => {
    setPets((prev) => prev.filter((p) => p.id !== deletedPetId));
  };

  return (
    <main className="pets-page py-4">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="pets-main-title mb-1">Mis Mascotas</h2>
            <p className="pets-subtitle mb-0 text-muted">
              {pets.length} {pets.length === 1 ? "animal registrado" : "animales registrados"}
            </p>
          </div>

          <Link
            to="/mascotas/nueva"
            className="btn btn-primary rounded-2 px-3 py-2 fw-medium shadow-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i> Registrar Mascota
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando tus mascotas..." />
        ) : error ? (
          <div className="alert alert-danger rounded-2 py-3 mb-4">{error}</div>
        ) : pets.length === 0 ? (
          <EmptyState
            icon="bi-shield-plus"
            title="Aun no tenes mascotas registradas"
            description="Registra el perfil de tu mascota para solicitar turnos y acceder a su historial medico."
            actionText="Registrar mi primera mascota"
            actionTo="/mascotas/nueva"
          />
        ) : (
          <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onUpdate={handleUpdatePet}
                onDelete={handleDeletePet}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Pets;
