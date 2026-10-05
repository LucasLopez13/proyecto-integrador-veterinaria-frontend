import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import type { Pet } from "../types/Pet";
import type { Appointment } from "../types/Appointment";
import "../styles/MedicalAttention.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicalAttention() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

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

        const petRes = await fetch(`${API_URL}/mascotas/${mascotaIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!petRes.ok) {
          throw new Error("No se pudo cargar la información del paciente");
        }

        const petData: Pet = await petRes.json();
        setPet(petData);
        if (petData.peso) {
          setPeso(String(petData.peso));
        }

        if (turnoIdParam) {
          const appRes = await fetch(`${API_URL}/turnos/${turnoIdParam}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (appRes.ok) {
            const appData: Appointment = await appRes.json();
            setAppointment(appData);
            if (appData.motivo && !subjetivo) {
              setSubjetivo(`Motivo de consulta declarado: ${appData.motivo}\n\n`);
            }
          }
        }
      } catch (err: any) {
        console.error("Error al inicializar consulta SOAP:", err);
        setError(err.message || "Error al cargar los datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mascotaIdParam, turnoIdParam, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      setSuccessMsg("¡Atención médica registrada correctamente! El peso y el turno han sido actualizados.");

      setTimeout(() => {
        if (turnoIdParam) {
          navigate("/profesional/turnos");
        } else {
          navigate(`/profesional/mascotas/${pet.id}`);
        }
      }, 1500);
    } catch (err: any) {
      console.error("Error al guardar consulta:", err);
      setError(err.message || "Error al registrar la atención médica");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="medical-attention-page">
        <div className="medical-attention-container py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Cargando ficha del paciente...</p>
        </div>
      </main>
    );
  }

  if (error && !pet) {
    return (
      <main className="medical-attention-page">
        <div className="medical-attention-container py-5">
          <div className="alert alert-danger">{error}</div>
          <Link to="/profesional/turnos" className="btn btn-outline-secondary mt-3">
            Volver a turnos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="medical-attention-page">
      <div className="medical-attention-container">
        <div className="medical-attention-header">
          <div className="medical-attention-header-title">
            <div className="medical-attention-icon">🩺</div>
            <div>
              <h1>Atención Médica (SOAP)</h1>
              <p>Registro clínico estructurado de evolución de paciente</p>
            </div>
          </div>
          <Link
            to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
            className="btn btn-outline-secondary"
          >
            ← Volver
          </Link>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}
        {successMsg && <div className="alert alert-success mb-4">{successMsg}</div>}

        {pet && (
          <div className="patient-summary-card">
            <div className="patient-summary-grid">
              <div className="patient-summary-item">
                <div className="patient-summary-icon">🐾</div>
                <div>
                  <span className="patient-summary-label">Paciente</span>
                  <div className="patient-summary-value">{pet.nombre}</div>
                </div>
              </div>

              <div className="patient-summary-item">
                <div className="patient-summary-icon">🏷️</div>
                <div>
                  <span className="patient-summary-label">Especie / Raza</span>
                  <div className="patient-summary-value">
                    {pet.especie} · {pet.raza || "No especificada"}
                  </div>
                </div>
              </div>

              <div className="patient-summary-item">
                <div className="patient-summary-icon">🎂</div>
                <div>
                  <span className="patient-summary-label">Edad / Sexo</span>
                  <div className="patient-summary-value">
                    {pet.edad ? `${pet.edad} años` : "Edad N/E"} · {pet.sexo || "N/E"}
                  </div>
                </div>
              </div>

              <div className="patient-summary-item">
                <div className="patient-summary-icon">⚖️</div>
                <div>
                  <span className="patient-summary-label">Peso Registrado</span>
                  <div className="patient-summary-value">
                    {pet.peso ? `${pet.peso} kg` : "Sin registro previo"}
                  </div>
                </div>
              </div>

              {pet.usuario && (
                <div className="patient-summary-item">
                  <div className="patient-summary-icon">👤</div>
                  <div>
                    <span className="patient-summary-label">Tutor</span>
                    <div className="patient-summary-value">
                      {pet.usuario.nombre} {pet.usuario.apellido}
                      {pet.usuario.telefono ? ` (${pet.usuario.telefono})` : ""}
                    </div>
                  </div>
                </div>
              )}

              {appointment && (
                <div className="patient-summary-item">
                  <div className="patient-summary-icon">📅</div>
                  <div>
                    <span className="patient-summary-label">Turno Asociado</span>
                    <div className="patient-summary-value">
                      {new Date(appointment.fecha).toLocaleDateString("es-AR")} {new Date(appointment.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="soap-form">
          <section className="soap-card">
            <div className="soap-card-header">
              <div className="soap-letter-badge badge-s">S</div>
              <div className="soap-card-title">
                <h2>Subjetivo</h2>
                <p>Anamnesis, motivo de consulta, síntomas referidos por el tutor y evolución</p>
              </div>
            </div>

            <div className="soap-field">
              <label htmlFor="subjetivo">
                Anamnesis clínica / Motivo de consulta <span className="text-danger">*</span>
              </label>
              <textarea
                id="subjetivo"
                className="form-control"
                placeholder="Describa el motivo de la consulta, síntomas observados por el tutor, tiempo de evolución, antecedentes recientes, apetito, ingesta de agua, deposiciones, etc."
                value={subjetivo}
                onChange={(e) => setSubjetivo(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="soap-card">
            <div className="soap-card-header">
              <div className="soap-letter-badge badge-o">O</div>
              <div className="soap-card-title">
                <h2>Objetivo</h2>
                <p>Signos vitales, constantes fisiológicas y hallazgos del examen físico</p>
              </div>
            </div>

            <div className="vitals-grid">
              <div className="vital-input-group">
                <label htmlFor="peso">
                  Peso Actual <span className="text-danger">*</span>
                </label>
                <div className="vital-input-wrapper">
                  <input
                    id="peso"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    required
                  />
                  <span className="vital-unit">kg</span>
                </div>
                <small className="vital-helper">✓ Actualiza ficha base</small>
              </div>

              <div className="vital-input-group">
                <label htmlFor="temperatura">
                  Temperatura <span className="text-danger">*</span>
                </label>
                <div className="vital-input-wrapper">
                  <input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    placeholder="38.5"
                    value={temperatura}
                    onChange={(e) => setTemperatura(e.target.value)}
                    required
                  />
                  <span className="vital-unit">°C</span>
                </div>
              </div>

              <div className="vital-input-group">
                <label htmlFor="frecuenciaCardiaca">Frec. Cardíaca</label>
                <div className="vital-input-wrapper">
                  <input
                    id="frecuenciaCardiaca"
                    type="number"
                    min="20"
                    max="300"
                    placeholder="100"
                    value={frecuenciaCardiaca}
                    onChange={(e) => setFrecuenciaCardiaca(e.target.value)}
                  />
                  <span className="vital-unit">lpm</span>
                </div>
              </div>

              <div className="vital-input-group">
                <label htmlFor="frecuenciaRespiratoria">Frec. Respiratoria</label>
                <div className="vital-input-wrapper">
                  <input
                    id="frecuenciaRespiratoria"
                    type="number"
                    min="5"
                    max="150"
                    placeholder="25"
                    value={frecuenciaRespiratoria}
                    onChange={(e) => setFrecuenciaRespiratoria(e.target.value)}
                  />
                  <span className="vital-unit">rpm</span>
                </div>
              </div>
            </div>

            <div className="soap-field">
              <label htmlFor="objetivo">Hallazgos del Examen Físico</label>
              <textarea
                id="objetivo"
                className="form-control"
                placeholder="Inspección general, mucosas, tiempo de llenado capilar, palpación abdominal, auscultación cardiopulmonar, ganglios linfáticos, estado de hidratación, etc."
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
              />
            </div>
          </section>

          <section className="soap-card">
            <div className="soap-card-header">
              <div className="soap-letter-badge badge-a">A</div>
              <div className="soap-card-title">
                <h2>Análisis</h2>
                <p>Diagnóstico presuntivo, diagnóstico definitivo y juicio clínico</p>
              </div>
            </div>

            <div className="soap-field">
              <label htmlFor="analisis">
                Diagnóstico / Juicio Clínico <span className="text-danger">*</span>
              </label>
              <textarea
                id="analisis"
                className="form-control"
                placeholder="Diagnóstico presuntivo o definitivo, diagnósticos diferenciales, severidad y evaluación integral del cuadro clínico."
                value={analisis}
                onChange={(e) => setAnalisis(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="soap-card">
            <div className="soap-card-header">
              <div className="soap-letter-badge badge-p">P</div>
              <div className="soap-card-title">
                <h2>Plan</h2>
                <p>Tratamiento, plan terapéutico farmacológico, estudios y seguimiento</p>
              </div>
            </div>

            <div className="soap-field">
              <label htmlFor="plan">
                Plan Terapéutico y Tratamiento <span className="text-danger">*</span>
              </label>
              <textarea
                id="plan"
                className="form-control"
                placeholder="Indicaciones farmacológicas (medicamentos, dosis, vía, frecuencia y duración), procedimientos en consulta, estudios complementarios solicitados (análisis de sangre, ecografía, RX), pautas de manejo o nutrición."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                required
              />
            </div>

            <div className="soap-field">
              <label htmlFor="observaciones">Observaciones / Indicaciones al Tutor</label>
              <textarea
                id="observaciones"
                className="form-control"
                placeholder="Signos de alarma que requieran consulta de urgencia, fecha estimada de control o seguimiento, recomendaciones de cuidado en el hogar."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </section>

          <div className="soap-actions-bar">
            <Link
              to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
              className="btn btn-outline-secondary"
            >
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Guardando Atención...
                </>
              ) : (
                <>💾 Guardar Atención Médica (SOAP)</>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
