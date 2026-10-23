import React from "react";
import type { Consultation, ConsultationVersion } from "../../types/Consultation";
import "../../styles/ConsultationModals.css";

interface ConsultationAuditModalProps {
  consulta: Consultation | null;
  petName: string;
  loading: boolean;
  versions: ConsultationVersion[];
  onClose: () => void;
}

export const ConsultationAuditModal: React.FC<ConsultationAuditModalProps> = ({
  consulta,
  petName,
  loading,
  versions,
  onClose,
}) => {
  if (!consulta) return null;

  return (
    <div className="audit-modal-backdrop" onClick={onClose}>
      <div className="audit-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <div>
            <h3>
              <i className="bi bi-journal-medical me-2"></i>
              Auditoría e Inmutabilidad de Historia Clínica
            </h3>
            <p>
              Paciente: <strong>{petName}</strong> · Consulta #{consulta.id} · Versión actual: v{consulta.version || 1}
            </p>
          </div>
          <button
            type="button"
            className="audit-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="audit-modal-body">
          <div className="legal-notice-banner">
            <i className="bi bi-shield-check text-purple" style={{ fontSize: "1.4rem" }}></i>
            <div>
              <strong>Garantía Legal de Inalterabilidad e Inmutabilidad</strong>
              <div style={{ marginTop: 2, fontSize: "0.82rem" }}>
                Cada intervención médica queda registrada de forma inmutable con su sello criptográfico SHA-256,
                marca temporal exacta y autor responsable. Las modificaciones generan versiones correlativas sin sobreescribir el historial previo.
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted">Cargando trazabilidad y versiones de la consulta...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No se registran versiones para esta consulta.</p>
            </div>
          ) : (
            <div className="versions-timeline">
              {versions.map((ver) => {
                const isCreation = ver.tipoAccion === "CREACION_INICIAL";
                const isAnnulment = ver.tipoAccion === "ANULACION_LOGICA";

                return (
                  <div key={ver.id} className="version-item">
                    <div
                      className={`version-indicator ${
                        isCreation
                          ? "action-creacion"
                          : isAnnulment
                          ? "action-anulacion"
                          : "action-modificacion"
                      }`}
                    />

                    <div className="version-card">
                      <div className="version-card-header">
                        <div className="version-title">
                          <span>Versión #{ver.numeroVersion}</span>
                          <span
                            className={`badge ${
                              isCreation
                                ? "bg-success"
                                : isAnnulment
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                            style={{ fontSize: "0.74rem" }}
                          >
                            {isCreation && (
                              <>
                                <i className="bi bi-plus-circle me-1"></i>
                                Creación Inicial
                              </>
                            )}
                            {!isCreation && !isAnnulment && (
                              <>
                                <i className="bi bi-pencil-square me-1"></i>
                                Enmienda / Modificación
                              </>
                            )}
                            {isAnnulment && (
                              <>
                                <i className="bi bi-slash-circle me-1"></i>
                                Anulación Lógica
                              </>
                            )}
                          </span>
                        </div>
                        <div className="version-meta">
                          <i className="bi bi-calendar-event me-1"></i>
                          {new Date(ver.fechaVersion || ver.createdAt).toLocaleString("es-AR")}
                        </div>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: 8 }}>
                        <strong>Responsable: </strong>
                        {ver.autor
                          ? `Dr./Dra. ${ver.autor.nombre} ${ver.autor.apellido} (${ver.autor.email})`
                          : `Usuario #${ver.autorId}`}
                      </div>

                      <div className="version-motivo-box">
                        <strong>Motivo y Justificación Médica Registrada:</strong>
                        "{ver.motivoEdicion}"
                      </div>

                      {ver.valoresModificados && Object.keys(ver.valoresModificados).length > 0 && (
                        <div>
                          <small className="fw-bold text-muted d-block mb-1">
                            Valores modificados en esta enmienda:
                          </small>
                          <table className="version-diff-table">
                            <thead>
                              <tr>
                                <th>Campo Clínico</th>
                                <th>Valor Anterior</th>
                                <th>Nuevo Valor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(ver.valoresModificados).map(([campo, valorNuevo]) => {
                                const valorAnterior = ver.valoresAnteriores?.[campo];
                                return (
                                  <tr key={campo}>
                                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{campo}</td>
                                    <td>
                                      <span className="diff-old">
                                        {valorAnterior !== null && valorAnterior !== undefined
                                          ? String(valorAnterior)
                                          : "Sin valor"}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="diff-new">
                                        {valorNuevo !== null && valorNuevo !== undefined
                                          ? String(valorNuevo)
                                          : "Sin valor"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="version-sha-box mt-2">
                        <span>
                          <i className="bi bi-fingerprint me-1"></i>SHA-256:
                        </span>
                        <span className="sha-code">{ver.hashSha256}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="audit-modal-footer">
          <button
            type="button"
            className="btn btn-secondary rounded-2 btn-sm px-3"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
