import React, { useEffect, useState } from "react";
import type { CreateTriageDTO, TriageColumn } from "../../types/Triage";
import type { Pet } from "../../types/Pet";
import { apiFetch } from "../../services/apiClient";
import { TRIAGE_COLUMNS_CONFIG, TRIAGE_COLUMNS_ORDER, SPECIES_OPTIONS } from "../../constants";

interface NewTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTriageDTO) => Promise<void>;
  initialColumn?: TriageColumn;
}

const TRIAGE_LEVELS = TRIAGE_COLUMNS_ORDER.map((key) => ({
  key,
  title: TRIAGE_COLUMNS_CONFIG[key].title,
  desc: TRIAGE_COLUMNS_CONFIG[key].subtitle,
  color: TRIAGE_COLUMNS_CONFIG[key].indicatorColor,
  dotColor: TRIAGE_COLUMNS_CONFIG[key].indicatorColor,
}));

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
  const [especie, setEspecie] = useState<string>(SPECIES_OPTIONS[0]);
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
      const data = await apiFetch<Pet[]>("/mascotas");
      setPets(data);
    } catch {
      // Manejo silencioso en modal
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
      setError("El motivo de ingreso o síntoma principal es obligatorio.");
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

      // Limpiar y cerrar
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
      style={{ backgroundColor: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(4px)", zIndex: 1055 }}
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "640px" }}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content rounded-3 border shadow-lg p-4 bg-white"
          style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
        >
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-0 px-0 d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h4 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                Nuevo Ingreso a Triage
              </h2>
              <span
                className="badge rounded-2 fw-medium"
                style={{
                  backgroundColor: "#FEF2F2",
                  color: "#DC2626",
                  border: "1px solid #FECACA",
                  fontSize: "0.75rem",
                }}
              >
                Urgencia / Sin Turno
              </span>
            </div>
            <button
              type="button"
              className="btn btn-light rounded-2 btn-sm text-secondary p-1"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {error && <div className="alert alert-danger rounded-2 small p-2 mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Switch Segment: Radio Group with 6px radius */}
            <div
              className="d-flex p-1 mb-3 rounded-2"
              style={{ backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)" }}
            >
              <button
                type="button"
                className="btn btn-sm rounded-2 flex-grow-1 fw-medium"
                style={{
                  backgroundColor: isExistingPet ? "var(--vet-primary, #6D28D9)" : "transparent",
                  color: isExistingPet ? "#FFFFFF" : "var(--vet-text-muted, #64748B)",
                  border: "none",
                }}
                onClick={() => setIsExistingPet(true)}
              >
                Mascota ya registrada en el sistema
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-2 flex-grow-1 fw-medium"
                style={{
                  backgroundColor: !isExistingPet ? "var(--vet-primary, #6D28D9)" : "transparent",
                  color: !isExistingPet ? "#FFFFFF" : "var(--vet-text-muted, #64748B)",
                  border: "none",
                }}
                onClick={() => {
                  setIsExistingPet(false);
                  setSelectedPetId("");
                  setNombrePaciente("");
                  setNombreTutor("");
                  setTelefonoTutor("");
                }}
              >
                Paciente nuevo / Sin registro previo
              </button>
            </div>

            {/* Option A: Pet Select dropdown */}
            {isExistingPet ? (
              <div className="mb-3">
                <label htmlFor="triage-pet-select" className="form-label small fw-semibold text-muted">
                  Seleccionar Mascota Registrada
                </label>
                <select
                  id="triage-pet-select"
                  className="form-select rounded-2"
                  value={selectedPetId}
                  onChange={(e) => handleSelectPet(e.target.value)}
                  disabled={loadingPets}
                  required={isExistingPet}
                >
                  <option value="">-- Buscar por nombre de paciente o tutor --</option>
                  {pets.map((p) => {
                    const tutor = p.dueno || p.usuario;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.especie}) · Tutor: {tutor ? `${tutor.nombre} ${tutor.apellido}` : "Sin tutor"}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              /* Option B: Quick Fields */
              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label htmlFor="nombrePaciente" className="form-label small fw-semibold text-muted">
                    Nombre del Paciente <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nombrePaciente"
                    type="text"
                    className="form-control form-control-sm rounded-2"
                    placeholder="Nombre del paciente"
                    value={nombrePaciente}
                    onChange={(e) => setNombrePaciente(e.target.value)}
                    required={!isExistingPet}
                  />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="especie" className="form-label small fw-semibold text-muted">
                    Especie
                  </label>
                  <select
                    id="especie"
                    className="form-select form-select-sm rounded-2"
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Ave">Ave</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="nombreTutor" className="form-label small fw-semibold text-muted">
                    Nombre del Tutor
                  </label>
                  <input
                    id="nombreTutor"
                    type="text"
                    className="form-control form-control-sm rounded-2"
                    placeholder="Nombre y apellido del tutor"
                    value={nombreTutor}
                    onChange={(e) => setNombreTutor(e.target.value)}
                  />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="telefonoTutor" className="form-label small fw-semibold text-muted">
                    Teléfono (+54)
                  </label>
                  <input
                    id="telefonoTutor"
                    type="tel"
                    className="form-control form-control-sm rounded-2"
                    placeholder="Teléfono del tutor"
                    value={telefonoTutor}
                    onChange={(e) => setTelefonoTutor(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Initial Triage Level Selector: 2x2 grid */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark mb-2">
                Nivel de Triage Inicial (Clasificación de Guardia)
              </label>
              <div className="level-selection-grid">
                {TRIAGE_LEVELS.map((level) => {
                  const isSelected = columna === level.key;
                  return (
                    <div
                      key={level.key}
                      className={`level-select-card ${isSelected ? "active" : ""}`}
                      onClick={() => setColumna(level.key)}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: level.dotColor,
                            display: "inline-block",
                          }}
                        />
                        <strong className="small" style={{ color: isSelected ? "var(--vet-primary, #6D28D9)" : "#1E1B4B" }}>
                          {level.title}
                        </strong>
                      </div>
                      <small className="text-muted d-block" style={{ fontSize: "0.74rem" }}>
                        {level.desc}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivo de ingreso */}
            <div className="mb-3">
              <label htmlFor="motivoIngreso" className="form-label small fw-semibold text-muted">
                Motivo de ingreso o síntoma principal <span className="text-danger">*</span>
              </label>
              <input
                id="motivoIngreso"
                type="text"
                className="form-control rounded-2"
                placeholder="Motivo de ingreso o síntoma principal"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
            </div>

            {/* Observaciones iniciales / signos vitales rápidos */}
            <div className="mb-3">
              <label htmlFor="notasTriage" className="form-label small fw-semibold text-muted">
                Observaciones iniciales / Signos vitales rápidos
              </label>
              <textarea
                id="notasTriage"
                rows={2}
                className="form-control rounded-2"
                placeholder="Observaciones iniciales o signos vitales rápidos"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {/* Modal Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light-subtle">
              <button
                type="button"
                className="btn btn-light text-secondary rounded-2 px-3 fw-medium"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium"
                style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                disabled={submitting}
              >
                {submitting ? "Admitiendo..." : "Admitir Paciente al Tablero"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
