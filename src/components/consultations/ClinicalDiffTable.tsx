import React from "react";

interface ClinicalDiffTableProps {
  modifiedValues?: Record<string, any>;
  previousValues?: Record<string, any>;
}

interface FieldConfig {
  label: string;
  icon: string;
  unit?: string;
}

const FIELD_CONFIGS: Record<string, FieldConfig> = {
  temperatura: {
    label: "Temperatura",
    icon: "bi-thermometer-half",
    unit: "°C",
  },
  peso: {
    label: "Peso",
    icon: "bi-speedometer2",
    unit: "kg",
  },
  frecuenciaCardiaca: {
    label: "Frecuencia Cardíaca",
    icon: "bi-heart-pulse",
    unit: "lpm",
  },
  frecuenciaRespiratoria: {
    label: "Frecuencia Respiratoria",
    icon: "bi-lungs",
    unit: "rpm",
  },
  subjetivo: {
    label: "Subjetivo (S)",
    icon: "bi-chat-left-text",
  },
  objetivo: {
    label: "Objetivo (O)",
    icon: "bi-clipboard2-pulse",
  },
  analisis: {
    label: "Análisis Clínico (A)",
    icon: "bi-search",
  },
  plan: {
    label: "Plan Terapéutico (P)",
    icon: "bi-calendar2-check",
  },
  observaciones: {
    label: "Observaciones",
    icon: "bi-eye",
  },
  diagnostico: {
    label: "Diagnóstico",
    icon: "bi-bandaid",
  },
  tratamiento: {
    label: "Tratamiento",
    icon: "bi-capsule",
  },
  motivo: {
    label: "Motivo de Consulta",
    icon: "bi-question-circle",
  },
  anamnesis: {
    label: "Anamnesis",
    icon: "bi-journal-medical",
  },
  estado: {
    label: "Estado de Consulta",
    icon: "bi-shield-exclamation",
  },
};

const getFieldConfig = (campo: string): FieldConfig => {
  if (FIELD_CONFIGS[campo]) {
    return FIELD_CONFIGS[campo];
  }
  const formatted = campo
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  return {
    label: formatted,
    icon: "bi-tag",
  };
};

export const ClinicalDiffTable: React.FC<ClinicalDiffTableProps> = ({
  modifiedValues,
  previousValues,
}) => {
  if (!modifiedValues || Object.keys(modifiedValues).length === 0) {
    return null;
  }

  const entries = Object.entries(modifiedValues);

  return (
    <div className="clinical-diff-wrapper">
      <div className="clinical-diff-title">
        <i className="bi bi-clock-history text-purple"></i>
        <span>Comparativa de modificaciones</span>
      </div>

      <table className="clinical-diff-table">
        <thead>
          <tr>
            <th>
              <i className="bi bi-tag me-1"></i>
              Campo Clínico
            </th>
            <th>
              <i className="bi bi-dash-circle me-1 text-danger"></i>
              Valor Anterior
            </th>
            <th>
              <i className="bi bi-check-circle me-1 text-success"></i>
              Nuevo Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([campo, valorNuevo]) => {
            const config = getFieldConfig(campo);
            const valorAnterior = previousValues?.[campo];

            const hasOldValue =
              valorAnterior !== null &&
              valorAnterior !== undefined &&
              String(valorAnterior).trim() !== "";
            const hasNewValue =
              valorNuevo !== null &&
              valorNuevo !== undefined &&
              String(valorNuevo).trim() !== "";

            const formattedOld = hasOldValue
              ? config.unit && typeof valorAnterior === "number"
                ? `${valorAnterior} ${config.unit}`
                : String(valorAnterior)
              : null;

            const formattedNew = hasNewValue
              ? config.unit && typeof valorNuevo === "number"
                ? `${valorNuevo} ${config.unit}`
                : String(valorNuevo)
              : null;

            return (
              <tr key={campo}>
                <td>
                  <div className="diff-field-cell">
                    <span className="diff-field-name">
                      <i className={`bi ${config.icon}`}></i>
                      {config.label}
                    </span>
                    {config.unit && (
                      <span className="diff-field-unit">
                        Unidad: {config.unit}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="diff-value-card diff-value-card-old">
                    <span className="diff-pill-header diff-pill-header-old">
                      <i className="bi bi-clock-history"></i>
                      Antes
                    </span>
                    {formattedOld ? (
                      <span className="diff-content-text diff-content-text-old">
                        {formattedOld}
                      </span>
                    ) : (
                      <span className="diff-content-empty">
                        (Sin valor previo registrado)
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="diff-value-card diff-value-card-new">
                    <span className="diff-pill-header diff-pill-header-new">
                      <i className="bi bi-check2-circle"></i>
                      Actualizado
                    </span>
                    {formattedNew ? (
                      <span className="diff-content-text diff-content-text-new">
                        {formattedNew}
                      </span>
                    ) : (
                      <span className="diff-content-empty">
                        (Sin valor)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
