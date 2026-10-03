import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Pet } from "../types/Pet";
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

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const cargarMascota = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/mascotas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar la mascota");
      }

      const data = await response.json();
      setPet(data);
    } catch (err: any) {
      console.error("Error al cargar mascota:", err);
      setError(err.message || "Error al cargar los datos de la mascota");
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivosMedicos = async () => {
    if (!id) return;

    try {
      setLoadingFiles(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/archivos-medicos/mascota/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    cargarMascota();
    cargarArchivosMedicos();
  }, [id]);

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
            to="/mascotas"
            className="btn btn-outline-secondary mt-3"
          >
            Volver a mis mascotas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-details-page">
      <div className="container py-5">
        <div className="pet-details-card">

          <div className="pet-details-header">
            <div className="pet-details-icon">🐾</div>

            <div>
              <h1>{pet.nombre}</h1>

              <p>
                {pet.especie} · {pet.raza || "Raza mestiza"}
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

          </div>

          <div className="medical-files-section">

            <div className="medical-files-header">
              <div>
                <h2>📁 Archivos médicos</h2>

                <p>
                  Adjuntá y consultá estudios, análisis y
                  documentos de {pet.nombre}.
                </p>
              </div>
            </div>

            <div className="medical-upload-box">

              <div className="medical-upload-title">
                <span>📎</span>

                <div>
                  <strong>Adjuntar archivo</strong>

                  <small>
                    PDF, JPG o PNG · Máximo 5 MB
                  </small>
                </div>
              </div>

              <div className="medical-upload-fields">

                <div className="medical-field">
                  <label htmlFor="medical-file-name">
                    Nombre del archivo
                  </label>

                  <input
                    id="medical-file-name"
                    type="text"
                    value={fileName}
                    onChange={(e) =>
                      setFileName(e.target.value)
                    }
                    placeholder="Ej. Análisis de sangre"
                  />
                </div>

                <div className="medical-field">
                  <label htmlFor="medical-file-input">
                    Archivo
                  </label>

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
                {uploading
                  ? "Subiendo..."
                  : "⬆️ Adjuntar archivo"}
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

                  <h3>
                    No hay archivos médicos
                  </h3>

                  <p>
                    Todavía no se adjuntaron documentos
                    para esta mascota.
                  </p>
                </div>
              ) : (
                medicalFiles.map((file) => (
                  <div
                    key={file.id}
                    className="medical-file-card"
                  >

                    <div className="medical-file-icon">
                      {file.tipo === "application/pdf"
                        ? "📄"
                        : "🖼️"}
                    </div>

                    <div className="medical-file-info">

                      <strong>{file.nombre}</strong>

                      <span>
                        {file.nombreArchivo}
                      </span>

                      <small>
                        {new Date(
                          file.fecha
                        ).toLocaleDateString("es-AR")}
                      </small>

                    </div>

                    <div className="medical-file-actions">

                      <button
                        type="button"
                        className="medical-view-button"
                        onClick={() =>
                          handleViewFile(file)
                        }
                      >
                        👁️ Ver
                      </button>

                      <button
                        type="button"
                        className="medical-delete-button"
                        onClick={() =>
                          handleDeleteFile(file.id)
                        }
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

            <Link
              to="/mascotas"
              className="btn btn-outline-secondary"
            >
              Volver a mis mascotas
            </Link>

            <Link
              to={`/turnos/nuevo?mascota=${pet.id}`}
              className="btn btn-primary"
            >
              Solicitar turno
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}

export default PetDetails;