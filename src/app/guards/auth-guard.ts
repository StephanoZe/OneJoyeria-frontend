import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Sólo deja entrar a las pantallas del sistema si hay una sesión iniciada. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.sesion() ? true : router.createUrlTree(['/login']);
};
