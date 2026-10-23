import type { TriageColumn } from "../types/Triage";
import type { AppointmentStatus } from "../types/Appointment";
import type { UserRole } from "../types/User";

/**
 * Configuración central de conectividad API
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  DEFAULT_TIMEOUT_MS: 15000,
} as const;

/**
 * Constantes y límites de adjuntos médicos
 */
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_MB: 5,
  ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png"],
  ALLOWED_MIME_TYPES: ["application/pdf", "image/jpeg", "image/png"],
  BLOB_REVOKE_TIMEOUT_MS: 60000, // 1 minuto
} as const;

/**
 * Intervalos de polling y temporizadores
 */
export const TIMERS = {
  TRIAGE_POLLING_INTERVAL_MS: 30000, // 30 segundos
  REDIRECT_DELAY_MS: 1500,           // 1.5 segundos
} as const;

/**
 * Configuración unificada de columnas de Triage (Kanban y Modales)
 */
export interface ColumnMeta {
  key: TriageColumn;
  title: string;
  subtitle: string;
  badgeClass: string;
  indicatorColor: string;
}

export const TRIAGE_COLUMNS_CONFIG: Record<TriageColumn, ColumnMeta> = {
  CONSULTA_PROGRAMADA: {
    key: "CONSULTA_PROGRAMADA",
    title: "Consulta Programada",
    subtitle: "Turnos agendados y controles",
    badgeClass: "badge-success-subtle",
    indicatorColor: "#059669",
  },
  URGENCIA_MODERADA: {
    key: "URGENCIA_MODERADA",
    title: "Urgencia Moderada",
    subtitle: "Atención prioritaria en sala",
    badgeClass: "badge-warning-subtle",
    indicatorColor: "#D97706",
  },
  EMERGENCIA_CRITICA: {
    key: "EMERGENCIA_CRITICA",
    title: "Emergencia Crítica",
    subtitle: "Riesgo vital inmediato",
    badgeClass: "badge-danger-subtle",
    indicatorColor: "#DC2626",
  },
  INTERNACION_QUIROFANO: {
    key: "INTERNACION_QUIROFANO",
    title: "Internación / Quirófano",
    subtitle: "En cirugía o internación",
    badgeClass: "badge-violet",
    indicatorColor: "#6D28D9",
  },
} as const;

export const TRIAGE_COLUMNS_ORDER: TriageColumn[] = [
  "CONSULTA_PROGRAMADA",
  "URGENCIA_MODERADA",
  "EMERGENCIA_CRITICA",
  "INTERNACION_QUIROFANO",
];

/**
 * Estados de turnos canónicos
 */
export const APPOINTMENT_STATUS: Record<string, AppointmentStatus> = {
  PENDIENTE: "pendiente",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
  ATENDIDO: "atendido",
} as const;

/**
 * Especies y opciones del sistema
 */
export const SPECIES_OPTIONS = ["Canino", "Felino", "Ave", "Otro"] as const;
export type SpeciesType = (typeof SPECIES_OPTIONS)[number];

/**
 * Horarios de atención veterinaria disponibles para solicitud de turnos
 */
export const BUSINESS_HOURS_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
] as const;
