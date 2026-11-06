import React, { useState } from "react";
import type { Pet } from "../../types/Pet";
import { apiFetch } from "../../services/apiClient";

interface DeletePetModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedPetId: number) => void;
}

export const DeletePetModal: React.FC<DeletePetModalProps> = ({
  pet,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/mascotas/${pet.id}`, {
        method: "DELETE",
      });

      onSuccess(pet.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar la mascota");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(2px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-3">
          <div className="modal-header border-bottom bg-danger bg-opacity-10 py-3">
            <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              Eliminar Mascota
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={deleting}
            ></button>
          </div>

          <div className="modal-body p-4 text-center">
            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3 text-start">
                {error}
              </div>
            )}

            <div
              className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle text-danger mb-3"
              style={{ width: "64px", height: "64px", fontSize: "1.75rem" }}
            >
              <i className="bi bi-trash3-fill"></i>
            </div>

            <h5 className="fw-semibold text-dark mb-2">
              ¿Seguro que deseas eliminar a <strong>{pet.nombre}</strong>?
            </h5>
            <p className="text-muted small mb-0">
              La mascota ya no figurará en tu lista activa.
            </p>
          </div>

          <div className="modal-footer border-top bg-light py-2 px-4 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              <i className="bi bi-trash3"></i>
              {deleting ? "Eliminando..." : "Sí, Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
