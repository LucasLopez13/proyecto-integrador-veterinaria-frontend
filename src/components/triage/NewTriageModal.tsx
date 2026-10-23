import React, { useEffect, useState } from "react";
import type { CreateTriageDTO, TriageColumn } from "../../types/Triage";
import type { Pet } from "../../types/Pet";

interface NewTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTriageDTO) => Promise<void>;
  initialColumn?: TriageColumn;
}

const API_URL = import.meta.env.VITE_API_URL;

export const NewTriageModal: React.FC<NewTriageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialColumn = "URGENCIA_MODERADA",
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [isExistingPet, setIsExistingPet] = useState(true);

  const [selectedPetId, setSelectedPetId] = useState<number | "">("");
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [especie, setEspecie] = useState("Canino");
  const [raza, setRaza] = useState("");
  const [nombreTutor, setNombreTutor] = useState("");
  const [telefonoTutor, setTelefonoTutor] = useState("");
  const [columna, setColumna] = useState<TriageColumn>(initialColumn);
  const [motivo, setMotivo] = useState("");
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setColumna(initialColumn);
      cargarMascotas();
    }
  }, [isOpen, initialColumn]);

  const cargarMascotas = async () => {
    try {
      setLoadingPets(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/mascotas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      }
    } catch (err) {
      console.error("Error al cargar mascotas para triage:", err);
    } finally {
      setLoadingPets(false);
    }
  };

  const handleSelectPet = (petIdStr: string) => {
    if (!petIdStr) {
      setSelectedPetId("");
      return;
    }
    const id = Number(petIdStr);
    setSelectedPetId(id);
    const pet = pets.find((p) => p.id === id);
    if (pet) {
      setNombrePaciente(pet.nombre);
      setEspecie(pet.especie || "Canino");
      setRaza(pet.raza || "");
      const tutor = pet.dueno || pet.usuario;
      if (tutor) {
        setNombreTutor(`${tutor.nombre} ${tutor.apellido}`.trim());
        setTelefonoTutor(tutor.telefono || "");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombrePaciente.trim()) {
      setError("El nombre del paciente es obligatorio.");
      return;
    }

    if (!motivo.trim()) {
      setError("El motivo de ingreso es obligatorio.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        columna,
        nombrePaciente: nombrePaciente.trim(),
        especie,
        raza: raza.trim() || undefined,
        nombreTutor: nombreTutor.trim() || undefined,
        telefonoTutor: telefonoTutor.trim() || undefined,
        motivo: motivo.trim(),
        notas: notas.trim() || undefined,
        mascotaId: isExistingPet && selectedPetId ? Number(selectedPetId) : null,
      });

      // Limpiar formulario y cerrar
      setSelectedPetId("");
      setNombrePaciente("");
      setRaza("");
      setNombreTutor("");
      setTelefonoTutor("");
      setMotivo("");
      setNotas("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar ingreso de guardia");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1055 }}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <span>🚨</span> Ingreso de Paciente a Triage / Guardia
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={submitting}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Selector de Clasificación Inicial */}
              <div className="mb-4">
                <label className="form-label fw-bold">
                  Clasificación Inicial de Triage:
                </label>
                <div className="row g-2">
                  <div className="col-md-6 col-lg-3">
                    <label
                      className={`card p-2 text-center h-100 cursor-pointer border-2 ${
                        columna === "CONSULTA_PROGRAMADA"
                          ? "border-success bg-success-subtle text-success fw-bold"
                          : "border-secondary-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="triageColumn"
                        className="d-none"
                        value="CONSULTA_PROGRAMADA"
                        checked={columna === "CONSULTA_PROGRAMADA"}
                        onChange={() => setColumna("CONSULTA_PROGRAMADA")}
                      />
                      <div className="fs-3">🟢</div>
                      <div>Consulta Programada</div>
                      <small className="text-muted">Control o turno agendado</small>
                    </label>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <label
                      className={`card p-2 text-center h-100 cursor-pointer border-2 ${
                        columna === "URGENCIA_MODERADA"
                          ? "border-warning bg-warning-subtle text-dark fw-bold"
                          : "border-secondary-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="triageColumn"
                        className="d-none"
                        value="URGENCIA_MODERADA"
                        checked={columna === "URGENCIA_MODERADA"}
                        onChange={() => setColumna("URGENCIA_MODERADA")}
                      />
                      <div className="fs-3">🟡</div>
                      <div>Urgencia Moderada</div>
                      <small className="text-muted">Atención prioritaria</small>
                    </label>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <label
                      className={`card p-2 text-center h-100 cursor-pointer border-2 ${
                        columna === "EMERGENCIA_CRITICA"
                          ? "border-danger bg-danger-subtle text-danger fw-bold"
                          : "border-secondary-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="triageColumn"
                        className="d-none"
                        value="EMERGENCIA_CRITICA"
                        checked={columna === "EMERGENCIA_CRITICA"}
                        onChange={() => setColumna("EMERGENCIA_CRITICA")}
                      />
                      <div className="fs-3">🔴</div>
                      <div>Emergencia Crítica</div>
                      <small className="text-muted">Riesgo vital inmediato</small>
                    </label>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <label
                      className={`card p-2 text-center h-100 cursor-pointer border-2 ${
                        columna === "INTERNACION_QUIROFANO"
                          ? "border-primary bg-primary-subtle text-primary fw-bold"
                          : "border-secondary-subtle"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="triageColumn"
                        className="d-none"
                        value="INTERNACION_QUIROFANO"
                        checked={columna === "INTERNACION_QUIROFANO"}
                        onChange={() => setColumna("INTERNACION_QUIROFANO")}
                      />
                      <div className="fs-3">🏥</div>
                      <div>Internación / Quirófano</div>
                      <small className="text-muted">Monitoreo o cirugía</small>
                    </label>
                  </div>
                </div>
              </div>

              {/* Selector entre mascota existente vs ingreso rápido */}
              <div className="mb-3 d-flex gap-3 align-items-center">
                <span className="fw-semibold">Tipo de paciente:</span>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      isExistingPet ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setIsExistingPet(true)}
                  >
                    🐾 Mascota Registrada
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      !isExistingPet ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => {
                      setIsExistingPet(false);
                      setSelectedPetId("");
                    }}
                  >
                    ⚡ Ingreso Directo / No Registrado
                  </button>
                </div>
              </div>

              {isExistingPet && (
                <div className="mb-3">
                  <label className="form-label">
                    Seleccionar Mascota de la Clínica:
                  </label>
                  <select
                    className="form-select"
                    value={selectedPetId}
                    onChange={(e) => handleSelectPet(e.target.value)}
                    disabled={loadingPets}
                  >
                    <option value="">-- Seleccionar o buscar mascota --</option>
                    {pets.map((p) => {
                      const tutor = p.dueno || p.usuario;
                      const tutorNombre = tutor
                        ? `${tutor.nombre} ${tutor.apellido}`.trim()
                        : "Sin tutor";
                      return (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.especie} - {p.raza || "Mestizo"}) - Tutor: {tutorNombre}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Datos del Paciente */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Nombre del Paciente <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Milo, Luna..."
                    value={nombrePaciente}
                    onChange={(e) => setNombrePaciente(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Especie</label>
                  <select
                    className="form-select"
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Ave">Ave</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Raza</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Labrador, Siamés..."
                    value={raza}
                    onChange={(e) => setRaza(e.target.value)}
                  />
                </div>

                {/* Tutor y Teléfono */}
                <div className="col-md-6">
                  <label className="form-label">Nombre del Tutor / Acompañante</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Juan Pérez"
                    value={nombreTutor}
                    onChange={(e) => setNombreTutor(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 11 4455 6677"
                    value={telefonoTutor}
                    onChange={(e) => setTelefonoTutor(e.target.value)}
                  />
                </div>

                {/* Motivo de ingreso */}
                <div className="col-12">
                  <label className="form-label">
                    Motivo de Llegada / Urgencia <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Traumatismo por atropello, disnea aguda, vómitos reiterados..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                  />
                </div>

                {/* Observaciones / Notas clínicas iniciales */}
                <div className="col-12">
                  <label className="form-label">
                    Signos vitales iniciales / Observaciones de triage:
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="T° rectal, FC, FR, tiempo de llenado capilar, estado de consciencia..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? "Ingresando..." : "Ingresar a Guardia"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
