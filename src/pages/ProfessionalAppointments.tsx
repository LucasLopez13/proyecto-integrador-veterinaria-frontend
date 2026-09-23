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

                  const mascota = pets.find(
                    (pet) => pet.id === appointment.mascotaId
                  );

                  return (
                    <tr key={appointment.id}>
                      <td>{fecha.toLocaleDateString("es-AR")}</td>

                      <td>
                        {fecha.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td>{mascota ? mascota.nombre : "Mascota no encontrada"}</td>

                      <td>{appointment.motivo}</td>

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
                                throw new Error("No se pudo actualizar el estado");
                              }

                              setAppointments((turnosActuales) =>
                                turnosActuales.map((turno) =>
                                  turno.id === appointment.id
                                    ? { ...turno, estado: nuevoEstado as Appointment["estado"] }
                                    : turno
                                )
                              );
                            } catch (error) {
                              console.error("Error al actualizar estado:", error);
                              alert("No se pudo actualizar el estado");
                            }
                          }}
                          className="form-select"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="cancelado">Cancelado</option>
                          <option value="completado">Completado</option>
                        </select>
                      </td>

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