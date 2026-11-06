import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../../types/Pet";
import { getSpeciesIcon } from "../../utils/speciesIcon";
import { EditPetModal } from "./EditPetModal";
import { DeletePetModal } from "./DeletePetModal";

interface PetCardProps {
  pet: Pet;
  onUpdate?: (updatedPet: Pet) => void;
  onDelete?: (deletedPetId: number) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="col">
        <div className="pet-card-item card rounded-3 p-3 bg-white h-100 shadow-sm d-flex flex-column justify-content-between position-relative">
          <div>
            {/* Header: Avatar, Info y Botones de Acción (Editar / Borrar) */}
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="pet-avatar-squircle">
                {getSpeciesIcon(pet.especie)}
              </div>

              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                  <h5 className="pet-name mb-0 text-truncate" title={pet.nombre}>
                    {pet.nombre}
                  </h5>
                  <div className="d-flex align-items-center gap-1">
                    <span className="badge bg-purple-subtle rounded-1 border">
                      {pet.especie}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary border-0 p-1 lh-1 text-muted hover-primary"
                      title="Editar mascota"
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }}></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger border-0 p-1 lh-1 text-muted hover-danger"
                      title="Eliminar mascota"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="bi bi-trash3" style={{ fontSize: "0.85rem" }}></i>
                    </button>
                  </div>
                </div>

                <p className="pet-details text-muted small mb-0">
                  {pet.raza || "Mestizo"} ·{" "}
                  {pet.edad !== undefined && pet.edad !== null
                    ? `${pet.edad} ${pet.edad === 1 ? "año" : "años"}`
                    : "Edad no especificada"}
                </p>
                <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                  {pet.sexo && (
                    <small className="text-muted">
                      Sexo: {pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1).toLowerCase()}
                    </small>
                  )}
                  {pet.peso !== undefined && pet.peso !== null && (
                    <small className="text-muted">
                      · Peso: {pet.peso} kg
                    </small>
                  )}
                </div>
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

      {/* Modales */}
      {showEditModal && (
        <EditPetModal
          pet={pet}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            if (onUpdate) onUpdate(updated);
          }}
        />
      )}

      {showDeleteModal && (
        <DeletePetModal
          pet={pet}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={(deletedId) => {
            if (onDelete) onDelete(deletedId);
          }}
        />
      )}
    </>
  );
};
