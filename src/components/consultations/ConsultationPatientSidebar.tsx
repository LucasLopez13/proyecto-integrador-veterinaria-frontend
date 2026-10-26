import React from "react";
import type { Pet } from "../../types/Pet";
import type { Appointment } from "../../types/Appointment";
import { getSpeciesIcon } from "../../utils/speciesIcon";
import { FormFieldError } from "../common/FormFieldError";

interface ConsultationPatientSidebarProps {
  pet: Pet | null;
  appointment: Appointment | null;
  peso: string;
  onPesoChange: (peso: string) => void;
  onClearPesoError?: () => void;
  pesoError?: string;
}

export const ConsultationPatientSidebar: React.FC<ConsultationPatientSidebarProps> = ({
  pet,
  appointment,
  peso,
  onPesoChange,
  onClearPesoError,
  pesoError,
}) => {
  const tutorInfo = pet?.usuario || pet?.dueno || appointment?.usuario;

  return (
    <div className="col-12 col-lg-4">
      <div className="card rounded-3 bg-white shadow-sm border p-4 sticky-top" style={{ top: "85px", borderColor: "#EDE9FE" }}>
        <div className="text-center pb-3 border-bottom border-light-subtle mb-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: "72px", height: "72px", backgroundColor: "#F5F3FF", border: "2px solid #DDD6FE" }}
          >
            {pet?.especie ? getSpeciesIcon(pet.especie) : <i className="bi bi-shield-plus text-primary fs-2"></i>}
          </div>
          <h2 className="h5 fw-bold mb-0 text-dark">{pet?.nombre || "Cargando..."}</h2>
          <span className="badge bg-purple-subtle text-purple-emphasis rounded-1 mt-1 border">
            {pet?.especie || "Paciente"} · {pet?.raza || "Mestizo"}
          </span>
        </div>

        <div className="d-flex flex-column gap-2 mb-3">
          <div className="d-flex justify-content-between small">
            <span className="text-muted">Edad:</span>
            <strong className="text-dark">{pet?.edad ? `${pet.edad} años` : "No especificada"}</strong>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="text-muted">Sexo:</span>
            <strong className="text-dark">{pet?.sexo || "No especificado"}</strong>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="text-muted">Peso anterior:</span>
            <strong className="text-dark">{pet?.peso ? `${pet.peso} kg` : "Sin registro"}</strong>
          </div>
        </div>

        <div className="mb-3 p-3 rounded-2" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          <label htmlFor="patient-weigh-in" className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1">
            <i className="bi bi-speedometer2 text-primary"></i> Pesaje en Consulta (kg) <span className="text-danger">*</span>
          </label>
          <div className="input-group input-group-sm">
            <input
              id="patient-weigh-in"
              type="number"
              step="0.01"
              min="0.01"
              className={`form-control rounded-2 ${pesoError ? "is-invalid" : ""}`}
              placeholder="Peso en kilogramos"
              value={peso}
              onChange={(e) => {
                onPesoChange(e.target.value);
                onClearPesoError?.();
              }}
            />
            <span className="input-group-text rounded-2 ms-1">kg</span>
          </div>
          <FormFieldError error={pesoError} />
          <small className="text-muted d-block mt-1" style={{ fontSize: "0.72rem" }}>
            Actualizará el peso registrado en la ficha oficial.
          </small>
        </div>

        {appointment && (
          <div className="p-3 rounded-2 mb-3" style={{ backgroundColor: "#FAF9FC", border: "1px solid #EDE9FE" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: "0.72rem" }}>
                Turno Vinculado
              </span>
              <span className="badge bg-purple-subtle text-purple-emphasis">
                #{appointment.id}
              </span>
            </div>
            {appointment.motivo && (
              <div className="small text-dark mt-1" style={{ fontSize: "0.82rem" }}>
                <strong className="text-muted">Motivo:</strong> {appointment.motivo}
              </div>
            )}
          </div>
        )}

        {tutorInfo && (
          <div className="p-3 rounded-2" style={{ backgroundColor: "#FAF9FC", border: "1px solid #EDE9FE" }}>
            <div className="small fw-bold text-uppercase text-muted mb-1" style={{ fontSize: "0.72rem" }}>
              Tutor y Contacto de Urgencia
            </div>
            <strong className="d-block text-dark" style={{ fontSize: "0.95rem" }}>
              {tutorInfo.nombre} {tutorInfo.apellido}
            </strong>
            {tutorInfo.telefono ? (
              <span className="small text-secondary d-block mt-1">
                <i className="bi bi-telephone text-primary me-1"></i>
                <a href={`tel:${tutorInfo.telefono}`} className="text-decoration-none fw-medium text-dark">{tutorInfo.telefono}</a>
              </span>
            ) : (
              <span className="small text-muted d-block mt-1">Sin teléfono asentado</span>
            )}
            {tutorInfo.email && (
              <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                <i className="bi bi-envelope me-1"></i> {tutorInfo.email}
              </small>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
