import React, { useEffect, useState } from "react";
import type { TriageColumn } from "../../types/Triage";
import { formatStopwatch, formatTime, formatDate } from "../../utils/dateUtils";

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

  const formattedArrivalHour = formatTime(fechaLlegada);
  const formattedArrivalDate = formatDate(fechaLlegada);

  if (columna === "INTERNACION_QUIROFANO") {
    return (
      <span
        className="rounded-1 px-2 py-1 font-monospace small fw-semibold d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
          color: "var(--vet-primary, #6D28D9)",
          border: "1px solid var(--vet-border-tint, #EDE9FE)",
          fontSize: "0.75rem",
        }}
      >
        <i className="bi bi-hospital"></i> {formattedArrivalDate} · {formattedArrivalHour} hs
      </span>
    );
  }

  if (diffSeconds < 0) {
    const secondsUntil = Math.abs(diffSeconds);
    return (
      <span
        className="rounded-1 px-2 py-1 font-monospace small fw-semibold d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: "#ECFDF5",
          color: "#059669",
          border: "1px solid #A7F3D0",
          fontSize: "0.75rem",
        }}
      >
        <i className="bi bi-calendar-check"></i> Turno: {formattedArrivalHour} hs (-{formatStopwatch(secondsUntil)})
      </span>
    );
  }

  const elapsedMinutes = Math.floor(diffSeconds / 60);
  const isSevere = columna === "EMERGENCIA_CRITICA" || elapsedMinutes >= 30;

  return (
    <span
      className="rounded-1 px-2 py-1 font-monospace small fw-semibold d-inline-flex align-items-center gap-1"
      style={{
        backgroundColor: isSevere ? "#FEF2F2" : "#FFFBEB",
        color: isSevere ? "#DC2626" : "#D97706",
        border: `1px solid ${isSevere ? "#FECACA" : "#FDE68A"}`,
        fontSize: "0.75rem",
      }}
    >
      <i className="bi bi-clock-history"></i> {formatStopwatch(diffSeconds)}
    </span>
  );
};
