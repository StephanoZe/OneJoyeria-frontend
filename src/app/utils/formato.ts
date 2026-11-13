import { HttpErrorResponse, HttpParams } from '@angular/common/http';

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });
const solesExactos = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
const entero = new Intl.NumberFormat('es-PE');

/** Interpreta "2026-11-06T20:48:12.123456" como hora local (recorta a milisegundos). */
function aFecha(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(String(iso).replace(/(\.\d{3})\d+/, '$1'));
  return isNaN(d.getTime()) ? null : d;
}

function isoLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Funciones de formato que usan las plantillas (moneda en soles, fechas en español). */
export const fmt = {
  soles: (n: number) => soles.format(Number(n) || 0),
  solesExactos: (n: number) => solesExactos.format(Number(n) || 0),
  num: (n: number) => entero.format(Number(n) || 0),
  fecha: (iso: string | null | undefined) =>
    aFecha(iso)?.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '—',
  fechaHora: (iso: string | null | undefined) => {
    const d = aFecha(iso);
    if (!d) return '—';
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) + ', ' +
      d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  },
  hoyLargo: () => new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }),
  isoHoy: () => isoLocal(new Date()),
};

/** Clase CSS según el estado de la pieza. */
export function claseEstado(estado: string): 'agotado' | 'bajo' | 'disponible' {
  if (estado === 'Agotado') return 'agotado';
  if (estado === 'Stock bajo') return 'bajo';
  return 'disponible';
}

/** Primer y último día de un mes "AAAA-MM". Si es el mes actual, termina hoy. */
export function rangoDelMes(mes: string): { desde: string; hasta: string } {
  const [a, m] = mes.split('-').map(Number);
  const ultimo = new Date(a, m, 0).getDate();
  const fin = `${mes}-${String(ultimo).padStart(2, '0')}`;
  const hoy = fmt.isoHoy();
  return { desde: `${mes}-01`, hasta: fin > hoy ? hoy : fin };
}

export function textoPeriodo(desde?: string | null, hasta?: string | null): string {
  const d = (iso?: string | null) => (iso ? fmt.fecha(iso + 'T00:00') : null);
  return `Del ${d(desde) ?? 'inicio'} al ${d(hasta) ?? 'día de hoy'}`;
}

/** Arma los parámetros de consulta omitiendo los vacíos. */
export function parametros(valores: Record<string, string | number | null | undefined>): HttpParams {
  let p = new HttpParams();
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && valor !== undefined && valor !== '') p = p.set(clave, String(valor));
  }
  return p;
}

/** Convierte el error HTTP en un mensaje para mostrar. El backend envía {"mensaje": "..."}. */
export function mensajeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
    const mensaje = (err.error as { mensaje?: string } | null)?.mensaje;
    return mensaje ?? `El servidor respondió con el código ${err.status}.`;
  }
  return 'Ocurrió un error inesperado.';
}
