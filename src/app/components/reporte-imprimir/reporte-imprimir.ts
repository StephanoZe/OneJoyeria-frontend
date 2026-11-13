import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CatalogoService } from '../../services/catalogo';
import { ProductoService } from '../../services/producto';
import { MovimientoService } from '../../services/movimiento';
import { Movimiento } from '../../models/movimiento';
import { Producto } from '../../models/producto';
import { fmt, mensajeError, textoPeriodo } from '../../utils/formato';
import { TablaMovimientos } from '../compartido/tabla-movimientos';
import { TablaInventario } from '../compartido/tabla-inventario';

/**
 * Vista de impresión: se abre en otra pestaña desde Reportes y lanza el diálogo
 * de imprimir, donde se elige "Guardar como PDF".
 * /reporte-imprimir?tipo=movimientos&desde=...&hasta=...  o  ?tipo=inventario
 */
@Component({
  selector: 'app-reporte-imprimir',
  imports: [TablaMovimientos, TablaInventario],
  templateUrl: './reporte-imprimir.html',
})
export class ReporteImprimir implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogo = inject(CatalogoService);
  private productoService = inject(ProductoService);
  private movimientoService = inject(MovimientoService);

  protected readonly esInventario = this.route.snapshot.queryParamMap.get('tipo') === 'inventario';
  protected readonly titulo = this.esInventario ? 'Inventario valorizado' : 'Entradas y salidas';
  protected readonly generado = fmt.fechaHora(new Date().toISOString());

  protected readonly movimientos = signal<Movimiento[] | null>(null);
  protected readonly piezas = signal<Producto[] | null>(null);
  protected readonly categoria = signal('Todos los tipos de joya');
  protected readonly detalle = signal('');
  protected readonly error = signal('');

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const f = { desde: q.get('desde') ?? '', hasta: q.get('hasta') ?? '', categoriaId: q.get('categoriaId') ?? '' };
    document.title = `${this.titulo} | One Joyería`;
    this.detalle.set(this.esInventario ? 'Stock actual a precio de venta' : textoPeriodo(f.desde, f.hasta));

    const datos: Observable<Movimiento[] | Producto[]> = this.esInventario
      ? this.productoService.listar({ categoriaId: f.categoriaId })
      : this.movimientoService.listar(f);

    forkJoin({ categorias: this.catalogo.categorias(), datos }).subscribe({
      next: ({ categorias, datos }) => {
        const cat = categorias.find((c) => String(c.id) === f.categoriaId);
        if (cat) this.categoria.set(cat.nombre);
        if (this.esInventario) this.piezas.set(datos as Producto[]);
        else this.movimientos.set(datos as Movimiento[]);
        // Se espera a que se dibuje la tabla y luego se abre el diálogo de imprimir
        setTimeout(() => window.print(), 400);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  protected imprimir(): void {
    window.print();
  }

  protected cerrar(): void {
    window.close();
  }
}
