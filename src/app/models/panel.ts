import { Movimiento } from './movimiento';
import { Producto } from './producto';

export interface Resumen {
  totalProductos: number;
  valorInventario: number;
  productosStockBajo: number;
  productosAgotados: number;
  totalUnidades: number;
  entradasSemana: number;
  salidasSemana: number;
}

/** Un compartimento de la bandeja: resumen de un tipo de joya. */
export interface CategoriaResumen {
  categoriaId: number;
  categoria: string;
  productos: number;
  unidades: number;
  valor: number;
  agotados: number;
  stockBajo: number;
}

export interface DiaMovimiento {
  fecha: string;
  dia: string;
  entradas: number;
  salidas: number;
}

/** Todo lo que necesita el panel (GET /api/panel). */
export interface Panel {
  resumen: Resumen;
  categorias: CategoriaResumen[];
  semana: DiaMovimiento[];
  recientes: Movimiento[];
  alertas: Producto[];
}
