import { Link } from "react-router-dom";
import type { Appointment } from "../types/Appointment";
import "../styles/ProfessionalAppointments.css";

function ProfessionalAppointments() {
  const appointments: Appointment[] = [];

  return (
    <main className="professional-appointments-page">
      <div className="container py-4">
        <h1>Turnos solicitados</h1>

        {appointments.length === 0 ? (
          <div className="alert alert-info mt-4">
            No hay turnos solicitados.
          </div>
        ) : (
          <div className="table-responsive mt-4">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Mascota</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.petId}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <Link
                        to={`/profesional/mascotas/${appointment.petId}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Ver mascota
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfessionalAppointments;