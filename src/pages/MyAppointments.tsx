import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Appointment } from "../types/Appointment";
import type { Pet } from "../types/Pet";
import "../styles/ProfessionalAppointments.css";

function MyAppointments() {
  const { user } = useAuth();
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

        const turnos: Appointment[] = await turnosResponse.json();
        const mascotas: Pet[] = await mascotasResponse.json();

        const misTurnos = turnos.filter(
          (appointment) => appointment.usuarioId === user?.id
        );

        setAppointments(misTurnos);
        setPets(mascotas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, [user]);

  return (
    <main className="professional-appointments-page">
      <div className="container py-4">
        <div className="appointments-header">
          <div>
            <h1>Mis turnos</h1>
            <p>Consultá tus próximos turnos veterinarios</p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="appointments-empty">
            <div className="appointments-empty-icon">📅</div>
            <h3>No tenés turnos solicitados</h3>
            <p>
              Cuando solicites un turno, vas a poder verlo en esta sección.
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
                            <span className="appointment-pet-icon">🐾</span>
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
                          <span
                            className={`appointment-status status-${appointment.estado}`}
                          >
                            {appointment.estado === "pendiente" && "🟡 "}
                            {appointment.estado === "confirmado" && "🟢 "}
                            {appointment.estado === "cancelado" && "🔴 "}
                            {appointment.estado === "completado" && "🔵 "}

                            {appointment.estado.charAt(0).toUpperCase() +
                              appointment.estado.slice(1)}
                          </span>
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

export default MyAppointments;