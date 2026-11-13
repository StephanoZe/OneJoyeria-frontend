import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movimiento } from '../models/movimiento';
import { parametros } from '../utils/formato';

export interface FiltrosMovimiento {
  desde?: string;
  hasta?: string;
  categoriaId?: string | number | null;
}

/** Consume /api/movimientos (historial general, para reportes). */
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private http = inject(HttpClient);

  listar(f: FiltrosMovimiento): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${environment.apiUrl}/movimientos`, {
      params: parametros({ desde: f.desde, hasta: f.hasta, categoriaId: f.categoriaId }),
    });
  }

  /** Dirección del Excel de entradas y salidas (se abre como descarga). */
  urlExcel(f: FiltrosMovimiento): string {
    const q = parametros({ desde: f.desde, hasta: f.hasta, categoriaId: f.categoriaId }).toString();
    return `${environment.apiUrl}/reportes/movimientos/excel${q ? '?' + q : ''}`;
  }
}
