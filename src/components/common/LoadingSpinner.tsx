import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  size = "md",
}) => {
  const spinnerClass = size === "sm" ? "spinner-border spinner-border-sm text-primary" : "spinner-border text-primary";

  return (
    <div className="text-center py-5">
      <div className={spinnerClass} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="mt-2 text-muted small mb-0">{message}</p>}
    </div>
  );
};
