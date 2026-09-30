import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Appointment } from "../types/Appointment";
import "../styles/ProfessionalAppointments.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/turnos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los turnos");
      }

      const turnos: Appointment[] = await response.json();
      setAppointments(turnos);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const handleStatusChange = async (appointmentId: number, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/turnos/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      setAppointments((turnosActuales) =>
        turnosActuales.map((turno) =>
          turno.id === appointmentId
            ? {
                ...turno,
                estado: nuevoEstado as Appointment["estado"],
              }
            : turno
        )
      );
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      alert(err.message || "No se pudo actualizar el estado");
    }
  };

  return (
    <main className="professional-appointments-page">
      <div className="container py-4">
        <div className="appointments-header">
          <div>
            <h1>Turnos solicitados</h1>
            <p>Gestioná los turnos de tus pacientes</p>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <p className="text-muted">Cargando turnos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="appointments-empty">
            <div className="appointments-empty-icon">📅</div>

            <h3>No hay turnos solicitados</h3>

            <p>
              Los turnos solicitados por los clientes aparecerán en esta
              sección.
            </p>
          </div>
        ) : (
          <div className="appointments-table-wrapper">
            <div className="table-responsive">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Mascota</th>
                    <th>Tutor</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => {
                    const fecha = new Date(appointment.fecha);
                    const mascotaNombre =
                      appointment.mascota?.nombre || "Mascota";
                    const tutorNombre = appointment.usuario
                      ? `${appointment.usuario.nombre} ${appointment.usuario.apellido}`
                      : "Cliente";

                    return (
                      <tr key={appointment.id}>
                        <td>
                          <span className="appointment-date">
                            {fecha.toLocaleDateString("es-AR")}
                          </span>
                        </td>

                        <td>
                          <span className="appointment-time">
                            {fecha.toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td>
                          <div className="appointment-pet">
                            <span className="appointment-pet-icon">
                              🐾
                            </span>
                            <div>
                              <strong>{mascotaNombre}</strong>
                              {appointment.mascota?.especie && (
                                <small className="text-muted d-block">
                                  {appointment.mascota.especie}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="appointment-owner">
                            {tutorNombre}
                          </span>
                        </td>

                        <td>
                          <span className="appointment-reason">
                            {appointment.motivo}
                          </span>
                        </td>

                        <td>
                          <select
                            value={appointment.estado}
                            onChange={(e) =>
                              handleStatusChange(appointment.id, e.target.value)
                            }
                            className={`appointment-status-select status-${appointment.estado}`}
                          >
                            <option value="pendiente">
                              🟡 Pendiente
                            </option>

                            <option value="confirmado">
                              🟢 Confirmado
                            </option>

                            <option value="cancelado">
                              🔴 Cancelado
                            </option>

                            <option value="completado">
                              🔵 Completado
                            </option>
                          </select>
                        </td>

                        <td>
                          <Link
                            to={`/profesional/mascotas/${appointment.mascotaId}`}
                            className="btn btn-outline-primary btn-sm appointment-pet-button"
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
          </div>
        )}
      </div>
    </main>
  );
}
export default ProfessionalAppointments;