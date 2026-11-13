import { Component, input } from '@angular/core';

export type NombreIcono = 'buscar' | 'mas' | 'editar' | 'borrar' | 'mover' | 'descargar' | 'imprimir' | 'volver';

/** Íconos de trazo simple (24×24) dibujados en SVG. */
@Component({
  selector: 'app-icono',
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (nombre()) {
        @case ('buscar') { <svg:circle cx="11" cy="11" r="7"/><svg:path d="m20 20-3.5-3.5"/> }
        @case ('mas') { <svg:path d="M12 5v14M5 12h14"/> }
        @case ('editar') { <svg:path d="M4 20h4L19 9l-4-4L4 16v4Z"/><svg:path d="m13.5 6.5 4 4"/> }
        @case ('borrar') { <svg:path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/> }
        @case ('mover') { <svg:path d="M7 4v16M7 4 3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4"/> }
        @case ('descargar') { <svg:path d="M12 4v11M7 10l5 5 5-5M5 20h14"/> }
        @case ('imprimir') { <svg:path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/> }
        @case ('volver') { <svg:path d="M15 6l-6 6 6 6"/> }
      }
    </svg>`,
  host: { style: 'display: contents' },
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
}
