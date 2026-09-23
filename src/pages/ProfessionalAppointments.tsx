import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Appointment } from "../types/Appointment";
import type { Pet } from "../types/Pet";
import "../styles/ProfessionalAppointments.css";

function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [turnosResponse, mascotasResponse] = await Promise.all([
          fetch("http://localhost:5000/api/turnos"),
          fetch("http://localhost:5000/api/mascotas"),
        ]);

        if (!turnosResponse.ok || !mascotasResponse.ok) {
          throw new Error("No se pudieron cargar los datos");
        }

        const turnos = await turnosResponse.json();
        const mascotas = await mascotasResponse.json();

        setAppointments(turnos);
        setPets(mascotas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  return (
    <main className="professional-appointments-page">
      <div className="container py-4">
        <div className="appointments-header">
          <div>
            <h1>Turnos solicitados</h1>
            <p>Gestioná los turnos de tus pacientes</p>
          </div>
        </div>

        {appointments.length === 0 ? (
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
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => {
                    const fecha = new Date(appointment.fecha);

                    const mascota = pets.find(
                      (pet) => pet.id === appointment.mascotaId
                    );

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

                            <span>
                              {mascota
                                ? mascota.nombre
                                : "Mascota no encontrada"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="appointment-reason">
                            {appointment.motivo}
                          </span>
                        </td>

                        <td>
                          <select
                            value={appointment.estado}
                            onChange={async (e) => {
                              const nuevoEstado = e.target.value;

                              try {
                                const response = await fetch(
                                  `http://localhost:5000/api/turnos/${appointment.id}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      estado: nuevoEstado,
                                    }),
                                  }
                                );

                                if (!response.ok) {
                                  throw new Error(
                                    "No se pudo actualizar el estado"
                                  );
                                }

                                setAppointments((turnosActuales) =>
                                  turnosActuales.map((turno) =>
                                    turno.id === appointment.id
                                      ? {
                                          ...turno,
                                          estado:
                                            nuevoEstado as Appointment["estado"],
                                        }
                                      : turno
                                  )
                                );
                              } catch (error) {
                                console.error(
                                  "Error al actualizar estado:",
                                  error
                                );

                                alert(
                                  "No se pudo actualizar el estado"
                                );
                              }
                            }}
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