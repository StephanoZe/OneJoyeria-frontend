import { Component, computed, input } from '@angular/core';
import { Movimiento } from '../../models/movimiento';
import { fmt } from '../../utils/formato';
import { TipoMovimiento } from './tipo-movimiento';

/** Cifras y tabla de entradas y salidas (se usa en Reportes y en la vista de impresión). */
@Component({
  selector: 'app-tabla-movimientos',
  imports: [TipoMovimiento],
  template: `
    <div class="figures" style="grid-template-columns:repeat(3,minmax(0,1fr)); margin-top:0; margin-bottom:16px">
      <div class="figure"><div class="figure-value">+{{ fmt.num(entradas()) }}</div><div class="figure-label">Unidades que entraron</div></div>
      <div class="figure"><div class="figure-value">−{{ fmt.num(salidas()) }}</div><div class="figure-label">Unidades que salieron</div></div>
      <div class="figure"><div class="figure-value">{{ movimientos().length }}</div><div class="figure-label">Movimientos registrados</div></div>
    </div>
    <div class="panel panel-flush table-wrap">
      @if (movimientos().length) {
        <table>
          <thead><tr>
            <th>Fecha</th><th>Pieza</th><th>Tipo de joya</th><th>Tipo</th><th class="num">Cantidad</th>
            <th class="num">Stock</th><th>Responsable</th><th>Observaciones</th>
          </tr></thead>
          <tbody>
            @for (m of movimientos(); track m.id) {
              <tr>
                <td style="white-space:nowrap">{{ fmt.fechaHora(m.fechaMovimiento) }}</td>
                <td>{{ m.nombreProducto }} <span class="code">{{ m.codigoProducto }}</span></td>
                <td>{{ m.categoria }}</td>
                <td><app-tipo-movimiento [tipo]="m.tipoMovimiento" /></td>
                <td class="num">{{ m.cantidad }}</td>
                <td class="num">{{ m.stockAnterior }} a {{ m.stockNuevo }}</td>
                <td>{{ m.responsable || '—' }}</td>
                <td>{{ m.observaciones }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="empty">No hay entradas ni salidas en este periodo.</div>
      }
    </div>`,
})
export class TablaMovimientos {
  readonly movimientos = input.required<Movimiento[]>();
  protected readonly fmt = fmt;
  protected readonly entradas = computed(() =>
    this.movimientos().filter((m) => m.tipoMovimiento === 'Entrada').reduce((s, m) => s + m.cantidad, 0));
  protected readonly salidas = computed(() =>
    this.movimientos().filter((m) => m.tipoMovimiento === 'Salida').reduce((s, m) => s + m.cantidad, 0));
}
