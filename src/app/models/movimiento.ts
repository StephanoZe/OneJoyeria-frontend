export type TipoMovimiento = 'Entrada' | 'Salida';

/** Una entrada o salida de stock (/api/movimientos). */
export interface Movimiento {
  id: number;
  productoId: number;
  codigoProducto: string;
  nombreProducto: string;
  categoria: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  observaciones: string | null;
  responsable: string | null;
  fechaMovimiento: string;
}

export interface MovimientoRequest {
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  responsable: string;
  observaciones: string;
}
