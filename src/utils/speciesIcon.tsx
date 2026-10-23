import React from "react";

/**
 * Renderiza el icono vectorial Bootstrap correspondiente a cada especie animal
 */
export function getSpeciesIcon(speciesName?: string | null): React.ReactElement {
  const norm = (speciesName || "").toLowerCase().trim();
  switch (norm) {
    case "canino":
    case "perro":
      return <i className="bi bi-shield-plus text-primary" title="Canino"></i>;
    case "felino":
    case "gato":
      return <i className="bi bi-stars text-info" title="Felino"></i>;
    case "ave":
    case "pájaro":
      return <i className="bi bi-feather text-success" title="Ave"></i>;
    default:
      return <i className="bi bi-heart-pulse text-secondary" title="Otro"></i>;
  }
}
