import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/NewAppointment.css";
import { useAuth } from "../context/AuthContext";

function NewAppointment() {
  const { user } = useAuth();
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaHora = `${fecha}T${hora}:00.000Z`;

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
          mascotaId: 1,
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
        <h1>Solicitar turno</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">
              Fecha
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

          <div className="mb-3">
            <label htmlFor="time" className="form-label">
              Hora
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

          <div className="mb-3">
            <label htmlFor="reason" className="form-label">
              Motivo de la consulta
            </label>
            <textarea
            id="reason"
            className="form-control"
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
           />
          </div>

          <div className="new-appointment-actions">
            <Link to="/mascotas" className="btn btn-outline-secondary">
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