import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Appointment } from "../types/Appointment";
import type { Pet } from "../types/Pet";
import ClinicalHistory from "../components/ClinicalHistory";

function ActiveAppointment() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    const cargarAtencion = async () => {
      try {
        const turnoResponse = await fetch(
          `http://localhost:5000/api/turnos/${id}`
        );

        if (!turnoResponse.ok) {
          throw new Error("No se pudo cargar el turno");
        }

        const turno: Appointment = await turnoResponse.json();

        const mascotaResponse = await fetch(
          `http://localhost:5000/api/mascotas/${turno.mascotaId}`
        );

        if (!mascotaResponse.ok) {
          throw new Error("No se pudo cargar la mascota");
        }

        const mascota: Pet = await mascotaResponse.json();

        setAppointment(turno);
        setPet(mascota);
      } catch (error) {
        console.error("Error al cargar la atención:", error);
      }
    };

    cargarAtencion();
  }, [id]);

  if (!appointment || !pet) {
    return (
      <main className="container py-5">
        <p>Cargando atención...</p>
      </main>
    );
  }

  const fecha = new Date(appointment.fecha);

  return (
    <main className="container py-5">
      <h1>Atención activa</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h2>{pet.nombre}</h2>

          <p>
            <strong>Fecha:</strong> {fecha.toLocaleDateString("es-AR")}
          </p>

          <p>
            <strong>Hora:</strong>{" "}
            {fecha.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p>
            <strong>Motivo:</strong> {appointment.motivo}
          </p>

          <p>
            <strong>Estado:</strong> {appointment.estado}
          </p>
        </div>
      </div>

      <ClinicalHistory mascotaId={pet.id} />

      <Link
        to="/profesional/turnos"
        className="btn btn-outline-secondary mt-3"
      >
        Volver a turnos
      </Link>
    </main>
  );
}

export default ActiveAppointment;