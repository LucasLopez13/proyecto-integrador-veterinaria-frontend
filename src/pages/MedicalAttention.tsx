import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import { apiFetch } from "../services/apiClient";
import { TIMERS } from "../constants";
import type { Pet } from "../types/Pet";
import type { Appointment } from "../types/Appointment";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { ErrorModal } from "../components/common/ErrorModal";
import { BackButton } from "../components/common/BackButton";
import { FormFieldError } from "../components/common/FormFieldError";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { FileUploadZone } from "../components/common/FileUploadZone";
import { ConsultationPatientSidebar } from "../components/consultations/ConsultationPatientSidebar";
import "../styles/MedicalAttention.css";

export default function MedicalAttention() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const mascotaIdParam = searchParams.get("mascotaId") || searchParams.get("mascota");
  const turnoIdParam = searchParams.get("turnoId") || searchParams.get("turno");

  const [pet, setPet] = useState<Pet | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [subjetivo, setSubjetivo] = useState("");
  const [peso, setPeso] = useState<string>("");
  const [temperatura, setTemperatura] = useState<string>("");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<string>("");
  const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState<string>("");
  const [objetivo, setObjetivo] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [plan, setPlan] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleError = (msg: string) => {
    setError(msg);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!mascotaIdParam) {
        handleError("No se especificó un paciente para la atención médica.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const petData = await apiFetch<Pet>(`/mascotas/${mascotaIdParam}`);
        setPet(petData);
        if (petData.peso) {
          setPeso(String(petData.peso));
        }

        if (turnoIdParam) {
          try {
            const appData = await apiFetch<Appointment>(`/turnos/${turnoIdParam}`);
            setAppointment(appData);
            if (appData.motivo && !subjetivo) {
              setSubjetivo(`Motivo de consulta declarado: ${appData.motivo}\n\n`);
            }
          } catch {}
        }

        const savedDraftStr = localStorage.getItem(`soap_draft_${mascotaIdParam}`);
        if (savedDraftStr) {
          try {
            const savedDraft = JSON.parse(savedDraftStr);
            if (savedDraft.subjetivo) setSubjetivo(savedDraft.subjetivo);
            if (savedDraft.objetivo) setObjetivo(savedDraft.objetivo);
            if (savedDraft.peso) setPeso(savedDraft.peso);
            if (savedDraft.temperatura) setTemperatura(savedDraft.temperatura);
            if (savedDraft.frecuenciaCardiaca) setFrecuenciaCardiaca(savedDraft.frecuenciaCardiaca);
            if (savedDraft.frecuenciaRespiratoria) setFrecuenciaRespiratoria(savedDraft.frecuenciaRespiratoria);
            if (savedDraft.analisis) setAnalisis(savedDraft.analisis);
            if (savedDraft.plan) setPlan(savedDraft.plan);
            if (savedDraft.observaciones) setObservaciones(savedDraft.observaciones);
          } catch {}
        }
      } catch (err: any) {
        handleError(err.message || "Error al cargar los datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mascotaIdParam, turnoIdParam]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token) {
      handleError("No hay sesión activa.");
      return;
    }

    if (!pet) {
      handleError("No se encontró el paciente.");
      return;
    }

    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    const parsedPeso = parseFloat(peso);
    if (!peso.trim()) {
      newErrors.peso = "Completá este campo con el peso en consulta";
    } else if (isNaN(parsedPeso) || parsedPeso <= 0) {
      newErrors.peso = "Ingresá un peso válido mayor a 0 kg";
    }

    if (!subjetivo.trim()) {
      newErrors.subjetivo = "Completá este campo con la anamnesis o motivo de consulta";
    }

    const parsedTemp = parseFloat(temperatura);
    if (!temperatura.trim()) {
      newErrors.temperatura = "Completá este campo con la temperatura en °C";
    } else if (isNaN(parsedTemp) || parsedTemp < 30 || parsedTemp > 45) {
      newErrors.temperatura = "Ingresá una temperatura válida (entre 30 y 45 °C)";
    }

    if (frecuenciaCardiaca.trim()) {
      const fcNum = parseInt(frecuenciaCardiaca, 10);
      if (isNaN(fcNum) || fcNum < 20 || fcNum > 300) {
        newErrors.frecuenciaCardiaca = "La frecuencia cardíaca debe estar entre 20 y 300 lpm";
      }
    }

    if (frecuenciaRespiratoria.trim()) {
      const frNum = parseInt(frecuenciaRespiratoria, 10);
      if (isNaN(frNum) || frNum < 5 || frNum > 150) {
        newErrors.frecuenciaRespiratoria = "La frecuencia respiratoria debe estar entre 5 y 150 rpm";
      }
    }

    if (!objetivo.trim()) {
      newErrors.objetivo = "Completá este campo con el examen físico y hallazgos";
    }

    if (!analisis.trim()) {
      newErrors.analisis = "Completá este campo con el diagnóstico o juicio clínico";
    }

    if (!plan.trim()) {
      newErrors.plan = "Completá este campo con el plan terapéutico o indicaciones";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const fieldOrder = [
        { key: "peso", id: "patient-weigh-in" },
        { key: "subjetivo", id: "subjetivo" },
        { key: "temperatura", id: "temperatura" },
        { key: "frecuenciaCardiaca", id: "fc" },
        { key: "frecuenciaRespiratoria", id: "fr" },
        { key: "objetivo", id: "objetivo" },
        { key: "analisis", id: "analisis" },
        { key: "plan", id: "plan" },
      ];
      const firstInvalid = fieldOrder.find((f) => newErrors[f.key]);
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid.id);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await consultationService.createConsultation(
        {
          mascotaId: pet.id,
          turnoId: turnoIdParam ? parseInt(turnoIdParam, 10) : null,
          subjetivo: subjetivo.trim(),
          objetivo: objetivo.trim(),
          peso: parsedPeso,
          temperatura: parsedTemp,
          frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca, 10) : null,
          frecuenciaRespiratoria: frecuenciaRespiratoria ? parseInt(frecuenciaRespiratoria, 10) : null,
          analisis: analisis.trim(),
          plan: plan.trim(),
          observaciones: observaciones.trim() || null,
        },
        token
      );

      for (const file of attachedFiles) {
        try {
          const formData = new FormData();
          formData.append("archivo", file);
          formData.append("nombre", file.name);
          formData.append("mascotaId", String(pet.id));

          await apiFetch("/archivos-medicos", {
            method: "POST",
            body: formData,
          });
        } catch {}
      }

      if (mascotaIdParam) {
        localStorage.removeItem(`soap_draft_${mascotaIdParam}`);
      }

      setSuccessMsg("¡Consulta finalizada y registrada correctamente! Registro inmutable y peso actualizado.");

      setTimeout(() => {
        if (turnoIdParam) {
          navigate("/profesional/turnos");
        } else {
          navigate(`/profesional/mascotas/${pet.id}`);
        }
      }, TIMERS.REDIRECT_DELAY_MS);
    } catch (err: any) {
      handleError(err.message || "Error al registrar la atención médica");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    if (!mascotaIdParam) return;
    const draft = {
      subjetivo,
      objetivo,
      peso,
      temperatura,
      frecuenciaCardiaca,
      frecuenciaRespiratoria,
      analisis,
      plan,
      observaciones,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`soap_draft_${mascotaIdParam}`, JSON.stringify(draft));
    setSuccessMsg("Borrador guardado localmente en esta estación de trabajo.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (loading) {
    return (
      <main className="medical-attention-page">
        <LoadingSpinner message="Cargando estación de consulta..." />
      </main>
    );
  }

  if (error && !pet) {
    return (
      <main className="medical-attention-page">
        <div className="container py-5">
          <div className="alert alert-danger rounded-2 shadow-sm">{error}</div>
          <BackButton
            to="/profesional/turnos"
            text="Volver a turnos"
            variant="outline"
            className="mt-3"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="medical-attention-page">
      <div className="container-fluid px-lg-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                color: "var(--vet-primary, #6D28D9)",
                border: "1px solid var(--vet-border-tint, #EDE9FE)",
                fontSize: "1.4rem"
              }}
            >
              <i className="bi bi-clipboard2-pulse"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                Estación de Consulta Clínica (SOAP)
              </h1>
              <p className="text-muted small mb-0">
                Atención en curso para <strong>{pet?.nombre}</strong>
                {appointment && ` · Turno #${appointment.id}`} · Registro inmutable
              </p>
            </div>
          </div>

          <BackButton
            to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
            text="Volver"
            variant="outline"
          />
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}
        {successMsg && <div className="alert alert-success rounded-2 shadow-sm mb-4">{successMsg}</div>}

        <div className="row g-4">
          <ConsultationPatientSidebar
            pet={pet}
            appointment={appointment}
            peso={peso}
            onPesoChange={setPeso}
            onClearPesoError={() => clearFieldError("peso")}
            pesoError={fieldErrors.peso}
          />

          <div className="col-12 col-lg-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-s">S</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Subjetivo (Anamnesis)</h2>
                    <small className="text-muted">Motivo de consulta, síntomas declarados y tiempo de evolución</small>
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor="subjetivo" className="form-label small fw-semibold text-muted">
                    Anamnesis clínica / Motivo <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="subjetivo"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.subjetivo ? "is-invalid" : ""}`}
                    placeholder="Subjetivo (Anamnesis y motivo de consulta)"
                    value={subjetivo}
                    onChange={(e) => {
                      setSubjetivo(e.target.value);
                      clearFieldError("subjetivo");
                    }}
                  />
                  <FormFieldError error={fieldErrors.subjetivo} />
                </div>
              </div>

              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-o">O</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Objetivo (Constantes y Examen Físico)</h2>
                    <small className="text-muted">Parámetros fisiológicos medidos y hallazgos a la inspección</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-4">
                    <label htmlFor="temperatura" className="form-label small fw-semibold text-muted">
                      Temperatura (°C) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="temperatura"
                        type="number"
                        step="0.1"
                        min="30"
                        max="45"
                        placeholder="Temperatura en °C"
                        className={`form-control rounded-2 ${fieldErrors.temperatura ? "is-invalid" : ""}`}
                        value={temperatura}
                        onChange={(e) => {
                          setTemperatura(e.target.value);
                          clearFieldError("temperatura");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">°C</span>
                    </div>
                    <FormFieldError error={fieldErrors.temperatura} />
                  </div>

                  <div className="col-sm-4">
                    <label htmlFor="fc" className="form-label small fw-semibold text-muted">
                      Frec. Cardíaca (lpm)
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="fc"
                        type="number"
                        min="20"
                        max="300"
                        placeholder="Frecuencia cardíaca (lpm)"
                        className={`form-control rounded-2 ${fieldErrors.frecuenciaCardiaca ? "is-invalid" : ""}`}
                        value={frecuenciaCardiaca}
                        onChange={(e) => {
                          setFrecuenciaCardiaca(e.target.value);
                          clearFieldError("frecuenciaCardiaca");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">lpm</span>
                    </div>
                    <FormFieldError error={fieldErrors.frecuenciaCardiaca} />
                  </div>

                  <div className="col-sm-4">
                    <label htmlFor="fr" className="form-label small fw-semibold text-muted">
                      Frec. Respiratoria (rpm)
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="fr"
                        type="number"
                        min="5"
                        max="150"
                        placeholder="Frecuencia respiratoria (rpm)"
                        className={`form-control rounded-2 ${fieldErrors.frecuenciaRespiratoria ? "is-invalid" : ""}`}
                        value={frecuenciaRespiratoria}
                        onChange={(e) => {
                          setFrecuenciaRespiratoria(e.target.value);
                          clearFieldError("frecuenciaRespiratoria");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">rpm</span>
                    </div>
                    <FormFieldError error={fieldErrors.frecuenciaRespiratoria} />
                  </div>
                </div>

                <div>
                  <label htmlFor="objetivo" className="form-label small fw-semibold text-muted">
                    Examen Físico / Hallazgos Clínicos <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="objetivo"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.objetivo ? "is-invalid" : ""}`}
                    placeholder="Objetivo (Examen físico y hallazgos)"
                    value={objetivo}
                    onChange={(e) => {
                      setObjetivo(e.target.value);
                      clearFieldError("objetivo");
                    }}
                  />
                  <FormFieldError error={fieldErrors.objetivo} />
                </div>
              </div>

              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-a">A</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Análisis (Diagnóstico)</h2>
                    <small className="text-muted">Diagnóstico presuntivo o definitivo y juicio profesional</small>
                  </div>
                </div>

                <div>
                  <label htmlFor="analisis" className="form-label small fw-semibold text-muted">
                    Diagnóstico Clínico <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="analisis"
                    rows={2}
                    className={`form-control rounded-2 ${fieldErrors.analisis ? "is-invalid" : ""}`}
                    placeholder="Análisis (Diagnóstico clínico)"
                    value={analisis}
                    onChange={(e) => {
                      setAnalisis(e.target.value);
                      clearFieldError("analisis");
                    }}
                  />
                  <FormFieldError error={fieldErrors.analisis} />
                </div>
              </div>

              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-p">P</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Plan (Tratamiento y Prescripción)</h2>
                    <small className="text-muted">Indicaciones farmacológicas, posología, estudios solicitados y recomendaciones</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="plan" className="form-label small fw-semibold text-muted">
                    Tratamiento y Medicación Indicada <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="plan"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.plan ? "is-invalid" : ""}`}
                    placeholder="Plan (Tratamiento y prescripción)"
                    value={plan}
                    onChange={(e) => {
                      setPlan(e.target.value);
                      clearFieldError("plan");
                    }}
                  />
                  <FormFieldError error={fieldErrors.plan} />
                </div>

                <div>
                  <label htmlFor="observaciones" className="form-label small fw-semibold text-muted">
                    Observaciones y Pautas de Alarma para el Tutor
                  </label>
                  <textarea
                    id="observaciones"
                    rows={2}
                    className="form-control rounded-2"
                    placeholder="Observaciones y pautas de control"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
              </div>

              <div className="soap-section-card">
                <h3 className="h6 fw-bold mb-2 text-dark">Estudios Complementarios & Archivos</h3>
                <p className="text-muted small mb-3">Adjuntar análisis de laboratorio, RX o ecografías a esta consulta</p>
                <FileUploadZone
                  files={attachedFiles}
                  onFilesAdded={(newFiles) => setAttachedFiles((prev) => [...prev, ...newFiles])}
                  onRemoveFile={(index) => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                  onError={handleError}
                />
              </div>

              <div className="soap-actions-bar">
                <Link
                  to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
                  className="btn btn-outline-secondary rounded-2 px-3 fw-medium"
                >
                  Cancelar
                </Link>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-outline-primary rounded-2 px-3 fw-medium"
                >
                  Guardar Borrador
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium"
                  style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Finalizando...
                    </>
                  ) : (
                    "Finalizar Consulta"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

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

        <ErrorModal
          error={error}
          title="Error en Consulta SOAP"
          onClose={() => setError(null)}
        />
      </div>
    </main>
  );
}
