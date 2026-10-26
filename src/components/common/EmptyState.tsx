import React from "react";
import { Link } from "react-router-dom";

export interface EmptyStateAction {
  label?: string;
  text?: string;
  to?: string;
  icon?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  actionTo?: string;
  onAction?: () => void;
  actionIcon?: string;
  action?: EmptyStateAction;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "bi-inbox",
  title,
  description,
  actionText,
  actionTo,
  onAction,
  actionIcon = "bi-plus-lg",
  action,
  compact = false,
}) => {
  const containerClass = compact
    ? "p-4 text-center border-subtle bg-white rounded-3"
    : "card rounded-3 p-5 text-center border-subtle bg-white";

  const resolvedText = action?.label || action?.text || actionText;
  const resolvedTo = action?.to || actionTo;
  const resolvedAction = action?.onClick || onAction;
  const resolvedIcon = action?.icon || actionIcon;

  return (
    <div className={containerClass}>
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto"
        style={{ width: "56px", height: "56px", backgroundColor: "#F5F3FF", color: "#6D28D9", fontSize: "1.75rem" }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h3 className="h6 fw-bold text-dark mb-1">{title}</h3>
      {description && <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: "420px" }}>{description}</p>}

      {resolvedText && resolvedTo && (
        <div>
          <Link to={resolvedTo} className="btn btn-primary rounded-2 px-4 shadow-sm d-inline-flex align-items-center gap-2">
            {resolvedIcon && <i className={`bi ${resolvedIcon}`}></i>}
            {resolvedText}
          </Link>
        </div>
      )}

      {resolvedText && resolvedAction && !resolvedTo && (
        <div>
          <button
            type="button"
            onClick={resolvedAction}
            className="btn btn-primary rounded-2 px-4 shadow-sm d-inline-flex align-items-center gap-2"
          >
            {resolvedIcon && <i className={`bi ${resolvedIcon}`}></i>}
            {resolvedText}
          </button>
        </div>
      )}
    </div>
  );
};
