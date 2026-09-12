import { Link } from "react-router-dom";
import "../styles/NewAppointment.css";

function NewAppointment() {
  return (
    <main className="new-appointment-page">
      <div className="new-appointment-card">
        <h1>Solicitar turno</h1>

        <form>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              className="form-control"
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