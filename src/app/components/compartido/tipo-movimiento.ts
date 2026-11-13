import { Component, input } from '@angular/core';

/** "+ Entrada" en verde o "− Salida" en ámbar. */
@Component({
  selector: 'app-tipo-movimiento',
  template: `
    @if (tipo() === 'Entrada') { <span class="tipo entrada">+ Entrada</span> }
    @else { <span class="tipo salida">− Salida</span> }`,
})
export class TipoMovimiento {
  readonly tipo = input.required<string>();
}
