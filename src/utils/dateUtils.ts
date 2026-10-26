export const MONTH_NAMES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
] as const;

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Fecha no disponible";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-AR");
}

export function formatTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--:--";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "No registrada";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Fecha inválida";
  return `${date.toLocaleDateString("es-AR")} ${date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatStopwatch(totalSeconds: number): string {
  const sec = Math.max(0, totalSeconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function isSameCalendarDay(
  dateInput: string | Date | null | undefined,
  targetDate: Date = new Date()
): boolean {
  if (!dateInput) return false;
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    return (
      targetDate.getFullYear() === y &&
      targetDate.getMonth() + 1 === m &&
      targetDate.getDate() === d
    );
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === targetDate.getFullYear() &&
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
}
