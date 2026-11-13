import { Component, input } from '@angular/core';

/** Nombre del material con su "pastilla" de color metálico. */
@Component({
  selector: 'app-material',
  template: `<span class="material"><span class="swatch" [style.--c]="color() || '#ccc'"></span>{{ nombre() }}</span>`,
})
export class Material {
  readonly nombre = input.required<string>();
  readonly color = input<string | null>(null);
}
