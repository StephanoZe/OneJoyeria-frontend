import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../services/producto';
import { AvisoService } from '../../services/aviso';
import { Producto } from '../../models/producto';
import { Movimiento, TipoMovimiento as Tipo } from '../../models/movimiento';
import { fmt, mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';
import { Estado } from '../compartido/estado';
import { TipoMovimiento } from '../compartido/tipo-movimiento';
import { MovimientoDialogo } from '../compartido/movimiento-dialogo';
import { ConfirmarDialogo } from '../compartido/confirmar-dialogo';

/** Ficha de una pieza con su stock e historial de movimientos. */
@Component({
  selector: 'app-pieza-detalle',
  imports: [RouterLink, Icono, Estado, TipoMovimiento, MovimientoDialogo, ConfirmarDialogo],
  templateUrl: './pieza-detalle.html',
})
export class PiezaDetalle implements OnInit {
  private productoService = inject(ProductoService);
  private avisos = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly fmt = fmt;
  protected readonly pieza = signal<Producto | null>(null);
  protected readonly historial = signal<Movimiento[]>([]);
  protected readonly error = signal('');

  protected readonly dialogoTipo = signal<Tipo | null>(null);
  protected readonly confirmando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly errorEliminar = signal('');

  /** Unidades que faltan para llegar al mínimo (negativo si está por encima). */
  protected readonly faltan = computed(() => {
    const p = this.pieza();
    return p ? p.stockMinimo - p.stockActual : 0;
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo') ?? '';
    forkJoin({ p: this.productoService.obtener(codigo), h: this.productoService.historial(codigo) }).subscribe({
      next: ({ p, h }) => {
        this.pieza.set(p);
        this.historial.set(h);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  /** Para una entrada se sugiere llevar la pieza al doble de su mínimo. */
  protected sugerida(): number {
    const p = this.pieza();
    return p && this.dialogoTipo() === 'Entrada' && this.faltan() >= 0 ? this.faltan() + p.stockMinimo : 1;
  }

  protected movimientoRegistrado(): void {
    this.dialogoTipo.set(null);
    this.cargar();
  }

  protected eliminar(): void {
    const p = this.pieza();
    if (!p) return;
    this.eliminando.set(true);
    this.productoService.eliminar(p.codigo).subscribe({
      next: () => {
        this.avisos.mostrar(`Pieza eliminada: ${p.nombre}.`);
        this.router.navigate(['/inventario']);
      },
      error: (err) => {
        this.errorEliminar.set(mensajeError(err));
        this.eliminando.set(false);
      },
    });
  }
}
