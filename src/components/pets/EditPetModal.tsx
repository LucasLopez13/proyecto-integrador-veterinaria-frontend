import React, { useState } from "react";
import type { Pet } from "../../types/Pet";
import { SPECIES_OPTIONS } from "../../constants";
import { FormFieldError } from "../common/FormFieldError";
import { apiFetch } from "../../services/apiClient";

interface EditPetModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPet: Pet) => void;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({
  pet,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [nombre, setNombre] = useState(pet.nombre || "");
  const [especie, setEspecie] = useState(pet.especie || SPECIES_OPTIONS[0]);
  const [raza, setRaza] = useState(pet.raza || "");
  const [edad, setEdad] = useState(pet.edad !== undefined && pet.edad !== null ? String(pet.edad) : "");
  const [peso, setPeso] = useState(pet.peso !== undefined && pet.peso !== null ? String(pet.peso) : "");
  const [sexo, setSexo] = useState(pet.sexo || "macho");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = "Completa el nombre de la mascota";
    }

    if (!especie.trim()) {
      newErrors.especie = "Selecciona la especie";
    }

    if (edad.trim()) {
      const edadNum = Number(edad);
      if (isNaN(edadNum) || edadNum < 0 || edadNum > 50) {
        newErrors.edad = "Ingresa una edad valida (0 a 50 años)";
      }
    }

    if (peso.trim()) {
      const pesoNum = Number(peso);
      if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 300) {
        newErrors.peso = "Ingresa un peso valido mayor a 0 kg";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const updated = await apiFetch<Pet>(`/mascotas/${pet.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: nombre.trim(),
          especie: especie.trim(),
          raza: raza.trim() || undefined,
          edad: edad ? Number(edad) : undefined,
          peso: peso ? Number(peso) : undefined,
          sexo,
        }),
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar la mascota");
    } finally {
      setSaving(false);
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
          <div className="modal-header border-bottom bg-light py-3">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-pencil-square text-primary"></i>
              Editar Paciente: {pet.nombre}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={saving}
            ></button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${fieldErrors.nombre ? "is-invalid" : ""}`}
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      clearFieldError("nombre");
                    }}
                    disabled={saving}
                  />
                  <FormFieldError error={fieldErrors.nombre} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">
                    Especie <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${fieldErrors.especie ? "is-invalid" : ""}`}
                    value={especie}
                    onChange={(e) => {
                      setEspecie(e.target.value);
                      clearFieldError("especie");
                    }}
                    disabled={saving}
                  >
                    {SPECIES_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={fieldErrors.especie} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Raza</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mestizo, Golden, Siamés..."
                    value={raza}
                    onChange={(e) => setRaza(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Sexo</label>
                  <select
                    className="form-select"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    disabled={saving}
                  >
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                    <option value="desconocido">Desconocido</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Edad (años)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className={`form-control ${fieldErrors.edad ? "is-invalid" : ""}`}
                    value={edad}
                    onChange={(e) => {
                      setEdad(e.target.value);
                      clearFieldError("edad");
                    }}
                    disabled={saving}
                  />
                  <FormFieldError error={fieldErrors.edad} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Peso actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={`form-control ${fieldErrors.peso ? "is-invalid" : ""}`}
                    value={peso}
                    onChange={(e) => {
                      setPeso(e.target.value);
                      clearFieldError("peso");
                    }}
                    disabled={saving}
                  />
                  <FormFieldError error={fieldErrors.peso} />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light py-2 px-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                disabled={saving}
              >
                {saving && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                <i className="bi bi-check-lg"></i>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
