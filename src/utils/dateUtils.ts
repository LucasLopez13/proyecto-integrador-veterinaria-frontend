export const MONTH_NAMES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
] as const;

/**
 * Formatea una fecha a representación local es-AR (DD/MM/AAAA)
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Fecha no disponible";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-AR");
}

/**
 * Formatea una hora a representación local es-AR (HH:MM)
 */
export function formatTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--:--";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Formatea fecha y hora combinadas
 */
export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "No registrada";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Fecha inválida";
  return `${date.toLocaleDateString("es-AR")} ${date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Convierte un total de segundos al formato cronómetro HH:MM:SS
 */
export function formatStopwatch(totalSeconds: number): string {
  const sec = Math.max(0, totalSeconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
