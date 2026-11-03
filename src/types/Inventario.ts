export interface LoteDisponible {
  id: number;
  productoId: number;
  numeroLote: string;
  fechaVencimiento: string;
  stockActual: number;
  stockInicial: number;
}

export interface ProductoConLotes {
  id: number;
  nombre: string;
  principioActivo?: string | null;
  concentracion?: number | null;
  unidadMedida: string;
  stockActual: number;
  alertaStockMinimo: number;
  lotesDisponibles: LoteDisponible[];
}

export interface RegistrarConsumoDTO {
  productoId: number;
  loteId: number;
  cantidad: number;
  consultaId?: number | null;
  observaciones?: string;
}

export interface ResultadoConsumo {
  movimiento: {
    id: number;
    productoId: number;
    loteId: number;
    cantidad: number;
    consultaId: number | null;
    usuarioId: number;
    observaciones: string;
    createdAt: string;
  };
  producto: {
    id: number;
    nombre: string;
    unidadMedida: string;
    stockAnterior: number;
    stockActual: number;
    alertaStockMinimo: number;
    alertaCritica: boolean;
  };
  lote: {
    id: number;
    numeroLote: string;
    stockAnterior: number;
    stockActual: number;
    fechaVencimiento: string;
  };
  cantidadConsumida: number;
}

export interface MovimientoStockItem {
  id: number;
  productoId: number;
  loteId: number | null;
  tipoMovimientoId: number;
  usuarioId: number;
  consultaId: number | null;
  cantidad: number;
  observaciones: string | null;
  createdAt: string;
  producto?: {
    id: number;
    nombre: string;
    unidadMedida: string;
    stockActual: number;
  };
  lote?: {
    id: number;
    numeroLote: string;
    fechaVencimiento: string;
    stockActual: number;
  };
  tipoMovimiento?: {
    id: number;
    codigo: string;
    nombre: string;
    esSuma: boolean;
  };
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}
