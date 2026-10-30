import React from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../../types/Pet";
import { getSpeciesIcon } from "../../utils/speciesIcon";

interface PetCardProps {
  pet: Pet;
}

export const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  return (
    <div className="col">
      <div className="pet-card-item card rounded-3 p-3 bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="pet-avatar-squircle">
              {getSpeciesIcon(pet.especie)}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                <h5 className="pet-name mb-0">{pet.nombre}</h5>
                <span className="badge bg-purple-subtle rounded-1 border">
                  {pet.especie}
                </span>
              </div>

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

        <div className="mt-3 pt-2 border-top border-light-subtle d-flex flex-column gap-2">
          <Link
            to={`/mascotas/${pet.id}`}
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
  );
};
