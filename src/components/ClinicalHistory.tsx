import { useEffect, useState } from "react";
import type { ClinicalConsultation } from "../types/ClinicalConsultation";

interface ClinicalHistoryProps {
  mascotaId: number;
}

function ClinicalHistory({ mascotaId }: ClinicalHistoryProps) {
  const [consultas, setConsultas] = useState<ClinicalConsultation[]>([]);
  const [consultaAbierta, setConsultaAbierta] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/mascotas/${mascotaId}/consultas`
        );

        if (!response.ok) {
          throw new Error("No se pudo cargar el historial clínico");
        }

        const data: ClinicalConsultation[] = await response.json();
        setConsultas(data);
      } catch (error) {
        console.error("Error al cargar historial clínico:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [mascotaId]);

  if (cargando) {
    return <p>Cargando historial clínico...</p>;
  }

  if (consultas.length === 0) {
    return <p>La mascota no tiene consultas registradas.</p>;
  }

  return (
    <section>
      <h2>Historial clínico</h2>

      {consultas.map((consulta) => {
        const abierta = consultaAbierta === consulta.id;

        return (
          <div className="card mb-3" key={consulta.id}>
            <div className="card-body">
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(consulta.fecha).toLocaleDateString("es-AR")}
              </p>

              <p>
                <strong>Profesional:</strong>{" "}
                {consulta.profesional.nombre} {consulta.profesional.apellido}
              </p>

              <p>
                <strong>Diagnóstico:</strong> {consulta.diagnostico}
              </p>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() =>
                  setConsultaAbierta(abierta ? null : consulta.id)
                }
              >
                {abierta ? "Ocultar detalle" : "Ver detalle"}
              </button>

              {abierta && (
                <div className="mt-3">
                  <p>
                    <strong>Subjetivo:</strong> {consulta.subjetivo}
                  </p>

                  <p>
                    <strong>Objetivo:</strong> {consulta.objetivo}
                  </p>

                  <p>
                    <strong>Evaluación:</strong> {consulta.evaluacion}
                  </p>

                  <p>
                    <strong>Plan:</strong> {consulta.plan}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default ClinicalHistory;