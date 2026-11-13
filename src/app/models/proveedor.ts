import { Producto } from './producto';

export interface Proveedor {
  id: number;
  nombre: string;
  ruc: string | null;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  suministra: string | null;
  observaciones: string | null;
  fechaRegistro: string;
  /** Sólo viene en la ficha (GET /api/proveedores/{id}). */
  productos: Producto[] | null;
}

export interface ProveedorRequest {
  nombre: string;
  ruc: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  suministra: string;
  observaciones: string;
}
