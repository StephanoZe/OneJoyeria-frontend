import { Component, computed, input } from '@angular/core';
import { Producto } from '../../models/producto';
import { fmt } from '../../utils/formato';
import { Estado } from './estado';

/** Inventario valorizado: stock actual a precio de venta, con totales. */
@Component({
  selector: 'app-tabla-inventario',
  imports: [Estado],
  template: `
    @if (piezas().length) {
      <div class="panel panel-flush table-wrap">
        <table>
          <thead><tr>
            <th>Código</th><th>Pieza</th><th>Tipo</th><th>Material</th><th class="num">Precio</th>
            <th class="num">Stock</th><th class="num">Valor</th><th>Estado</th>
          </tr></thead>
          <tbody>
            @for (p of piezas(); track p.id) {
              <tr>
                <td class="code">{{ p.codigo }}</td><td>{{ p.nombre }}</td><td>{{ p.categoria }}</td><td>{{ p.material }}</td>
                <td class="num">{{ fmt.solesExactos(p.precio) }}</td><td class="num">{{ p.stockActual }}</td>
                <td class="num">{{ fmt.solesExactos(p.valorTotal) }}</td><td><app-estado [estado]="p.estado" /></td>
              </tr>
            }
          </tbody>
          <tfoot><tr>
            <td colspan="5">Total</td><td class="num">{{ fmt.num(unidades()) }}</td>
            <td class="num">{{ fmt.solesExactos(valor()) }}</td><td></td>
          </tr></tfoot>
        </table>
      </div>
    } @else {
      <div class="empty">No hay piezas registradas en este tipo de joya.</div>
    }`,
})
export class TablaInventario {
  readonly piezas = input.required<Producto[]>();
  protected readonly fmt = fmt;
  protected readonly valor = computed(() => this.piezas().reduce((s, p) => s + Number(p.valorTotal), 0));
  protected readonly unidades = computed(() => this.piezas().reduce((s, p) => s + p.stockActual, 0));
}
