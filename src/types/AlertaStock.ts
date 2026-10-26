
export type TipoAlertaStock =
  | "STOCK_CRITICO"
  | "PRODUCTO_VENCIDO"
  | "PROXIMO_A_VENCER";

export type NivelAlerta = "CRITICO" | "ADVERTENCIA";

export interface AlertaStock {
  tipo: TipoAlertaStock;
  nivel: NivelAlerta;
  productoId: number;
  producto: string;
  mensaje: string;
  stockActual: number;
  unidadMedida: string;
  stockMinimo?: number;
  loteId?: number;
  numeroLote?: string;
  fechaVencimiento?: string;
}

export interface RespuestaAlertasStock {
  total: number;
  diasVencimiento: number;
  alertas: AlertaStock[];
}
