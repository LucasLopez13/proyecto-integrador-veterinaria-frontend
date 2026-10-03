import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Appointment } from "../types/Appointment";
import "../styles/ProfessionalAppointments.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

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
      console.error("Error al cargar turnos:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const handleCancelarTurno = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseás cancelar este turno?"
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/turnos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: "cancelado",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo cancelar el turno");
      }

      setAppointments((turnos) =>
        turnos.map((turno) =>
          turno.id === id
            ? { ...turno, estado: "cancelado" }
            : turno
        )
      );
    } catch (err: any) {
      console.error("Error al cancelar turno:", err);
      alert(err.message || "Error al cancelar el turno");
    }
  };

  const handleReprogramarTurno = async (id: number) => {
    if (!nuevaFecha) {
      alert("Seleccioná una nueva fecha y hora");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/turnos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: new Date(nuevaFecha).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo reprogramar el turno");
      }

      const turnoActualizado: Appointment = await response.json();

      setAppointments((turnos) =>
        turnos.map((turno) =>
          turno.id === id ? turnoActualizado : turno
        )
      );

      setReprogramandoId(null);
      setNuevaFecha("");
    } catch (err: any) {
      console.error("Error al reprogramar turno:", err);
      alert(err.message || "Error al reprogramar el turno");
    }
  };

  return (
    <main className="professional-appointments-page">
      <div className="container py-4">

        {/* Encabezado */}
        <div className="appointments-header d-flex justify-content-between align-items-center">
          <div>
            <h1>Mis turnos</h1>
            <p>Consultá tus próximos turnos veterinarios</p>
          </div>

          <Link to="/turnos/nuevo" className="btn btn-primary">
            + Solicitar nuevo turno
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-5">
            <p className="text-muted">
              Cargando tus turnos...
            </p>
          </div>

        ) : appointments.length === 0 ? (

          /* Sin turnos */
          <div className="appointments-empty">
            <div className="appointments-empty-icon">
              📅
            </div>

            <h3>No tenés turnos solicitados</h3>

            <p>
              Cuando solicites un turno, vas a poder verlo en esta sección.
            </p>

            <Link
              to="/turnos/nuevo"
              className="btn btn-primary mt-3"
            >
              Solicitar mi primer turno
            </Link>
          </div>

        ) : (

          /* Tabla */
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

                    const mascotaNombre =
                      appointment.mascota?.nombre || "Mascota";

                    return (
                      <tr key={appointment.id}>

                        {/* Fecha */}
                        <td>
                          <span className="appointment-date">
                            {fecha.toLocaleDateString("es-AR")}
                          </span>
                        </td>

                        {/* Hora */}
                        <td>
                          <span className="appointment-time">
                            {fecha.toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Mascota */}
                        <td>
                          <div className="appointment-pet">
                            <span className="appointment-pet-icon">
                              🐾
                            </span>

                            <span>
                              {mascotaNombre}
                            </span>
                          </div>
                        </td>

                        {/* Motivo */}
                        <td>
                          <span className="appointment-reason">
                            {appointment.motivo}
                          </span>
                        </td>

                        {/* Estado */}
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

                        {/* Acciones */}
                        <td>

                          {appointment.estado !== "cancelado" &&
                            appointment.estado !== "completado" && (

                              reprogramandoId === appointment.id ? (

                                /* =========================
                                   FORMULARIO REPROGRAMACIÓN
                                   ========================= */

                                <div className="reschedule-box">

                                  <div className="reschedule-title">

                                    <span className="reschedule-icon">
                                      📅
                                    </span>

                                    <div>
                                      <strong>
                                        Nueva fecha y hora
                                      </strong>

                                      <small>
                                        Elegí cuándo querés asistir
                                      </small>
                                    </div>

                                  </div>

                                  <input
                                    type="datetime-local"
                                    value={nuevaFecha}
                                    onChange={(e) =>
                                      setNuevaFecha(e.target.value)
                                    }
                                    className="reschedule-input"
                                  />

                                  <div className="reschedule-actions">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReprogramarTurno(
                                          appointment.id
                                        )
                                      }
                                      className="reschedule-confirm"
                                    >
                                      ✓ Confirmar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReprogramandoId(null);
                                        setNuevaFecha("");
                                      }}
                                      className="reschedule-cancel"
                                    >
                                      × Volver
                                    </button>

                                  </div>

                                </div>

                              ) : (

                                /* =========================
                                   BOTONES NORMALES
                                   ========================= */

                                <div className="appointment-actions">

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReprogramandoId(
                                        appointment.id
                                      );
                                      setNuevaFecha("");
                                    }}
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    📅 Reprogramar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCancelarTurno(
                                        appointment.id
                                      )
                                    }
                                    className="btn btn-outline-danger btn-sm"
                                  >
                                    Cancelar
                                  </button>

                                </div>
                              )
                            )}

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