import React from "react";
import { Link, useNavigate } from "react-router-dom";

export interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  text?: string;
  variant?: "ghost" | "outline";
  className?: string;
}

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
