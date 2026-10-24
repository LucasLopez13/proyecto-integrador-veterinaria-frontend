import React from "react";
import { Link, useNavigate } from "react-router-dom";

export interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  text?: string;
  variant?: "ghost" | "outline";
  className?: string;
}

/**
 * Botón o enlace de retorno estilizado según las pautas de diseño:
 * - Icono vectorial bi-arrow-left de Bootstrap Icons
 * - Radio estricto de 6px (Bootstrap rounded-2)
 * - Micro-interacción al hacer hover: desplazamiento suave hacia la izquierda
 * - Paleta Deep Violet (#6D28D9) con sutil tinte lavanda (#F5F3FF) y borde (#EDE9FE)
 */
export const BackButton: React.FC<BackButtonProps> = ({
  to,
  onClick,
  text = "Volver",
  variant = "ghost",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (!to) {
      e.preventDefault();
      navigate(-1);
    }
  };

  if (variant === "outline") {
    if (to) {
      return (
        <Link to={to} className={`btn-back-outline ${className}`}>
          <i className="bi bi-arrow-left"></i>
          <span>{text}</span>
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`btn-back-outline ${className}`}
      >
        <i className="bi bi-arrow-left"></i>
        <span>{text}</span>
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={`btn-back ${className}`}>
        <span className="btn-back-icon">
          <i className="bi bi-arrow-left"></i>
        </span>
        <span className="btn-back-text">{text}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-back ${className}`}
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <span className="btn-back-icon">
        <i className="bi bi-arrow-left"></i>
      </span>
      <span className="btn-back-text">{text}</span>
    </button>
  );
};

export default BackButton;
