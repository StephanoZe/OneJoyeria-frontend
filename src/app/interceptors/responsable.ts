import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { leerSesion } from '../services/auth';

/**
 * Agrega la cabecera X-Responsable con el nombre del usuario a cada petición a la API.
 * El backend la usa para registrar quién hizo el stock inicial de una pieza nueva.
 */
export const responsableInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = leerSesion();
  if (sesion && req.url.startsWith(environment.apiUrl)) {
    req = req.clone({ setHeaders: { 'X-Responsable': encodeURIComponent(sesion.nombre) } });
  }
  return next(req);
};
