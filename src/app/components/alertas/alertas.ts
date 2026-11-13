import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';
import { mensajeError } from '../../utils/formato';
import { Material } from '../compartido/material';
import { MovimientoDialogo } from '../compartido/movimiento-dialogo';

/** Piezas agotadas o en su stock mínimo, con reposición rápida. */
@Component({
  selector: 'app-alertas',
  imports: [RouterLink, Material, MovimientoDialogo],
  templateUrl: './alertas.html',
})
export class Alertas implements OnInit {
  private productoService = inject(ProductoService);

  protected readonly alertas = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly reponiendo = signal<Producto | null>(null);

  /** Dos grupos: primero las agotadas, luego las que están en su mínimo. */
  protected readonly secciones = computed(() => {
    const agotadas = this.alertas().filter((p) => p.estado === 'Agotado');
    const bajas = this.alertas().filter((p) => p.estado !== 'Agotado');
    return [
      { titulo: 'Agotadas', detalle: `${agotadas.length} pieza${agotadas.length === 1 ? '' : 's'} sin unidades para vender`, piezas: agotadas },
      { titulo: 'En su stock mínimo', detalle: `${bajas.length} pieza${bajas.length === 1 ? '' : 's'} con pocas unidades`, piezas: bajas },
    ].filter((s) => s.piezas.length > 0);
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.productoService.alertas().subscribe({
      next: (lista) => {
        this.alertas.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  /** Cantidad sugerida: lleva la pieza al doble de su mínimo. */
  protected sugerida(p: Producto): number {
    return Math.max(1, p.stockMinimo * 2 - p.stockActual);
  }

  protected repuesta(): void {
    this.reponiendo.set(null);
    this.cargar();
  }
}
