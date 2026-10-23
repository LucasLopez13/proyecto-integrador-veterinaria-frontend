import React, { useEffect, useState } from "react";
import type { TriageColumn } from "../../types/Triage";

interface TriageTimerProps {
  fechaLlegada: string;
  columna: TriageColumn;
}

export const TriageTimer: React.FC<TriageTimerProps> = ({
  fechaLlegada,
  columna,
}) => {
  const [diffSeconds, setDiffSeconds] = useState<number>(() => {
    const arrival = new Date(fechaLlegada).getTime();
    return Math.floor((Date.now() - arrival) / 1000);
  });

  useEffect(() => {
    const updateTime = () => {
      const arrival = new Date(fechaLlegada).getTime();
      const now = Date.now();
      const diff = Math.floor((now - arrival) / 1000);
      setDiffSeconds(diff);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [fechaLlegada]);

  // Formateo HH:MM:SS o MM:SS
  const formatTime = (totalSec: number) => {
    const sec = Math.max(0, totalSec);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const arrivalDate = new Date(fechaLlegada);
  const formattedArrivalHour = arrivalDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedArrivalDate = arrivalDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // 1. Caso INTERNACIÓN / QUIRÓFANO:
  // "ya una vez movidos a otras secciones como por ej internacion solamente marcar la fecha de registro"
  if (columna === "INTERNACION_QUIROFANO") {
    return (
      <div className="triage-timer-container border-primary-subtle bg-light">
        <div className="triage-timer-header">
          <span className="triage-timer-label text-primary fw-bold">
            🏥 Registro de Internación:
          </span>
          <span
            className="triage-timer-display text-primary"
            style={{ fontSize: "0.95rem" }}
          >
            {formattedArrivalHour} hs
          </span>
        </div>
        <div className="triage-timer-sub mt-1">
          <small className="text-muted">
            Fecha: {formattedArrivalDate}
          </small>
          <span className="badge bg-primary-subtle text-primary ms-auto">
            Internado / Quirófano
          </span>
        </div>
      </div>
    );
  }

  // 2. Caso Turno aún pendiente para más tarde en el día (fechaLlegada en el futuro)
  if (diffSeconds < 0) {
    const secondsUntil = Math.abs(diffSeconds);
    return (
      <div className="triage-timer-container bg-light">
        <div className="triage-timer-header">
          <span className="triage-timer-label">⏰ Turno Programado:</span>
          <span className="triage-timer-display text-success">
            {formattedArrivalHour} hs
          </span>
        </div>
        <div className="triage-timer-sub mt-1">
          <small className="text-muted">
            Inicia en: <strong>{formatTime(secondsUntil)}</strong>
          </small>
          <span className="badge bg-success-subtle text-success ms-auto">
            En horario
          </span>
        </div>
      </div>
    );
  }

  // 3. Caso Tiempo de espera transcurrido desde la hora de llegada o turno pactado
  const elapsedMinutes = Math.floor(diffSeconds / 60);
  let isOverdue = false;
  let alertBadgeClass = "timer-normal";
  let alertText = "";

  if (columna === "EMERGENCIA_CRITICA") {
    if (elapsedMinutes >= 10) {
      isOverdue = true;
      alertBadgeClass = "timer-critical-pulse";
      alertText = "⚠️ Demora crítica (>10 min)";
    } else if (elapsedMinutes >= 5) {
      alertBadgeClass = "timer-warning";
    }
  } else if (columna === "URGENCIA_MODERADA") {
    if (elapsedMinutes >= 30) {
      isOverdue = true;
      alertBadgeClass = "timer-warning-pulse";
      alertText = "Demora prolongada (>30 min)";
    } else if (elapsedMinutes >= 15) {
      alertBadgeClass = "timer-warning";
    }
  } else if (columna === "CONSULTA_PROGRAMADA") {
    if (elapsedMinutes >= 45) {
      isOverdue = true;
      alertBadgeClass = "timer-warning";
      alertText = "Demora en turno (>45 min)";
    }
  }

  return (
    <div className={`triage-timer-container ${alertBadgeClass}`}>
      <div className="triage-timer-header">
        <span className="triage-timer-label">⏱️ Tiempo de espera:</span>
        <span
          className="triage-timer-display"
          title={`Hora pactada/llegada: ${formattedArrivalHour}`}
        >
          {formatTime(diffSeconds)}
        </span>
      </div>

      <div className="triage-timer-sub mt-1">
        <small className="text-muted">
          Pactado/Llegada: <strong>{formattedArrivalHour} hs</strong>
        </small>
        {isOverdue && alertText && (
          <span className="badge bg-danger-subtle text-danger font-monospace ms-auto">
            {alertText}
          </span>
        )}
      </div>
    </div>
  );
};
