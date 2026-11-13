import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ProductoRequest } from '../models/producto';
import { Movimiento, MovimientoRequest } from '../models/movimiento';
import { Resumen } from '../models/panel';
import { parametros } from '../utils/formato';

export interface FiltrosProducto {
  busqueda?: string;
  categoriaId?: number | string | null;
  estado?: string;
}

/** Consume /api/productos: catálogo, CRUD de piezas y sus movimientos. */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  /** Número del menú "Alertas": piezas agotadas + piezas con stock bajo. */
  readonly contadorAlertas = signal(0);

  listar(filtros: FiltrosProducto = {}): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl, {
      params: parametros({ busqueda: filtros.busqueda, categoriaId: filtros.categoriaId, estado: filtros.estado }),
    });
  }

  obtener(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${encodeURIComponent(codigo)}`);
  }

  crear(datos: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, datos);
  }

  actualizar(codigo: string, datos: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${encodeURIComponent(codigo)}`, datos);
  }

  /** El backend responde 204 sin contenido, por eso devuelve void. */
  eliminar(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(codigo)}`);
  }

  alertas(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/alertas`);
  }

  resumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${this.apiUrl}/resumen`);
  }

  historial(codigo: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/${encodeURIComponent(codigo)}/movimientos`);
  }

  registrarMovimiento(codigo: string, datos: MovimientoRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/${encodeURIComponent(codigo)}/movimientos`, datos);
  }

  /** Dirección del Excel del inventario valorizado (se abre como descarga). */
  urlExcelInventario(categoriaId?: string | number | null): string {
    const q = parametros({ categoriaId }).toString();
    return `${environment.apiUrl}/reportes/inventario/excel${q ? '?' + q : ''}`;
  }

  refrescarContador(): void {
    this.resumen().subscribe({
      next: (r) => this.contadorAlertas.set(r.productosAgotados + r.productosStockBajo),
      error: () => { /* si falla, el contador no se actualiza */ },
    });
  }
}
