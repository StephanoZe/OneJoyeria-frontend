import { Component, computed, input } from '@angular/core';
import { claseEstado } from '../../utils/formato';

/** Etiqueta de color con el estado de la pieza: Disponible, Stock bajo o Agotado. */
@Component({
  selector: 'app-estado',
  template: `<span class="status {{ clase() }}">{{ estado() }}</span>`,
})
export class Estado {
  readonly estado = input.required<string>();
  protected readonly clase = computed(() => claseEstado(this.estado()));
}
