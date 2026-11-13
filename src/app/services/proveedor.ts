import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proveedor, ProveedorRequest } from '../models/proveedor';
import { parametros } from '../utils/formato';

/** Consume /api/proveedores. */
@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proveedores`;

  listar(busqueda = ''): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl, { params: parametros({ busqueda }) });
  }

  obtener(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crear(datos: ProveedorRequest): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, datos);
  }

  actualizar(id: number, datos: ProveedorRequest): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
