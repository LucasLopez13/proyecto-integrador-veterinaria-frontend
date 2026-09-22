import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Appointment } from "../types/Appointment";
import "../styles/ProfessionalAppointments.css";

function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/turnos");

        if (!response.ok) {
          throw new Error("No se pudieron cargar los turnos");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
      }
    };

    cargarTurnos();
  }, []);

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
                {appointments.map((appointment) => {
                  const fecha = new Date(appointment.fecha);

                  return (
                    <tr key={appointment.id}>
                      <td>{fecha.toLocaleDateString("es-AR")}</td>

                      <td>
                        {fecha.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td>{appointment.mascotaId}</td>

                      <td>{appointment.motivo}</td>

                      <td>{appointment.estado}</td>

                      <td>
                        <Link
                          to={`/profesional/mascotas/${appointment.mascotaId}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Ver mascota
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfessionalAppointments;