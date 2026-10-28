export interface SanitaryRecord {
  id: number;
  tipo: "vacuna" | "antiparasitario";
  nombre: string;
  lote?: string | null;
  fechaAplicacion: string;
  fechaRefuerzoEstimada?: string | null;
  mascotaId: number;
}