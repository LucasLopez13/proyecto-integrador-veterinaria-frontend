import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import { apiFetch } from "../services/apiClient";
import { TIMERS } from "../constants";
import type { Pet } from "../types/Pet";
import type { Appointment } from "../types/Appointment";
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

  const [subjetivo, setSubjetivo] = useState("");
  const [peso, setPeso] = useState<string>("");
  const [temperatura, setTemperatura] = useState<string>("");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<string>("");
  const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState<string>("");
  const [objetivo, setObjetivo] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [plan, setPlan] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!mascotaIdParam) {
        setError("No se especificó un paciente para la atención médica.");
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
          } catch {
            // No bloqueante
          }
        }

        // Cargar borrador previo si existe en esta estación
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
        setError(err.message || "Error al cargar los datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mascotaIdParam, turnoIdParam]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token) {
      setError("No hay sesión activa.");
      return;
    }

    if (!pet) {
      setError("No se encontró el paciente.");
      return;
    }

    if (!subjetivo.trim()) {
      setError("Por favor complete el campo Subjetivo (anamnesis / motivo de consulta).");
      return;
    }

    const parsedPeso = parseFloat(peso);
    if (isNaN(parsedPeso) || parsedPeso <= 0) {
      setError("Por favor ingrese un peso válido en kg (mayor a 0).");
      return;
    }

    const parsedTemp = parseFloat(temperatura);
    if (isNaN(parsedTemp) || parsedTemp <= 0) {
      setError("Por favor ingrese una temperatura válida en °C.");
      return;
    }

    if (!analisis.trim()) {
      setError("Por favor complete el campo Análisis (diagnóstico presuntivo o definitivo).");
      return;
    }

    if (!plan.trim()) {
      setError("Por favor complete el campo Plan (indicaciones terapéuticas y tratamiento).");
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
          objetivo: objetivo.trim() || undefined,
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

      // Limpiar borrador local tras registro exitoso
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
      setError(err.message || "Error al registrar la atención médica");
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
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
          <p className="mt-3 text-muted small">Cargando estación de consulta...</p>
        </div>
      </main>
    );
  }

  if (error && !pet) {
    return (
      <main className="medical-attention-page">
        <div className="container py-5">
          <div className="alert alert-danger rounded-2 shadow-sm">{error}</div>
          <Link to="/profesional/turnos" className="btn btn-outline-secondary rounded-2 mt-3">
            Volver a turnos
          </Link>
        </div>
      </main>
    );
  }

  const tutorInfo = pet?.usuario || pet?.dueno;

  return (
    <main className="medical-attention-page">
      <div className="container-fluid px-lg-5">

        {/* Top Header */}
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
                Atención en curso para <strong>{pet?.nombre}</strong> · Registro inmutable
              </p>
            </div>
          </div>

          <Link
            to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
            className="btn btn-outline-secondary rounded-2 btn-sm fw-medium px-3 d-inline-flex align-items-center gap-1"
          >
            <i className="bi bi-arrow-left"></i> Volver
          </Link>
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}
        {successMsg && <div className="alert alert-success rounded-2 shadow-sm mb-4">{successMsg}</div>}

        {/* 2-Column Split: col-lg-4 (Patient Card) & col-lg-8 (Active Form) */}
        <div className="row g-4">

          {/* Left Column: Sticky Patient Card */}
          <div className="col-12 col-lg-4">
            <div className="sticky-patient-sidebar">

              {/* Patient Data Card */}
              <div
                className="bg-white rounded-3 border p-4 shadow-sm mb-3"
                style={{ borderColor: "var(--vet-border-tint, #EDE9FE)" }}
              >
                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-light-subtle">
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                      border: "1px solid var(--vet-border-tint, #EDE9FE)",
                    }}
                  >
                    <i className="bi bi-shield-plus text-primary fs-3"></i>
                  </div>
                  <div>
                    <h2 className="h5 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                      {pet?.nombre}
                    </h2>
                    <span className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle rounded-2 px-2 py-1">
                      {pet?.especie}
                    </span>
                    {pet?.raza && <small className="text-muted ms-2">{pet.raza}</small>}
                  </div>
                </div>

                {/* Patient Attributes */}
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Edad:</span>
                    <strong className="text-dark">{pet?.edad ? `${pet.edad} años` : "No especificada"}</strong>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Sexo:</span>
                    <strong className="text-dark">{pet?.sexo || "No especificado"}</strong>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Peso anterior:</span>
                    <strong className="text-dark">{pet?.peso ? `${pet.peso} kg` : "Sin registro"}</strong>
                  </div>
                </div>

                {/* Weigh-in input right here */}
                <div className="mb-3 p-3 rounded-2" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <label htmlFor="patient-weigh-in" className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1">
                    <i className="bi bi-speedometer2 text-primary"></i> Pesaje en Consulta (kg) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      id="patient-weigh-in"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-control rounded-2"
                      placeholder="0.00"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      required
                    />
                    <span className="input-group-text rounded-2 ms-1">kg</span>
                  </div>
                  <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                    Actualizará el peso registrado en la ficha oficial.
                  </small>
                </div>

                {/* Emergency Contact / Tutor */}
                {tutorInfo && (
                  <div className="p-3 rounded-2" style={{ backgroundColor: "#FAF9FC", border: "1px solid #EDE9FE" }}>
                    <div className="small fw-bold text-uppercase text-muted mb-1" style={{ fontSize: "0.72rem" }}>
                      Tutor y Contacto de Urgencia
                    </div>
                    <strong className="d-block text-dark" style={{ fontSize: "0.95rem" }}>
                      {tutorInfo.nombre} {tutorInfo.apellido}
                    </strong>
                    {tutorInfo.telefono ? (
                      <span className="small text-secondary d-block mt-1">
                        <i className="bi bi-telephone text-primary me-1"></i>
                        <a href={`tel:${tutorInfo.telefono}`} className="text-decoration-none fw-medium text-dark">{tutorInfo.telefono}</a>
                      </span>
                    ) : (
                      <span className="small text-muted d-block mt-1">Sin teléfono asentado</span>
                    )}
                    {tutorInfo.email && (
                      <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                        <i className="bi bi-envelope me-1"></i> {tutorInfo.email}
                      </small>
                    )}
                  </div>
                )}
              </div>

              {/* Alert Card for Expired Vaccinations */}
              <div
                className="rounded-3 p-3 shadow-sm d-flex gap-3 align-items-start"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#991B1B"
                }}
              >
                <i className="bi bi-exclamation-triangle fs-4 text-danger flex-shrink-0"></i>
                <div>
                  <strong className="d-block small fw-bold mb-1">
                    Alerta Sanitaria: Calendario Vencido
                  </strong>
                  <p className="small mb-0" style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>
                    Vacunación Antirrábica y Quíntuple vencidas hace más de 30 días. Se recomienda aplicar refuerzo antes del alta clínica.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Active Consultation Form */}
          <div className="col-12 col-lg-8">
            <form onSubmit={handleSubmit}>

              {/* [S] Subjetivo */}
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
                    className="form-control rounded-2"
                    placeholder="Describa el motivo de la consulta, síntomas observados por el tutor, antecedentes recientes, apetito..."
                    value={subjetivo}
                    onChange={(e) => setSubjetivo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* [O] Objetivo */}
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
                        placeholder="38.5"
                        className="form-control rounded-2"
                        value={temperatura}
                        onChange={(e) => setTemperatura(e.target.value)}
                        required
                      />
                      <span className="input-group-text rounded-2 ms-1">°C</span>
                    </div>
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
                        placeholder="110"
                        className="form-control rounded-2"
                        value={frecuenciaCardiaca}
                        onChange={(e) => setFrecuenciaCardiaca(e.target.value)}
                      />
                      <span className="input-group-text rounded-2 ms-1">lpm</span>
                    </div>
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
                        placeholder="28"
                        className="form-control rounded-2"
                        value={frecuenciaRespiratoria}
                        onChange={(e) => setFrecuenciaRespiratoria(e.target.value)}
                      />
                      <span className="input-group-text rounded-2 ms-1">rpm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="objetivo" className="form-label small fw-semibold text-muted">
                    Examen Físico / Hallazgos Clínicos
                  </label>
                  <textarea
                    id="objetivo"
                    rows={3}
                    className="form-control rounded-2"
                    placeholder="Mucosas, tiempo de llenado capilar, auscultación cardiopulmonar, palpación abdominal, ganglios, hidratación..."
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                  />
                </div>
              </div>

              {/* [A] Análisis */}
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
                    className="form-control rounded-2"
                    placeholder="Diagnóstico presuntivo, diagnósticos diferenciales, evaluación y estado del paciente..."
                    value={analisis}
                    onChange={(e) => setAnalisis(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* [P] Plan & Prescripciones */}
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
                    className="form-control rounded-2"
                    placeholder="Medicamentos (fármaco, dosis, vía, frecuencia y días de tratamiento), pautas de manejo..."
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="observaciones" className="form-label small fw-semibold text-muted">
                    Observaciones y Pautas de Alarma para el Tutor
                  </label>
                  <textarea
                    id="observaciones"
                    rows={2}
                    className="form-control rounded-2"
                    placeholder="Fecha de control sugerida, pautas ante empeoramiento de síntomas..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload Zone for Medical Files */}
              <div className="soap-section-card">
                <h3 className="h6 fw-bold mb-2 text-dark">Estudios Complementarios & Archivos</h3>
                <p className="text-muted small mb-3">Adjuntar análisis de laboratorio, RX o ecografías a esta consulta</p>

                <div className="consultation-upload-zone">
                  <div className="fs-2 mb-2" style={{ color: "var(--vet-primary, #6D28D9)" }}>
                    <i className="bi bi-cloud-arrow-up"></i>
                  </div>
                  <strong className="d-block small text-dark">Arrastrá archivos aquí o hacé clic para explorar</strong>
                  <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                    Formatos admitidos: PDF, JPG, PNG (hasta 5 MB por archivo)
                  </span>
                </div>
              </div>

              {/* Bottom Action Bar */}
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

      </div>
    </main>
  );
}
