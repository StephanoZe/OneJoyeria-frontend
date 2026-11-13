import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CatalogoService } from '../../services/catalogo';
import { ProductoService } from '../../services/producto';
import { MovimientoService } from '../../services/movimiento';
import { Opcion } from '../../models/opcion';
import { Movimiento } from '../../models/movimiento';
import { Producto } from '../../models/producto';
import { fmt, mensajeError, rangoDelMes, textoPeriodo } from '../../utils/formato';
import { Icono } from '../compartido/icono';
import { TablaMovimientos } from '../compartido/tabla-movimientos';
import { TablaInventario } from '../compartido/tabla-inventario';

/**
 * Reportes: entradas y salidas por mes o por rango de fechas y, debajo,
 * el inventario valorizado. Cada uno se descarga por separado en PDF y Excel.
 */
@Component({
  selector: 'app-reportes',
  imports: [FormsModule, RouterLink, Icono, TablaMovimientos, TablaInventario],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  private catalogo = inject(CatalogoService);
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);

  protected readonly mesActual = fmt.isoHoy().slice(0, 7);

  // Filtros del formulario
  protected mes = this.mesActual;
  protected desde = rangoDelMes(this.mesActual).desde;
  protected hasta = rangoDelMes(this.mesActual).hasta;
  protected categoriaId = '';

  protected readonly categorias = signal<Opcion[]>([]);
  protected readonly movimientos = signal<Movimiento[] | null>(null);
  protected readonly piezas = signal<Producto[] | null>(null);
  protected readonly error = signal('');

  /** Filtros con los que se cargó el reporte (para los enlaces de descarga). */
  private readonly aplicados = signal({ desde: this.desde, hasta: this.hasta, categoriaId: '' });

  protected readonly periodo = computed(() => textoPeriodo(this.aplicados().desde, this.aplicados().hasta));
  protected readonly excelMovimientos = computed(() => this.movimientoService.urlExcel(this.aplicados()));
  protected readonly excelInventario = computed(() => this.productoService.urlExcelInventario(this.aplicados().categoriaId));
  protected readonly pdfMovimientos = computed(() => ({ tipo: 'movimientos', ...this.aplicados() }));
  protected readonly pdfInventario = computed(() => ({ tipo: 'inventario', categoriaId: this.aplicados().categoriaId }));

  ngOnInit(): void {
    this.catalogo.categorias().subscribe({ next: (c) => this.categorias.set(c) });
    this.cargar();
  }

  /** Al elegir un mes se llenan las fechas y el reporte se actualiza al instante. */
  protected elegirMes(): void {
    if (!this.mes) return;
    const r = rangoDelMes(this.mes);
    this.desde = r.desde;
    this.hasta = r.hasta;
    this.cargar();
  }

  /** Si se cambian las fechas a mano, el mes deja de aplicar. */
  protected fechasManuales(): void {
    this.mes = '';
  }

  protected cargar(): void {
    const f = { desde: this.desde, hasta: this.hasta, categoriaId: this.categoriaId };
    this.aplicados.set(f);
    this.error.set('');
    forkJoin({
      movimientos: this.movimientoService.listar(f),
      piezas: this.productoService.listar({ categoriaId: f.categoriaId }),
    }).subscribe({
      next: ({ movimientos, piezas }) => {
        this.movimientos.set(movimientos);
        this.piezas.set(piezas);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
