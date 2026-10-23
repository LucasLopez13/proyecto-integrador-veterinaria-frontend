import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../types/Pet";
import { apiFetch } from "../services/apiClient";
import { getSpeciesIcon } from "../utils/speciesIcon";
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

  return (
    <main className="pets-page py-4">
      <div className="container">
        {/* Header: Title "Mis Mascotas" and subtitle "X animales registrados" + Button "+ Registrar Mascota" */}
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
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted small">Cargando tus mascotas...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-2 py-3 mb-4">{error}</div>
        ) : pets.length === 0 ? (
          <div className="card rounded-3 p-5 text-center border-subtle bg-white">
            <div className="pet-empty-icon mb-3">
              <i className="bi bi-shield-plus fs-1 text-muted"></i>
            </div>
            <h4 className="fw-bold text-heading">Aún no tenés mascotas registradas</h4>
            <p className="text-muted small mb-3">
              Registrá el perfil de tu mascota para solicitar turnos y acceder a su historial médico.
            </p>
            <div>
              <Link to="/mascotas/nueva" className="btn btn-primary rounded-2 px-4 shadow-sm d-inline-flex align-items-center gap-2">
                <i className="bi bi-plus-lg"></i> Registrar mi primera mascota
              </Link>
            </div>
          </div>
        ) : (
          /* Grid: 3-column card grid (row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3) */
          <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3">
            {pets.map((pet) => (
              <div className="col" key={pet.id}>
                <div className="pet-card-item card rounded-3 p-3 bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-start gap-3 mb-3">
                      {/* Avatar: 64x64px square with soft rounded-2 corners, lavender fill & icon */}
                      <div className="pet-avatar-squircle">
                        {getSpeciesIcon(pet.especie)}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                          <h5 className="pet-name mb-0">{pet.nombre}</h5>
                          {/* Species tag: badge bg-purple-subtle text-purple rounded-1 */}
                          <span className="badge bg-purple-subtle rounded-1 border">
                            {pet.especie}
                          </span>
                        </div>

                        {/* Details: Breed and age in text-muted small */}
                        <p className="pet-details text-muted small mb-0">
                          {pet.raza || "Mestizo"} · {pet.edad !== undefined && pet.edad !== null ? `${pet.edad} años` : "Edad no especificada"}
                        </p>
                        {pet.sexo && (
                          <small className="text-muted d-block mt-1">
                            Sexo: {pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1).toLowerCase()}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: Full-width outline button "Ver Ficha Médica" with rounded-2 */}
                  <div className="mt-3 pt-2 border-top border-light-subtle d-flex flex-column gap-2">
                    <Link
                      to={`/profesional/mascotas/${pet.id}`}
                      className="btn btn-outline-primary rounded-2 w-100 fw-medium d-inline-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-file-earmark-medical"></i> Ver Ficha Médica
                    </Link>
                    <Link
                      to={`/turnos/nuevo?mascota=${pet.id}`}
                      className="btn btn-light rounded-2 w-100 btn-sm text-muted d-inline-flex align-items-center justify-content-center gap-1"
                    >
                      <i className="bi bi-calendar-check"></i> Solicitar Turno
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