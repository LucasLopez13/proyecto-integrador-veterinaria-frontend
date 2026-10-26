import React from "react";

export function getSpeciesIcon(speciesName?: string | null): React.ReactElement {
  const norm = (speciesName || "Mascota").trim();
  const title = norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : "Mascota";
  return <i className="bi bi-shield-plus text-primary" title={title}></i>;
}
