import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/NewAppointment.css";
import { useAuth } from "../context/AuthContext";
import type { Pet } from "../types/Pet";

const API_URL = import.meta.env.VITE_API_URL;

const HORARIOS_DISPONIBLES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

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

  const hoyStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/mascotas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: Pet[] = await response.json();
          setPets(data);

          if (mascotaIdParam) {
            setSelectedPetId(mascotaIdParam);
          } else if (data.length > 0) {
            setSelectedPetId(String(data[0].id));
          }
        }
      } catch (err) {
        console.error("Error al cargar mascotas:", err);
      } finally {
        setLoadingPets(false);
      }
    };

    cargarMascotas();
  }, [mascotaIdParam]);

  const mascotaSeleccionada = pets.find(
    (p) => String(p.id) === String(selectedPetId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPetId) {
      setError("Por favor seleccioná una mascota");
      return;
    }

    if (!fecha || !hora) {
      setError("Por favor seleccioná fecha y horario para la consulta");
      return;
    }

    if (fecha < hoyStr) {
      setError("No podés seleccionar una fecha anterior al día de hoy");
      return;
    }

    setLoading(true);
    const fechaHora = `${fecha}T${hora}:00`;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: fechaHora,
          motivo: motivo.trim(),
          usuarioId: user?.id,
          mascotaId: Number(selectedPetId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el turno");
      }

      alert("¡Turno solicitado correctamente!");
      navigate("/mascotas");
    } catch (err: any) {
      console.error("Error al crear turno:", err);
      setError(err.message || "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="new-appointment-page">
      <div className="new-appointment-card">
        <div className="new-appointment-header">
          <div className="new-appointment-icon">📅</div>

          <div>
            <h1>Solicitar turno</h1>
            <p>Completá los datos para solicitar una consulta veterinaria</p>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="appointment-pet-info">
          <span className="appointment-pet-info-icon">🐾</span>

          <div style={{ flexGrow: 1 }}>
            <span>Mascota seleccionada</span>
            {loadingPets ? (
              <small className="d-block text-muted">Cargando...</small>
            ) : mascotaIdParam && mascotaSeleccionada ? (
              <strong>Turno para {mascotaSeleccionada.nombre} ({mascotaSeleccionada.especie})</strong>
            ) : pets.length > 0 ? (
              <select
                className="form-select form-select-sm mt-1"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.especie})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-danger small">
                No tenés mascotas registradas. <Link to="/mascotas/nueva">Registrá una aquí</Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="appointment-form-grid">
            <div className="appointment-field">
              <label htmlFor="date">📅 Fecha</label>
              <input
                type="date"
                id="date"
                className="form-control"
                min={hoyStr}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                required
              />
            </div>

            <div className="appointment-field">
              <label htmlFor="time">🕐 Hora (8:00 a 20:00)</label>
              <select
                id="time"
                className="form-select"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              >
                <option value="">Seleccionar horario</option>
                {HORARIOS_DISPONIBLES.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="appointment-field">
            <label htmlFor="reason">📝 Motivo de la consulta</label>
            <textarea
              id="reason"
              className="form-control"
              placeholder="Contanos brevemente el motivo de la consulta..."
              maxLength={150}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
            <span className="appointment-char-counter">
              {motivo.length} / 150 caracteres
            </span>
          </div>

          <div className="new-appointment-actions">
            <Link to="/mascotas" className="btn btn-outline-secondary">
              Cancelar
            </Link>

            <button type="submit" className="btn btn-primary" disabled={loading || pets.length === 0}>
              {loading ? "Solicitando..." : "Solicitar turno"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default NewAppointment;