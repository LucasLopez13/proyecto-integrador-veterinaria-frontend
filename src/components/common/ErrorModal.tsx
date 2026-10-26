import React, { useEffect } from "react";

export interface ErrorModalProps {
  isOpen?: boolean;
  error?: string | null;
  title?: string;
  onClose: () => void;
  actionText?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  error,
  title = "Error de Validación",
  onClose,
  actionText = "Entendido",
}) => {
  const show = isOpen !== undefined ? isOpen && Boolean(error) : Boolean(error);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show || !error) return null;

  const hasMultipleItems =
    error.includes(":") && (error.includes(". ") || error.includes(";"));
  let prefix = "";
  let bulletPoints: string[] = [];

  if (hasMultipleItems) {
    const firstColonIdx = error.indexOf(":");
    prefix = error.substring(0, firstColonIdx + 1).trim();
    const rest = error.substring(firstColonIdx + 1).trim();
    bulletPoints = rest
      .split(/[.;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 1070,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "460px",
          border: "1px solid var(--vet-border-tint, #EDE9FE)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FEE2E2",
                color: "#DC2626",
                fontSize: "1.35rem",
              }}
            >
              <i className="bi bi-exclamation-octagon"></i>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h3
                  className="h6 fw-bold mb-0"
                  style={{ color: "var(--vet-text-main, #1E1B4B)", fontSize: "1.05rem" }}
                >
                  {title}
                </h3>
                <button
                  type="button"
                  className="btn-close ms-2"
                  style={{ fontSize: "0.75rem" }}
                  aria-label="Cerrar"
                  onClick={onClose}
                />
              </div>

              {bulletPoints.length > 0 ? (
                <div className="mt-2 text-muted small" style={{ lineHeight: 1.5 }}>
                  <p className="fw-semibold text-danger mb-2">{prefix}</p>
                  <ul className="mb-0 ps-3">
                    {bulletPoints.map((pt, idx) => (
                      <li key={idx} className="mb-1 text-dark">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p
                  className="text-muted small mb-0 mt-2"
                  style={{ lineHeight: 1.55, whiteSpace: "pre-line" }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="px-4 py-3 border-top d-flex justify-content-end"
          style={{
            backgroundColor: "var(--vet-bg-canvas, #FAF9FC)",
            borderColor: "var(--vet-border-tint, #EDE9FE)",
          }}
        >
          <button
            type="button"
            className="btn btn-primary rounded-2 btn-sm fw-medium px-4 shadow-sm"
            style={{
              backgroundColor: "var(--vet-primary, #6D28D9)",
              borderColor: "var(--vet-primary, #6D28D9)",
            }}
            onClick={onClose}
            autoFocus
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};
