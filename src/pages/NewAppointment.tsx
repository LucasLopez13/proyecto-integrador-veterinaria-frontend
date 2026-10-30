import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/NewAppointment.css";
import { useAuth } from "../context/AuthContext";
import type { Pet } from "../types/Pet";
import { apiFetch } from "../services/apiClient";
import { BUSINESS_HOURS_SLOTS } from "../constants";
import { ErrorModal } from "../components/common/ErrorModal";
import { BackButton } from "../components/common/BackButton";
import { FormFieldError } from "../components/common/FormFieldError";

function NewAppointment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mascotaIdParam = searchParams.get("mascota");
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(mascotaIdParam || "");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const hoyStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const data = await apiFetch<Pet[]>("/mascotas");
        setPets(data);

        if (mascotaIdParam) {
          setSelectedPetId(mascotaIdParam);
        } else if (data.length > 0) {
          setSelectedPetId(String(data[0].id));
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar mascotas");
      } finally {
        setLoadingPets(false);
      }
    };

    cargarMascotas();
  }, [mascotaIdParam]);

  const mascotaSeleccionada = pets.find(
    (p) => String(p.id) === String(selectedPetId)
  );

  const isSlotInPast = (slotStr: string) => {
    if (fecha !== hoyStr) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [slotH, slotM] = slotStr.split(":").map(Number);
    return slotH < currentHour || (slotH === currentHour && slotM <= currentMinute);
  };

  useEffect(() => {
    if (hora && isSlotInPast(hora)) {
      setHora("");
    }
  }, [fecha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newErrors: Record<string, string> = {};

    if (!selectedPetId) {
      newErrors.selectedPetId = "Seleccioná la mascota para la consulta";
    }

    if (!fecha) {
      newErrors.fecha = "Completá este campo con la fecha de atención";
    } else if (fecha < hoyStr) {
      newErrors.fecha = "No podés seleccionar una fecha anterior al día de hoy";
    }

    if (!hora) {
      newErrors.hora = "Seleccioná el horario de atención";
    } else if (fecha === hoyStr && isSlotInPast(hora)) {
      newErrors.hora = "El horario ya transcurrió. Elegí un horario posterior";
    }

    if (!motivo.trim()) {
      newErrors.motivo = "Completá este campo con el motivo de la consulta";
    } else if (motivo.trim().length < 3) {
        newErrors.motivo = "El motivo debe tener al menos 3 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const fieldOrder = [
        { key: "selectedPetId", id: "pet-select" },
        { key: "fecha", id: "date" },
        { key: "hora", id: "time" },
        { key: "motivo", id: "reason" },
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

    setLoading(true);
    const fechaHora = `${fecha}T${hora}:00`;

    try {
      await apiFetch("/turnos", {
        method: "POST",
        body: JSON.stringify({
          fecha: fechaHora,
          motivo: motivo.trim(),
          usuarioId: user?.id,
          mascotaId: Number(selectedPetId),
        }),
      });

      navigate("/mis-turnos");
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor para agendar el turno");
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = BUSINESS_HOURS_SLOTS.filter((h) => !isSlotInPast(h));

  return (
    <main className="new-appointment-page">
      <div className="new-appointment-card">
        <div className="mb-3">
          <BackButton
            to={mascotaIdParam ? `/mascotas/${mascotaIdParam}` : "/mis-turnos"}
            text={mascotaIdParam ? "Volver a la Mascota" : "Volver a Mis Turnos"}
          />
        </div>

        <div className="new-appointment-header">
          <div className="new-appointment-icon">
            <i className="bi bi-calendar-check text-primary fs-3"></i>
          </div>

          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
              Solicitar Turno
            </h1>
            <p className="text-muted small mb-0">
              Completá los datos para solicitar una consulta veterinaria
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-3">{error}</div>}

        <div className="appointment-pet-info">
          <span className="appointment-pet-info-icon">
            <i className="bi bi-shield-plus text-primary fs-5"></i>
          </span>

          <div style={{ flexGrow: 1 }}>
            <span className="small text-muted fw-semibold">Mascota seleccionada</span>
            {loadingPets ? (
              <small className="d-block text-muted">Cargando mascotas...</small>
            ) : mascotaIdParam && mascotaSeleccionada ? (
              <strong className="d-block" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                {mascotaSeleccionada.nombre} ({mascotaSeleccionada.especie})
              </strong>
            ) : pets.length > 0 ? (
              <>
                <select
                  id="pet-select"
                  className={`form-select form-select-sm rounded-2 mt-1 ${fieldErrors.selectedPetId ? "is-invalid" : ""}`}
                  value={selectedPetId}
                  onChange={(e) => {
                    setSelectedPetId(e.target.value);
                    clearFieldError("selectedPetId");
                  }}
                >
                  <option value="">Seleccionar mascota</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.especie})
                    </option>
                  ))}
                </select>
                <FormFieldError error={fieldErrors.selectedPetId} />
              </>
            ) : (
              <div className="text-danger small mt-1">
                No tenés mascotas registradas.{" "}
                <Link to="/mascotas/nueva" className="fw-semibold text-decoration-none">
                  Registrá una aquí
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="appointment-form-grid">
            <div className="appointment-field">
              <label htmlFor="date">Fecha de Atención</label>
              <input
                type="date"
                id="date"
                className={`form-control rounded-2 ${fieldErrors.fecha ? "is-invalid" : ""}`}
                min={hoyStr}
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  clearFieldError("fecha");
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
              <FormFieldError error={fieldErrors.fecha} />
            </div>

            <div className="appointment-field">
              <label htmlFor="time">Horario Disponible (8:00 a 20:00)</label>
              <select
                id="time"
                className={`form-select rounded-2 ${fieldErrors.hora ? "is-invalid" : ""}`}
                value={hora}
                onChange={(e) => {
                  setHora(e.target.value);
                  clearFieldError("hora");
                }}
              >
                <option value="">Seleccionar horario</option>
                {availableSlots.length === 0 ? (
                  <option disabled value="">No hay más horarios disponibles hoy</option>
                ) : (
                  availableSlots.map((h) => (
                    <option key={h} value={h}>
                      {h} hs
                    </option>
                  ))
                )}
              </select>
              <FormFieldError error={fieldErrors.hora} />
            </div>
          </div>

          <div className="appointment-field">
            <label htmlFor="reason">Motivo de la Consulta</label>
            <textarea
              id="reason"
              className={`form-control rounded-2 ${fieldErrors.motivo ? "is-invalid" : ""}`}
              placeholder="Motivo de la consulta"
              maxLength={150}
              rows={3}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                clearFieldError("motivo");
              }}
            />
            <FormFieldError error={fieldErrors.motivo} />
            <span className="appointment-char-counter">
              {motivo.length} / 150 caracteres
            </span>
          </div>

          <div className="new-appointment-actions">
            <Link to="/mascotas" className="btn btn-outline-secondary rounded-2 px-3 fw-medium">
              Cancelar
            </Link>

            <button
              type="submit"
              className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium"
              disabled={loading || pets.length === 0}
            >
              {loading ? "Solicitando..." : "Solicitar Turno"}
            </button>
          </div>
        </form>
      </div>

      <ErrorModal
        error={error}
        title="Error al Solicitar Turno"
        onClose={() => setError(null)}
      />
    </main>
  );
}

export default NewAppointment;