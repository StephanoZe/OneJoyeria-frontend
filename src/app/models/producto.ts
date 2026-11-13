/** Una pieza de joyería tal como la devuelve la API (/api/productos). */
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: number;
  categoria: string;
  materialId: number;
  material: string;
  colorMaterial: string;
  proveedorId: number | null;
  proveedor: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  valorTotal: number;
  /** Disponible, Stock bajo o Agotado: lo calcula el backend. */
  estado: 'Disponible' | 'Stock bajo' | 'Agotado';
  fechaRegistro: string;
}

/** Lo que se envía al crear o editar una pieza. */
export interface ProductoRequest {
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  categoriaId: number | null;
  materialId: number | null;
  proveedorId: number | null;
  precio: number | null;
  stockActual?: number | null;
  stockMinimo: number | null;
}
