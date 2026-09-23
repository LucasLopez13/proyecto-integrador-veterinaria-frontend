import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import "../styles/NewAppointment.css";
import { useAuth } from "../context/AuthContext";

function NewAppointment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mascotaId = searchParams.get("mascota");

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaHora = `${fecha}T${hora}:00`;

    try {
      const response = await fetch("http://localhost:5000/api/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha: fechaHora,
          motivo: motivo,
          usuarioId: user!.id,
          mascotaId: Number(mascotaId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error al crear turno:", data);
        alert("No se pudo crear el turno");
        return;
      }

      console.log("Turno creado:", data);
      alert("Turno solicitado correctamente");
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor");
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

        <div className="appointment-pet-info">
          <span className="appointment-pet-info-icon">🐾</span>

          <div>
            <span>Mascota seleccionada</span>
            <strong>Turno para tu mascota</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="appointment-form-grid">
            <div className="appointment-field">
              <label htmlFor="date">
                📅 Fecha
              </label>

              <input
                type="date"
                id="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="appointment-field">
              <label htmlFor="time">
                🕐 Hora
              </label>

              <input
                type="time"
                id="time"
                className="form-control"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="appointment-field">
            <label htmlFor="reason">
              📝 Motivo de la consulta
            </label>

            <textarea
              id="reason"
              className="form-control"
              rows={5}
              placeholder="Contanos brevemente el motivo de la consulta..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

          <div className="new-appointment-actions">
            <Link
              to="/mascotas"
              className="btn btn-outline-secondary"
            >
              Cancelar
            </Link>

            <button type="submit" className="btn btn-primary">
              Solicitar turno
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default NewAppointment;