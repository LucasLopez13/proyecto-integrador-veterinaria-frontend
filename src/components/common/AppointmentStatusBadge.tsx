import React from "react";

interface AppointmentStatusBadgeProps {
  status: string;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "confirmado":
      return (
        <span className="badge rounded-2 px-2 py-1 bg-success-subtle text-success border border-success-subtle fw-medium d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle"></i> Confirmado
        </span>
      );
    case "pendiente":
      return (
        <span className="badge rounded-2 px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-medium d-inline-flex align-items-center gap-1">
          <i className="bi bi-clock"></i> Pendiente
        </span>
      );
    case "atendido":
    case "completado":
      return (
        <span className="badge rounded-2 px-2 py-1 bg-purple-subtle text-purple-emphasis border border-purple-subtle fw-medium d-inline-flex align-items-center gap-1">
          <i className="bi bi-file-earmark-medical"></i> Atendido
        </span>
      );
    case "cancelado":
      return (
        <span className="badge rounded-2 px-2 py-1 bg-danger-subtle text-danger border border-danger-subtle fw-medium d-inline-flex align-items-center gap-1">
          <i className="bi bi-x-circle"></i> Cancelado
        </span>
      );
    default:
      return (
        <span className="badge rounded-2 px-2 py-1 bg-light text-dark border fw-medium d-inline-flex align-items-center gap-1">
          {status}
        </span>
      );
  }
};
