import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Opcion } from '../models/opcion';
import { Panel } from '../models/panel';

/** Datos de apoyo: panel principal, categorías y materiales. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);

  panel(): Observable<Panel> {
    return this.http.get<Panel>(`${environment.apiUrl}/panel`);
  }

  categorias(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${environment.apiUrl}/categorias`);
  }

  materiales(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${environment.apiUrl}/materiales`);
  }
}
