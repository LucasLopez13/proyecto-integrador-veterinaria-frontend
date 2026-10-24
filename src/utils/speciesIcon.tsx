import React from "react";

const CatIcon: React.FC<{ className?: string }> = ({ className = "text-primary" }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "-0.125em" }}
    aria-hidden="true"
  >
    <path d="M12 5c-3.8 0-6.5 2.2-6.5 6 0 2.8 1.4 4.5 3 5.5v1.2a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-1.2c1.6-1 3-2.7 3-5.5 0-3.8-2.7-6-6.5-6z" />
    <path d="m5.5 10.5-2.2-5 5 1.8" />
    <path d="m18.5 10.5 2.2-5-5 1.8" />
    <circle cx="9.5" cy="11.5" r=".75" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r=".75" fill="currentColor" />
    <path d="m12 14-.5.8h1z" fill="currentColor" />
  </svg>
);

/**
 * Renderiza el icono vectorial correspondiente a cada especie animal
 */
export function getSpeciesIcon(speciesName?: string | null): React.ReactElement {
  const norm = (speciesName || "").toLowerCase().trim();
  switch (norm) {
    case "canino":
    case "perro":
      return <i className="bi bi-shield-plus text-primary" title="Canino"></i>;
    case "felino":
    case "gato":
      return <CatIcon className="text-primary" />;
    case "ave":
    case "pájaro":
      return <i className="bi bi-feather text-success" title="Ave"></i>;
    default:
      return <i className="bi bi-shield-plus text-primary" title="Mascota"></i>;
  }
}

