
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import { apiFetch } from "../services/apiClient";
import { FILE_UPLOAD_LIMITS } from "../constants";
import { getSpeciesIcon } from "../utils/speciesIcon";
import { formatDate } from "../utils/dateUtils";
import type { Pet } from "../types/Pet";
import type { MedicalFile } from "../types/MedicalFile";
import type { Consultation, ConsultationVersion, UpdateConsultationDTO } from "../types/Consultation";
import type { SanitaryRecord } from "../types/SanitaryRecord";
import { ConsultationCard } from "../components/consultations/ConsultationCard";
import { ConsultationAuditModal } from "../components/consultations/ConsultationAuditModal";
import { ConsultationAmendmentModal } from "../components/consultations/ConsultationAmendmentModal";
import { ConsultationAnnulModal } from "../components/consultations/ConsultationAnnulModal";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { BackButton } from "../components/common/BackButton";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { FormFieldError } from "../components/common/FormFieldError";
import "../styles/PetDetails.css";
import { QRCodeSVG } from "qrcode.react";

function PetDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [consultas, setConsultas] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carnetToken, setCarnetToken] = useState<string | null>(null);
  const [loadingCarnet, setLoadingCarnet] = useState(false);
  const [errorCarnet, setErrorCarnet] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"historial" | "archivos" | "ficha"| "sanitaria">("historial");

  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileFormErrors, setFileFormErrors] = useState<Record<string, string>>({});

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const userRole = String(user?.role || user?.rol || "").toLowerCase();
  const isProfessional = userRole === "profesional" || userRole === "admin";

  const [auditModalConsulta, setAuditModalConsulta] = useState<Consultation | null>(null);
  const [versionsList, setVersionsList] = useState<ConsultationVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);

  const [editingConsulta, setEditingConsulta] = useState<Consultation | null>(null);
  const [savingAmendment, setSavingAmendment] = useState<boolean>(false);

  const [anulandoConsulta, setAnulandoConsulta] = useState<Consultation | null>(null);
  const [savingAnulacion, setSavingAnulacion] = useState<boolean>(false);

  const [sanitaryRecords, setSanitaryRecords] = useState<SanitaryRecord[]>([]);
  const [loadingSanitaryRecords, setLoadingSanitaryRecords] = useState(true);
  const [sanitaryRecordsError, setSanitaryRecordsError] = useState<string | null>(null);
  const [vacunasAbiertas, setVacunasAbiertas] = useState(true);
  const [desparasitacionesAbiertas, setDesparasitacionesAbiertas] = useState(false);
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch<Pet>(`/mascotas/${id}`);
        setPet(data);

        if (data.id) {
          try {
            setLoadingConsultas(true);
            const list = await consultationService.getConsultationsByPet(data.id);
            setConsultas(list);
          } catch {
          } finally {
            setLoadingConsultas(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos de la mascota");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);


  const handleGenerarCarnet = async () => {
    if (!pet?.id) return;

    try {
      setLoadingCarnet(true);
      setErrorCarnet(null);

      const data = await apiFetch<{ mascotaId: number; token: string }>(
        `/carnets-vacunacion/mascota/${pet.id}`
      );

      setCarnetToken(data.token);
    } catch (err) {
      setErrorCarnet(
        err instanceof Error
          ? err.message
          : "No se pudo generar el carnet de vacunación."
      );
    } finally {
      setLoadingCarnet(false);
    }
  };


  const cargarArchivosMedicos = async () => {
    if (!id) {
      setLoadingFiles(false);
      return;
    }

    try {
      setLoadingFiles(true);
      const data = await apiFetch<MedicalFile[]>(`/archivos-medicos/mascota/${id}`);
      setMedicalFiles(data);
    } catch {
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    cargarArchivosMedicos();
  }, [id]);

  const cargarRegistrosSanitarios = async () => {
    if (!id) {
      setLoadingSanitaryRecords(false);
      return;
    }

    try {
      setLoadingSanitaryRecords(true);
      setSanitaryRecordsError(null);

      const data = await apiFetch<SanitaryRecord[]>(
        `/registroSanitario/mascota/${id}`
      );

      setSanitaryRecords(data);
    } catch (err) {
      setSanitaryRecordsError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la libreta sanitaria"
      );
    } finally {
      setLoadingSanitaryRecords(false);
    }
  };
  const vacunas = sanitaryRecords.filter((record) => record.tipo === "vacuna");
  const desparasitaciones = sanitaryRecords.filter((record) => record.tipo === "antiparasitario");
  const [mostrarFormularioSanitario, setMostrarFormularioSanitario] =
  useState(false);

  const [guardandoRegistroSanitario, setGuardandoRegistroSanitario] =
    useState(false);

  const [sanitaryForm, setSanitaryForm] = useState({
    tipo: "vacuna" as "vacuna" | "antiparasitario",
    nombre: "",
    lote: "",
    fechaAplicacion: new Date().toLocaleDateString("en-CA"),
    fechaRefuerzoEstimada: "",
  });

  const [sanitaryFormErrors, setSanitaryFormErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    cargarRegistrosSanitarios();
  }, [id]);
  const handleCrearRegistroSanitario = async (
      e: React.FormEvent<HTMLFormElement>
      ) => {
      e.preventDefault();

      const errors: Record<string, string> = {};

      if (!sanitaryForm.nombre.trim()) {
        errors.nombre = "Ingresá el nombre de la vacuna o antiparasitario.";
      }

      if (!sanitaryForm.fechaAplicacion) {
        errors.fechaAplicacion = "La fecha de aplicación es obligatoria.";
      }

      if (
        sanitaryForm.fechaRefuerzoEstimada &&
        sanitaryForm.fechaRefuerzoEstimada < sanitaryForm.fechaAplicacion
      ) {
        errors.fechaRefuerzoEstimada =
          "El refuerzo estimado no puede ser anterior a la aplicación.";
      }

      if (Object.keys(errors).length > 0) {
        setSanitaryFormErrors(errors);
        return;
      }

      try {
        setGuardandoRegistroSanitario(true);
        setSanitaryFormErrors({});

        const payload = {
          tipo: sanitaryForm.tipo,
          nombre: sanitaryForm.nombre.trim(),
          fechaAplicacion: sanitaryForm.fechaAplicacion,
          mascotaId: Number(id),
          ...(sanitaryForm.lote.trim()
            ? { lote: sanitaryForm.lote.trim() }
            : {}),
          ...(sanitaryForm.fechaRefuerzoEstimada
            ? { fechaRefuerzoEstimada: sanitaryForm.fechaRefuerzoEstimada }
            : {}),
        };

        await apiFetch("/registroSanitario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        await cargarRegistrosSanitarios();

        setMostrarFormularioSanitario(false);

        setSanitaryForm({
          tipo: "vacuna",
          nombre: "",
          lote: "",
          fechaAplicacion: new Date().toLocaleDateString("en-CA"),
          fechaRefuerzoEstimada: "",
        });

        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "Registro sanitario creado",
          message: "El registro se guardó correctamente en la libreta sanitaria.",
        });
      } catch (err: unknown) {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al registrar",
          message:
            err instanceof Error
              ? err.message
              : "No se pudo guardar el registro sanitario.",
        });
      } finally {
        setGuardandoRegistroSanitario(false);
      }
    };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > FILE_UPLOAD_LIMITS.MAX_SIZE_BYTES) {
        setFileFormErrors((prev) => ({
          ...prev,
          file: `El archivo no puede superar los ${FILE_UPLOAD_LIMITS.MAX_SIZE_MB} MB`,
        }));
        e.target.value = "";
        setSelectedFile(null);
        return;
      }

      if (!FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
        setFileFormErrors((prev) => ({
          ...prev,
          file: "Solo se permiten archivos PDF, JPG o PNG",
        }));
        e.target.value = "";
        setSelectedFile(null);
        return;
      }

      setFileFormErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    const newErrors: Record<string, string> = {};

    if (!fileName.trim()) {
      newErrors.fileName = "Completá este campo con el título o descripción del documento";
    }

    if (!selectedFile) {
      newErrors.file = "Seleccioná un archivo para adjuntar";
    }

    if (Object.keys(newErrors).length > 0) {
      setFileFormErrors(newErrors);
      const firstInvalidId = newErrors.fileName ? "medical-file-name" : "medical-file-input";
      const el = document.getElementById(firstInvalidId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setUploading(true);
      setFileFormErrors({});

      const formData = new FormData();
      if (!selectedFile) {
        throw new Error("Seleccioná un archivo para adjuntar.");
      }

      if (!selectedFile) {
        throw new Error("Seleccioná un archivo para adjuntar.");
      }
      formData.append("archivo", selectedFile);
      formData.append("nombre", fileName.trim());
      formData.append("mascotaId", String(id));

      await apiFetch("/archivos-medicos", {
        method: "POST",
        body: formData,
      });

      setSelectedFile(null);
      setFileName("");

      const fileInput = document.getElementById(
        "medical-file-input"
      ) as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }

      await cargarArchivosMedicos();
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Estudio adjuntado",
        message: "El archivo médico se adjuntó correctamente a la ficha del paciente.",
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al adjuntar archivo",
        message: err.message || "Error al adjuntar el archivo médico",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = async (file: MedicalFile) => {
    try {
      const blob = await apiFetch<Blob>(`/archivos-medicos/${file.id}/archivo`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, FILE_UPLOAD_LIMITS.BLOB_REVOKE_TIMEOUT_MS);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al visualizar archivo",
        message: err.message || "No se pudo abrir el archivo médico",
      });
    }
  };

  const handleDeleteFile = (fileId: number) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      title: "¿Eliminar archivo médico?",
      message: "¿Estás seguro de que querés eliminar este archivo médico adjunto?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await apiFetch(`/archivos-medicos/${fileId}`, {
            method: "DELETE",
          });

          setMedicalFiles((archivos) =>
            archivos.filter((archivo) => archivo.id !== fileId)
          );
        } catch (err: any) {
          setFeedbackModal({
            isOpen: true,
            type: "error",
            title: "Error al eliminar archivo",
            message: err.message || "No se pudo eliminar el archivo",
          });
        }
      },
    });
  };

  const handleOpenAudit = async (c: Consultation) => {
    if (!c.id) return;
    setAuditModalConsulta(c);
    setLoadingVersions(true);
    try {
      const versions = await consultationService.getConsultationVersions(c.id);
      setVersionsList(versions);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error de Auditoría",
        message: err.message || "Error al cargar el historial de versiones",
      });
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleOpenEdit = (c: Consultation) => {
    setEditingConsulta(c);
  };

  const handleSaveAmendment = async (data: UpdateConsultationDTO) => {
    if (!editingConsulta?.id) return;

    try {
      setSavingAmendment(true);
      const updated = await consultationService.updateConsultation(
        editingConsulta.id,
        data
      );

      setConsultas((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      if (updated.peso && pet) {
        setPet({ ...pet, peso: updated.peso });
      }

      setEditingConsulta(null);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Enmienda Registrada",
        message: `La consulta fue enmendada correctamente (Versión v${updated.version}) con respaldo inmutable en auditoría.`,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al enmendar consulta",
        message: err.message || "Error al registrar la enmienda",
      });
    } finally {
      setSavingAmendment(false);
    }
  };

  const handleOpenAnular = (c: Consultation) => {
    setAnulandoConsulta(c);
  };

  const handleConfirmAnulacion = async (motivo: string) => {
    if (!anulandoConsulta?.id) return;

    try {
      setSavingAnulacion(true);
      await consultationService.anularConsultation(
        anulandoConsulta.id,
        motivo
      );

      setConsultas((prev) => prev.filter((c) => c.id !== anulandoConsulta.id));
      setAnulandoConsulta(null);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Consulta médica anulada",
        message: "La consulta médica fue anulada y archivada. El registro inalterable permanece visible en la auditoría legal con su motivo correspondiente.",
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al anular consulta",
        message: err.message || "Error al anular la consulta médica",
      });
    } finally {
      setSavingAnulacion(false);
    }
  };

  if (loading) {
    return (
      <main className="pet-details-page">
        <LoadingSpinner message="Cargando perfil de la mascota..." />
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="pet-details-page">
        <div className="container py-5">
          <div className="alert alert-danger rounded-2 shadow-sm">
            {error || "No hay datos de la mascota disponibles."}
          </div>
          <BackButton
            to={isProfessional ? "/profesional/turnos" : "/mascotas"}
            text={isProfessional ? "Volver a turnos" : "Volver a mis mascotas"}
            variant="outline"
            className="mt-3"
          />
        </div>
      </main>
    );
  }

  const tutorInfo = pet.usuario || pet.dueno;

  return (
    <main className="pet-details-page">
      <div className="container py-4">
        <div className="mb-3">
          <BackButton
            to={isProfessional ? "/profesional/turnos" : "/mascotas"}
            text={isProfessional ? "Volver a la Agenda" : "Volver a Mis Mascotas"}
          />
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}

        <div className="bg-white rounded-3 border border-light-subtle p-4 mb-4 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="pet-profile-avatar">
                {getSpeciesIcon(pet.especie)}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h1 className="h3 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                    {pet.nombre}
                  </h1>
                  <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1">
                    {pet.especie}
                  </span>
                  {pet.sexo && (
                    <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1">
                      {pet.sexo}
                    </span>
                  )}
                  {pet.peso && (
                    <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1">
                      {pet.peso} kg
                    </span>
                  )}
                </div>

                <p className="text-muted small mb-0">
                  {pet.raza ? pet.raza : "Raza no especificada"}
                  {tutorInfo && (
                    <span>
                      {" "}· Tutor: <strong className="text-dark">{tutorInfo.nombre} {tutorInfo.apellido}</strong>
                      {tutorInfo.telefono && ` (${tutorInfo.telefono})`}
                    </span>
                  )}
                </p>
              </div>
            </div>


            <div className="d-flex gap-2 flex-wrap">
              {isProfessional ? (
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3"
                >
                  <i className="bi bi-clipboard2-pulse"></i> Iniciar Consulta SOAP
                </Link>
              ) : (
                <Link
                  to={`/turnos/nuevo?mascota=${pet.id}`}
                  className="btn btn-primary rounded-2 shadow-sm d-inline-flex align-items-center gap-2 px-3"
                >
                  <i className="bi bi-calendar-check"></i> Solicitar Turno
                </Link>
              )}

              <button
                type="button"
                className="btn btn-outline-success rounded-2 d-inline-flex align-items-center gap-2"
                onClick={handleGenerarCarnet}
                disabled={loadingCarnet}
              >
                <i className="bi bi-qr-code"></i>
                {loadingCarnet ? "Generando..." : "Carnet de vacunación"}
              </button>
            </div>

            {errorCarnet && (
              <div className="alert alert-danger mt-3 mb-0">
                {errorCarnet}
              </div>
            )}

            {carnetToken && (
              <div className="card mt-3 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="h5 fw-bold">Carnet de {pet.nombre}</h2>
                  <p className="text-muted small">
                    Escaneá el código QR para consultar las vacunas registradas.
                  </p>

                  <div className="d-flex justify-content-center my-3">
                    <QRCodeSVG
                      value={`${window.location.origin}/carnet/${carnetToken}`}
                      size={220}
                      level="M"
                      includeMargin
                    />
                  </div>

                  <a
                    href={`${window.location.origin}/carnet/${carnetToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Abrir carnet público
                  </a>

                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      onClick={() => setCarnetToken(null)}
                    >
                      Ocultar QR
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <nav className="pet-tabs-nav d-flex mb-4">
          <button
            type="button"
            className={`pet-tab-btn ${activeTab === "historial" ? "active" : ""}`}
            onClick={() => setActiveTab("historial")}
          >
            Historial Clínico ({consultas.length})
          </button>
          <button
            type="button"
            className={`pet-tab-btn ${activeTab === "archivos" ? "active" : ""}`}
            onClick={() => setActiveTab("archivos")}
          >
            Archivos y Estudios ({medicalFiles.length})
          </button>
          <button
              type="button"
              className={`pet-tab-btn ${activeTab === "sanitaria" ? "active" : ""}`}
              onClick={() => setActiveTab("sanitaria")}
            >
              Libreta Sanitaria ({sanitaryRecords.length})
          </button>
          <button
            type="button"
            className={`pet-tab-btn ${activeTab === "ficha" ? "active" : ""}`}
            onClick={() => setActiveTab("ficha")}
          >
            Ficha Médica
          </button>
        </nav>

        {activeTab === "historial" && (
          <div className="tab-pane-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                  Consultas y Evolución Clínica
                </h2>
                <p className="text-muted small mb-0">
                  Registros médicos inmutables y versionados con validez legal.
                </p>
              </div>
              {isProfessional && (
                <Link
                  to={`/profesional/atencion?mascotaId=${pet.id}`}
                  className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-plus-lg"></i> Nueva Consulta
                </Link>
              )}
            </div>

            {loadingConsultas ? (
              <LoadingSpinner message="Cargando historial..." />
            ) : consultas.length === 0 ? (
              <EmptyState
                icon="bi-clipboard2-pulse"
                title="Sin registros de consulta aún"
                description="No hay atenciones médicas registradas formalmente para este paciente."
                actionText={isProfessional ? "Registrar Primera Consulta" : undefined}
                actionTo={isProfessional ? `/profesional/atencion?mascotaId=${pet.id}` : undefined}
                actionIcon="bi-plus-lg"
              />
            ) : (
              <div className="d-flex flex-column gap-3">
                {consultas.map((c) => (
                  <ConsultationCard
                    key={c.id}
                    consulta={c}
                    isProfessional={isProfessional}
                    onOpenAudit={handleOpenAudit}
                    onOpenEdit={handleOpenEdit}
                    onOpenAnular={handleOpenAnular}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "archivos" && (
          <div className="tab-pane-content">
            {isProfessional && (
              <div className="bg-white rounded-3 border border-light-subtle p-4 mb-4 shadow-sm">
                <h2 className="h6 fw-bold mb-3" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                  Adjuntar Nuevo Estudio o Análisis
                </h2>

                <div className="row g-3 align-items-start">
                  <div className="col-md-5">
                    <label htmlFor="medical-file-name" className="form-label small fw-medium text-muted">
                      Título o Descripción del Documento <span className="text-danger">*</span>
                    </label>
                    <input
                      id="medical-file-name"
                      type="text"
                      className={`form-control rounded-2 ${fileFormErrors.fileName ? "is-invalid" : ""}`}
                      placeholder="Nombre del archivo"
                      value={fileName}
                      onChange={(e) => {
                        setFileName(e.target.value);
                        if (fileFormErrors.fileName) {
                          setFileFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.fileName;
                            return next;
                          });
                        }
                      }}
                    />
                    <FormFieldError error={fileFormErrors.fileName} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="medical-file-input" className="form-label small fw-medium text-muted">
                      Archivo (PDF, JPG, PNG · Máx 5MB) <span className="text-danger">*</span>
                    </label>
                    <input
                      id="medical-file-input"
                      type="file"
                      className={`form-control rounded-2 ${fileFormErrors.file ? "is-invalid" : ""}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    <FormFieldError error={fileFormErrors.file} />
                  </div>
                  <div className="col-md-3 align-self-start" style={{ paddingTop: "28px" }}>
                    <button
                      type="button"
                      className="btn btn-primary rounded-2 w-100 fw-medium"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Subiendo..." : "Adjuntar Documento"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3 border border-light-subtle p-4 shadow-sm">
              <h2 className="h6 fw-bold mb-3" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                Estudios Adjuntos ({medicalFiles.length})
              </h2>

              {loadingFiles ? (
                <LoadingSpinner message="Cargando archivos..." />
              ) : medicalFiles.length === 0 ? (
                <EmptyState
                  icon="bi-folder2-open"
                  title="Sin archivos adjuntos"
                  description="No hay archivos ni análisis complementarios adjuntos."
                />
              ) : (
                <div className="d-flex flex-column gap-2">
                  {medicalFiles.map((file) => (
                    <div key={file.id} className="medical-file-row">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fs-4">
                          {file.tipo === "application/pdf" ? (
                            <i className="bi bi-file-earmark-pdf text-danger"></i>
                          ) : (
                            <i className="bi bi-file-earmark-image text-primary"></i>
                          )}
                        </span>
                        <div>
                          <strong className="d-block" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                            {file.nombre}
                          </strong>
                          <span className="text-muted small">
                            {file.nombreArchivo} · {formatDate(file.fecha)}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewFile(file)}
                        >
                          <i className="bi bi-eye"></i> Ver
                        </button>
                        {isProfessional && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-2 d-inline-flex align-items-center gap-1"
                            onClick={() => handleDeleteFile(file.id)}
                            title="Eliminar archivo"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
         
        {activeTab === "sanitaria" && (
          <div className="tab-pane-content">
            <div className="bg-white rounded-3 border border-light-subtle p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="h5 fw-bold mb-1">
                  Libreta sanitaria de {pet.nombre}
                </h2>
                <p className="text-muted small mb-0">
                  Historial de vacunas y desparasitaciones.
                </p>
              </div>

              {isProfessional && (
                <button
                  type="button"
                  className="btn btn-primary rounded-2 d-inline-flex align-items-center gap-2"
                  onClick={() => setMostrarFormularioSanitario((prev) => !prev)}
                >
                  <i className={`bi ${mostrarFormularioSanitario ? "bi-x-lg" : "bi-plus-lg"}`} />
                  {mostrarFormularioSanitario ? "Cancelar" : "Nuevo registro sanitario"}
                </button>
              )}
              {mostrarFormularioSanitario && isProfessional && (
                <form
                  className="border rounded-3 p-3 p-md-4 mb-4 bg-light"
                  onSubmit={handleCrearRegistroSanitario}
                  noValidate
                >
                  <h3 className="h6 fw-bold mb-3">
                    Registrar vacuna o desparasitación
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="sanitary-tipo" className="form-label">
                        Tipo de registro *
                      </label>
                      <select
                        id="sanitary-tipo"
                        className="form-select"
                        value={sanitaryForm.tipo}
                        onChange={(e) =>
                          setSanitaryForm((prev) => ({
                            ...prev,
                            tipo: e.target.value as "vacuna" | "antiparasitario",
                          }))
                        }
                      >
                        <option value="vacuna">Vacuna</option>
                        <option value="antiparasitario">Desparasitación</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sanitary-nombre" className="form-label">
                        Nombre *
                      </label>
                      <input
                        id="sanitary-nombre"
                        type="text"
                        className={`form-control ${sanitaryFormErrors.nombre ? "is-invalid" : ""}`}
                        placeholder="Ej.: Antirrábica"
                        value={sanitaryForm.nombre}
                        onChange={(e) => {
                          setSanitaryForm((prev) => ({
                            ...prev,
                            nombre: e.target.value,
                          }));
                          setSanitaryFormErrors((prev) => ({
                            ...prev,
                            nombre: "",
                          }));
                        }}
                      />
                      {sanitaryFormErrors.nombre && (
                        <div className="invalid-feedback">
                          {sanitaryFormErrors.nombre}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sanitary-lote" className="form-label">
                        Lote <span className="text-muted">(opcional)</span>
                      </label>
                      <input
                        id="sanitary-lote"
                        type="text"
                        className="form-control"
                        placeholder="Número de lote"
                        value={sanitaryForm.lote}
                        onChange={(e) =>
                          setSanitaryForm((prev) => ({
                            ...prev,
                            lote: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sanitary-lote" className="form-label">
                        Lote <span className="text-muted">(opcional)</span>
                      </label>
                      <input
                        id="sanitary-lote"
                        type="text"
                        className="form-control"
                        placeholder="Número de lote"
                        value={sanitaryForm.lote}
                        onChange={(e) =>
                          setSanitaryForm((prev) => ({
                            ...prev,
                            lote: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="sanitary-fecha" className="form-label">
                        Fecha de aplicación *
                      </label>
                      <input
                        id="sanitary-fecha"
                        type="date"
                        className={`form-control ${sanitaryFormErrors.fechaAplicacion ? "is-invalid" : ""}`}
                        value={sanitaryForm.fechaAplicacion}
                        onChange={(e) => {
                          setSanitaryForm((prev) => ({
                            ...prev,
                            fechaAplicacion: e.target.value,
                          }));
                          setSanitaryFormErrors((prev) => ({
                            ...prev,
                            fechaAplicacion: "",
                          }));
                        }}
                      />
                      {sanitaryFormErrors.fechaAplicacion && (
                        <div className="invalid-feedback">
                          {sanitaryFormErrors.fechaAplicacion}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                    <label htmlFor="sanitary-refuerzo" className="form-label">
                      Próximo refuerzo estimado{" "}
                      <span className="text-muted">(opcional)</span>
                    </label>
                    <input
                      id="sanitary-refuerzo"
                      type="date"
                      className={`form-control ${sanitaryFormErrors.fechaRefuerzoEstimada ? "is-invalid" : ""}`}
                      min={sanitaryForm.fechaAplicacion}
                      value={sanitaryForm.fechaRefuerzoEstimada}
                      onChange={(e) => {
                        setSanitaryForm((prev) => ({
                          ...prev,
                          fechaRefuerzoEstimada: e.target.value,
                        }));
                        setSanitaryFormErrors((prev) => ({
                          ...prev,
                          fechaRefuerzoEstimada: "",
                        }));
                      }}
                    />
                    {sanitaryFormErrors.fechaRefuerzoEstimada && (
                      <div className="invalid-feedback">
                        {sanitaryFormErrors.fechaRefuerzoEstimada}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-2"
                    onClick={() => setMostrarFormularioSanitario(false)}
                    disabled={guardandoRegistroSanitario}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-2"
                    disabled={guardandoRegistroSanitario}
                  >
                    {guardandoRegistroSanitario ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1" />
                        Guardar registro
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
              {loadingSanitaryRecords ? (
                <LoadingSpinner message="Cargando libreta sanitaria..." />
              ) : sanitaryRecordsError ? (
                <div className="alert alert-warning" role="alert">
                  {sanitaryRecordsError}
                </div>
              ) : sanitaryRecords.length === 0 ? (
                <EmptyState
                  icon="bi-shield-plus"
                  title="Sin registros sanitarios"
                  description="Todavía no hay vacunas ni desparasitaciones registradas para esta mascota."
                />
              ) : (
                  <div className="d-flex flex-column gap-3">
                    <section className="border rounded-3 overflow-hidden">
                      <button
                        type="button"
                        className="btn btn-light w-100 d-flex justify-content-between align-items-center p-3 text-start"
                        onClick={() => setVacunasAbiertas(!vacunasAbiertas)}
                        aria-expanded={vacunasAbiertas}
                      >
                        <span>
                          <i className="bi bi-shield-plus me-2" />
                          <strong>Vacunas</strong>
                          <span className="badge bg-secondary ms-2">
                            {vacunas.length}
                          </span>
                        </span>

                        <i
                          className={`bi ${
                            vacunasAbiertas ? "bi-chevron-up" : "bi-chevron-down"
                          }`}
                        />
                      </button>

                      {vacunasAbiertas && (
                        <div className="p-3 d-flex flex-column gap-3">
                          {vacunas.length === 0 ? (
                            <p className="text-muted mb-0">
                              No hay vacunas registradas para esta mascota.
                            </p>
                          ) : (
                            vacunas.map((record) => (
                              <article key={record.id} className="border rounded-3 p-3">
                                <h3 className="h6 fw-bold mb-2">{record.nombre}</h3>

                                <p className="small mb-1">
                                  <strong>Fecha de aplicación:</strong>{" "}
                                  {formatDate(record.fechaAplicacion)}
                                </p>

                                {record.lote && (
                                  <p className="small mb-1">
                                    <strong>Lote:</strong> {record.lote}
                                  </p>
                                )}

                                {record.fechaRefuerzoEstimada && (
                                  <p className="small mb-0">
                                    <strong>Próximo refuerzo estimado:</strong>{" "}
                                    {formatDate(record.fechaRefuerzoEstimada)}
                                  </p>
                                )}
                              </article>
                            ))
                          )}
                        </div>
                      )}
                    </section>

                    <section className="border rounded-3 overflow-hidden">
                      <button
                        type="button"
                        className="btn btn-light w-100 d-flex justify-content-between align-items-center p-3 text-start"
                        onClick={() =>
                          setDesparasitacionesAbiertas(!desparasitacionesAbiertas)
                        }
                        aria-expanded={desparasitacionesAbiertas}
                      >
                        <span>
                          <i className="bi bi-bug me-2" />
                          <strong>Desparasitaciones</strong>
                          <span className="badge bg-secondary ms-2">
                            {desparasitaciones.length}
                          </span>
                        </span>

                        <i
                          className={`bi ${
                            desparasitacionesAbiertas
                              ? "bi-chevron-up"
                              : "bi-chevron-down"
                          }`}
                        />
                      </button>

                      {desparasitacionesAbiertas && (
                        <div className="p-3 d-flex flex-column gap-3">
                          {desparasitaciones.length === 0 ? (
                            <p className="text-muted mb-0">
                              No hay desparasitaciones registradas para esta mascota.
                            </p>
                          ) : (
                            desparasitaciones.map((record) => (
                              <article key={record.id} className="border rounded-3 p-3">
                                <h3 className="h6 fw-bold mb-2">{record.nombre}</h3>

                                <p className="small mb-1">
                                  <strong>Fecha de aplicación:</strong>{" "}
                                  {formatDate(record.fechaAplicacion)}
                                </p>

                                {record.lote && (
                                  <p className="small mb-1">
                                    <strong>Lote:</strong> {record.lote}
                                  </p>
                                )}

                                {record.fechaRefuerzoEstimada && (
                                  <p className="small mb-0">
                                    <strong>Próximo refuerzo estimado:</strong>{" "}
                                    {formatDate(record.fechaRefuerzoEstimada)}
                                  </p>
                                )}
                              </article>
                            ))
                          )}
                        </div>
                      )}
                    </section>
                  </div>

              )}
            </div>
          </div>
        )}

        {activeTab === "ficha" && (
          <div className="tab-pane-content">
            <div className="pet-info-grid">
              <div className="pet-info-cell">
                <div className="pet-info-cell-icon">
                  <i className="bi bi-shield-plus text-primary fs-5"></i>
                </div>
                <div>
                  <div className="pet-info-cell-label">Especie</div>
                  <div className="pet-info-cell-value">{pet.especie}</div>
                </div>
              </div>

              <div className="pet-info-cell">
                <div className="pet-info-cell-icon">
                  <i className="bi bi-tag text-primary fs-5"></i>
                </div>
                <div>
                  <div className="pet-info-cell-label">Raza</div>
                  <div className="pet-info-cell-value">{pet.raza || "No especificada"}</div>
                </div>
              </div>

              <div className="pet-info-cell">
                <div className="pet-info-cell-icon">
                  <i className="bi bi-calendar-event text-primary fs-5"></i>
                </div>
                <div>
                  <div className="pet-info-cell-label">Edad</div>
                  <div className="pet-info-cell-value">
                    {pet.edad !== undefined && pet.edad !== null ? `${pet.edad} años` : "No especificada"}
                  </div>
                </div>
              </div>

              <div className="pet-info-cell">
                <div className="pet-info-cell-icon">
                  <i className="bi bi-gender-ambiguous text-primary fs-5"></i>
                </div>
                <div>
                  <div className="pet-info-cell-label">Sexo</div>
                  <div className="pet-info-cell-value">
                    {pet.sexo ? pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1).toLowerCase() : "No especificado"}
                  </div>
                </div>
              </div>

              <div className="pet-info-cell">
                <div className="pet-info-cell-icon">
                  <i className="bi bi-speedometer2 text-primary fs-5"></i>
                </div>
                <div>
                  <div className="pet-info-cell-label">Peso Registrado</div>
                  <div className="pet-info-cell-value">{pet.peso ? `${pet.peso} kg` : "Sin registro"}</div>
                </div>
              </div>

              {tutorInfo && (
                <div className="pet-info-cell">
                  <div className="pet-info-cell-icon">
                    <i className="bi bi-person-circle text-primary fs-5"></i>
                  </div>
                  <div>
                    <div className="pet-info-cell-label">Tutor Asignado</div>
                    <div className="pet-info-cell-value">
                      {tutorInfo.nombre} {tutorInfo.apellido}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ConsultationAuditModal
          consulta={auditModalConsulta}
          petName={pet.nombre}
          loading={loadingVersions}
          versions={versionsList}
          onClose={() => setAuditModalConsulta(null)}
        />

        <ConsultationAmendmentModal
          consulta={editingConsulta}
          petName={pet.nombre}
          saving={savingAmendment}
          onClose={() => setEditingConsulta(null)}
          onSave={handleSaveAmendment}
        />

        <ConsultationAnnulModal
          consulta={anulandoConsulta}
          petName={pet.nombre}
          saving={savingAnulacion}
          onClose={() => setAnulandoConsulta(null)}
          onConfirm={handleConfirmAnulacion}
        />

        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          confirmText={feedbackModal.confirmText}
          cancelText={feedbackModal.cancelText}
          onConfirm={feedbackModal.onConfirm}
          onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
        />
      </div>
    </main>
  );
}

export default PetDetails;