import { Component, computed, input } from '@angular/core';
import { Producto } from '../../models/producto';
import { claseEstado } from '../../utils/formato';

/** Barra de stock con una marca vertical en el stock mínimo. */
@Component({
  selector: 'app-medidor',
  template: `
    <span class="meter" [title]="'Mínimo: ' + pieza().stockMinimo">
      <span class="meter-bar {{ clase() }}" [style.--min]="minimo() + '%'"><span [style.width.%]="ancho()"></span></span>
      <b>{{ pieza().stockActual }}</b>
    </span>`,
})
export class Medidor {
  readonly pieza = input.required<Producto>();
  private readonly tope = computed(() => Math.max(this.pieza().stockActual, this.pieza().stockMinimo * 2, 1));
  protected readonly ancho = computed(() => Math.min(100, (this.pieza().stockActual / this.tope()) * 100));
  protected readonly minimo = computed(() => Math.min(100, (this.pieza().stockMinimo / this.tope()) * 100));
  protected readonly clase = computed(() => claseEstado(this.pieza().estado));
}
