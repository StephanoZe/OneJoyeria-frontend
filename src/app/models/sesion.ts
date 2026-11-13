/** Usuario que inició sesión (respuesta de POST /api/auth/login). */
export interface Sesion {
  usuario: string;
  nombre: string;
  rol: string;
}
