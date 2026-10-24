import React from "react";

export type FeedbackType = "error" | "success" | "warning" | "info" | "confirm";

export interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export type FeedbackModalState = Omit<FeedbackModalProps, "onClose">;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type = "info",
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isConfirm = type === "confirm";

  const getIconConfig = () => {
    switch (type) {
      case "error":
        return {
          bg: "#FEF2F2",
          border: "#FEE2E2",
          color: "#DC2626",
          icon: "bi-exclamation-octagon",
          defaultTitle: "Ha ocurrido un error",
        };
      case "warning":
        return {
          bg: "#FFFBEB",
          border: "#FEF3C7",
          color: "#D97706",
          icon: "bi-exclamation-triangle",
          defaultTitle: "Atención requerida",
        };
      case "success":
        return {
          bg: "#F0FDF4",
          border: "#DCFCE7",
          color: "#16A34A",
          icon: "bi-check2-circle",
          defaultTitle: "Operación exitosa",
        };
      case "confirm":
        return {
          bg: "#F5F3FF",
          border: "#EDE9FE",
          color: "var(--vet-primary, #6D28D9)",
          icon: "bi-question-circle",
          defaultTitle: "Confirmar acción",
        };
      case "info":
      default:
        return {
          bg: "#F5F3FF",
          border: "#EDE9FE",
          color: "var(--vet-primary, #6D28D9)",
          icon: "bi-info-circle",
          defaultTitle: "Información del sistema",
        };
    }
  };

  const config = getIconConfig();
  const modalTitle = title || config.defaultTitle;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 1060,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "440px",
          border: "1px solid var(--vet-border-tint, #EDE9FE)",
          overflow: "hidden",
        }}
      >
        <div className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                color: config.color,
                fontSize: "1.25rem",
              }}
            >
              <i className={`bi ${config.icon}`}></i>
            </div>

            <div className="flex-grow-1">
              <h3
                className="h6 fw-bold mb-1"
                style={{ color: "var(--vet-text-main, #1E1B4B)", fontSize: "1.05rem" }}
              >
                {modalTitle}
              </h3>
              <p
                className="text-muted small mb-0"
                style={{ lineHeight: 1.5, whiteSpace: "pre-line" }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        <div
          className="px-4 py-3 border-top d-flex justify-content-end gap-2"
          style={{
            backgroundColor: "var(--vet-bg-canvas, #FAF9FC)",
            borderColor: "var(--vet-border-tint, #EDE9FE)",
          }}
        >
          {isConfirm ? (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-2 btn-sm fw-medium px-3"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-2 btn-sm fw-medium px-4 shadow-sm"
                style={{
                  backgroundColor: "var(--vet-primary, #6D28D9)",
                  borderColor: "var(--vet-primary, #6D28D9)",
                }}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary rounded-2 btn-sm fw-medium px-4 shadow-sm"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                borderColor: "var(--vet-primary, #6D28D9)",
              }}
              onClick={onClose}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
