import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sesion } from '../models/sesion';

const CLAVE = 'onejoyeria.sesion';

/** Lee la sesión guardada en el navegador (se borra al cerrar la pestaña). */
export function leerSesion(): Sesion | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Sesion) : null;
  } catch {
    return null;
  }
}

/** Inicio y cierre de sesión del administrador. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  /** Usuario actual; null si no hay sesión. */
  readonly sesion = signal<Sesion | null>(leerSesion());

  login(usuario: string, contrasena: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${environment.apiUrl}/auth/login`, { usuario, contrasena })
      .pipe(tap((s) => {
        try { sessionStorage.setItem(CLAVE, JSON.stringify(s)); } catch { /* modo privado */ }
        this.sesion.set(s);
      }));
  }

  cerrarSesion(): void {
    try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ }
    this.sesion.set(null);
  }
}
