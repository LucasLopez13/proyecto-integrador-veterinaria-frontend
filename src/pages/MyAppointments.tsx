import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Appointment } from "../types/Appointment";
import "../styles/ProfessionalAppointments.css";
import type { Pet } from "../types/Pet";

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
                <h1>Mis turnos</h1>

                {appointments.length === 0 ? (
                    <div className="alert alert-info mt-4">
                        No tenés turnos solicitados.
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

                                            <td>
                                                {(() => {
                                                    const mascota = pets.find(
                                                        (pet) => pet.id === appointment.mascotaId
                                                    );

                                                    return mascota ? mascota.nombre : "Mascota no encontrada";
                                                })()}
                                            </td>

                                            <td>{appointment.motivo}</td>

                                            <td>{appointment.estado}</td>
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

export default MyAppointments;