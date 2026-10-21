import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import type { Pet } from "../types/Pet";
import type { Consultation } from "../types/Consultation";
import "../styles/PetDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

interface MedicalFile {
  id: number;
  nombre: string;
  nombreArchivo: string;
  tipo: string;
  ruta: string;
  fecha: string;
  mascotaId: number;
}

function PetDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [consultas, setConsultas] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const isProfessional = user?.role === "profesional" || user?.rol === "profesional";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/mascotas/${id}`, {
          headers: {
            Authorization: `Bearer ${token ?? localStorage.getItem("token") ?? ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la información de la mascota");
        }

        const data: Pet = await response.json();
        setPet(data);

        if (token && data.id) {
          try {
            setLoadingConsultas(true);
            const list = await consultationService.getConsultationsByPet(data.id, token);
            setConsultas(list);
          } catch (cErr) {
            console.warn("No se pudieron cargar las consultas:", cErr);
          } finally {
            setLoadingConsultas(false);
          }
        }
      } catch (err: any) {
        console.error("Error al cargar mascota:", err);
        setError(err.message || "Error al cargar los datos de la mascota");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, token]);

  const cargarArchivosMedicos = async () => {
    if (!id) {
      setLoadingFiles(false);
      return;
    }

    try {
      setLoadingFiles(true);
      const authToken = token ?? localStorage.getItem("token");
      const response = await fetch(`${API_URL}/archivos-medicos/mascota/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los archivos médicos");
      }

      const data = await response.json();
      setMedicalFiles(data);
    } catch (err) {
      console.error("Error al cargar archivos médicos:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    cargarArchivosMedicos();
  }, [id, token]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!tiposPermitidos.includes(file.type)) {
      alert("Solo se permiten archivos PDF, JPG y PNG.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no puede superar los 5 MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    if (!fileName) {
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Seleccioná un archivo médico.");
      return;
    }

    if (!id) {
      alert("No se pudo identificar la mascota.");
      return;
    }

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("archivo", selectedFile);
      formData.append(
        "nombre",
        fileName.trim() || selectedFile.name
      );
      formData.append("mascotaId", id);

      const response = await fetch(`${API_URL}/archivos-medicos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo adjuntar el archivo"
        );
      }

      setMedicalFiles((archivos) => [data, ...archivos]);

      setSelectedFile(null);
      setFileName("");

      const input = document.getElementById(
        "medical-file-input"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      alert("Archivo médico adjuntado correctamente.");
    } catch (err: any) {
      console.error("Error al subir archivo:", err);
      alert(err.message || "Error al adjuntar el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = async (file: MedicalFile) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/archivos-medicos/${file.id}/archivo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo abrir el archivo");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (err: any) {
      console.error("Error al visualizar archivo:", err);
      alert(err.message || "No se pudo abrir el archivo");
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este archivo médico?"
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/archivos-medicos/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo eliminar el archivo"
        );
      }

      setMedicalFiles((archivos) =>
        archivos.filter((archivo) => archivo.id !== fileId)
      );
    } catch (err: any) {
      console.error("Error al eliminar archivo:", err);
      alert(err.message || "No se pudo eliminar el archivo");
    }
  };

  if (loading) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="pet-details-loading">
            <div className="pet-details-loading-icon">🐾</div>
            <p>Cargando información de la mascota...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !pet) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error || "No hay datos de la mascota disponibles."}
          </div>
          <Link
            to={isProfessional ? "/profesional/turnos" : "/mascotas"}
            className="btn btn-outline-secondary mt-3"
          >
            {isProfessional ? "Volver a turnos" : "Volver a mis mascotas"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-details-page">
      <div className="container py-4">
        <div className="pet-details-card">

          <div className="pet-details-header">
            <div className="pet-details-icon">🐾</div>

            <div>
              <h1>{pet.nombre}</h1>

              <p>
                {pet.especie} {pet.raza ? `· ${pet.raza}` : "· Raza no especificada"}
              </p>
            </div>
          </div>

          <div className="pet-details-divider"></div>

          <div className="pet-details-info">

            <div className="pet-info-item">
              <span className="pet-info-icon">🐶</span>
              <div>
                <span className="pet-info-label">
                  Especie
                </span>

                <strong>{pet.especie}</strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🏷️</span>
              <div>
                <span className="pet-info-label">
                  Raza
                </span>

                <strong>
                  {pet.raza || "No especificada"}
                </strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">🎂</span>
              <div>
                <span className="pet-info-label">
                  Edad
                </span>

                <strong>
                  {pet.edad !== undefined &&
                  pet.edad !== null
                    ? `${pet.edad} años`
                    : "No especificada"}
                </strong>
              </div>
            </div>

            <div className="pet-info-item">
              <span className="pet-info-icon">⚥</span>
              <div>
                <span className="pet-info-label">
                  Sexo
                </span>

                <strong>
                  {pet.sexo
                    ? pet.sexo.charAt(0).toUpperCase() +
                      pet.sexo.slice(1).toLowerCase()
                    : "No especificado"}
                </strong>
              </div>
            </div>

          <div className="pet-info-item">
            <span className="pet-info-icon">⚖️</span>
            <div>
              <span className="pet-info-label">Peso Actual Base</span>
              <strong>{pet.peso ? `${pet.peso} kg` : "Sin registro"}</strong>
            </div>
          </div>

          {pet.usuario && (
            <div className="pet-info-item">
              <span className="pet-info-icon">👤</span>
              <div>
                <span className="pet-info-label">Tutor</span>
                <strong>
                  {pet.usuario.nombre} {pet.usuario.apellido}
                </strong>
              </div>
            </div>
          )}
          </div>

          <div className="medical-files-section">
            <div className="medical-files-header">
              <div>
                <h2>📁 Archivos médicos</h2>
                <p>
                  Adjuntá y consultá estudios, análisis y documentos de {pet.nombre}.
                </p>
              </div>
            </div>

            <div className="medical-upload-box">
              <div className="medical-upload-title">
                <span>📎</span>
                <div>
                  <strong>Adjuntar archivo</strong>
                  <small>PDF, JPG o PNG · Máximo 5 MB</small>
                </div>
              </div>

              <div className="medical-upload-fields">
                <div className="medical-field">
                  <label htmlFor="medical-file-name">Nombre del archivo</label>
                  <input
                    id="medical-file-name"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Ej. Análisis de sangre"
                  />
                </div>

                <div className="medical-field">
                  <label htmlFor="medical-file-input">Archivo</label>
                  <input
                    id="medical-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <button
                type="button"
                className="medical-upload-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : "⬆️ Adjuntar archivo"}
              </button>
            </div>

            <div className="medical-files-list">
              {loadingFiles ? (
                <div className="medical-files-empty">
                  <p>Cargando archivos médicos...</p>
                </div>
              ) : medicalFiles.length === 0 ? (
                <div className="medical-files-empty">
                  <div>📄</div>
                  <h3>No hay archivos médicos</h3>
                  <p>Todavía no se adjuntaron documentos para esta mascota.</p>
                </div>
              ) : (
                medicalFiles.map((file) => (
                  <div key={file.id} className="medical-file-card">
                    <div className="medical-file-icon">
                      {file.tipo === "application/pdf" ? "📄" : "🖼️"}
                    </div>
                    <div className="medical-file-info">
                      <strong>{file.nombre}</strong>
                      <span>{file.nombreArchivo}</span>
                      <small>{new Date(file.fecha).toLocaleDateString("es-AR")}</small>
                    </div>
                    <div className="medical-file-actions">
                      <button
                        type="button"
                        className="medical-view-button"
                        onClick={() => handleViewFile(file)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        type="button"
                        className="medical-delete-button"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pet-details-actions">
            {isProfessional ? (
              <>
                <Link to="/profesional/turnos" className="btn btn-outline-secondary">
                  Volver a turnos
                </Link>
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-primary"
                >
                  🩺 Iniciar Consulta SOAP
                </Link>
              </>
            ) : (
              <>
                <Link to="/mascotas" className="btn btn-outline-secondary">
                  Volver a mis mascotas
                </Link>
                <Link
                  to={`/turnos/nuevo?mascota=${pet.id}`}
                  className="btn btn-primary"
                >
                  Solicitar turno
                </Link>
              </>
            )}
          </div>
        

        </div>

        {isProfessional && (
          <div className="pet-details-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                  📋 Historial de Consultas SOAP
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Evolución clínica registrada para {pet.nombre}
                </p>
              </div>
              <Link
                to={`/profesional/atencion?mascotaId=${pet.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                + Nueva Consulta
              </Link>
            </div>

            {loadingConsultas ? (
              <p className="text-muted text-center py-4">Cargando historial clínico...</p>
            ) : consultas.length === 0 ? (
              <div className="text-center py-4" style={{ background: "#f8fafc", borderRadius: 12 }}>
                <p className="text-muted mb-2">No hay registros clínicos SOAP para este paciente aún.</p>
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-sm btn-primary"
                >
                  🩺 Registrar primera atención
                </Link>
              </div>
            ) : (
              <div className="consultations-timeline mt-3">
                {consultas.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "18px 20px",
                      marginBottom: "16px",
                      background: "#ffffff",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                      <div>
                        <strong style={{ color: "#0f172a", fontSize: "1rem" }}>
                          📅 {c.fecha ? new Date(c.fecha).toLocaleDateString("es-AR") : "Fecha no disponible"}
                        </strong>
                        {c.veterinario && (
                          <span className="text-muted ms-2" style={{ fontSize: "0.875rem" }}>
                            por Dr./Dra. {c.veterinario.nombre} {c.veterinario.apellido}
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-light text-dark border" title="Peso actual">
                          ⚖️ {c.peso} kg
                        </span>
                        <span className="badge bg-light text-dark border" title="Temperatura">
                          🌡️ {c.temperatura} °C
                        </span>
                        {c.frecuenciaCardiaca !== null && c.frecuenciaCardiaca !== undefined && (
                          <span className="badge bg-light text-dark border" title="Frecuencia Cardíaca">
                            💓 {c.frecuenciaCardiaca} lpm
                          </span>
                        )}
                        {c.frecuenciaRespiratoria !== null && c.frecuenciaRespiratoria !== undefined && (
                          <span className="badge bg-light text-dark border" title="Frecuencia Respiratoria">
                            🫁 {c.frecuenciaRespiratoria} rpm
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <small className="text-primary fw-bold d-block mb-1">[S] Subjetivo (Anamnesis):</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.subjetivo}</p>
                      </div>

                      <div>
                        <small className="text-warning fw-bold d-block mb-1">[A] Diagnóstico / Análisis:</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.analisis}</p>
                      </div>

                      <div>
                        <small className="text-success fw-bold d-block mb-1">[O] Objetivo (Examen Físico):</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>
                          {c.objetivo ? c.objetivo : "Sin hallazgos adicionales descriptos"}
                        </p>
                      </div>

                      <div>
                        <small className="text-info fw-bold d-block mb-1">[P] Plan & Tratamiento:</small>
                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{c.plan}</p>
                      </div>
                    </div>

                    {c.observaciones && (
                      <div className="mt-3 pt-2 border-top">
                        <small className="text-muted fw-bold d-block">Observaciones / Indicaciones al tutor:</small>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, whiteSpace: "pre-line" }}>{c.observaciones}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default PetDetails;