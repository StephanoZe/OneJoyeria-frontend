import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CatalogoService } from '../../services/catalogo';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { Panel as DatosPanel } from '../../models/panel';
import { Producto } from '../../models/producto';
import { claseEstado, fmt, mensajeError } from '../../utils/formato';
import { Estado } from '../compartido/estado';
import { TipoMovimiento } from '../compartido/tipo-movimiento';

/** Panel principal: bandeja por tipo de joya, cifras, gráfico semanal y reposición. */
@Component({
  selector: 'app-panel',
  imports: [RouterLink, Estado, TipoMovimiento],
  templateUrl: './panel.html',
})
export class Panel implements OnInit {
  private catalogo = inject(CatalogoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  protected auth = inject(AuthService);

  protected readonly fmt = fmt;
  protected readonly claseEstado = claseEstado;
  protected readonly datos = signal<DatosPanel | null>(null);
  protected readonly piezas = signal<Producto[]>([]);
  protected readonly error = signal('');

  protected readonly saludo = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  })();

  // Medidas del gráfico de barras (en unidades del SVG)
  protected readonly g = { ancho: 560, alto: 210, izq: 28, abajo: 28, arriba: 16 };

  /** Calcula las líneas guía y las barras del gráfico de la semana. */
  protected readonly grafico = computed(() => {
    const dias = this.datos()?.semana ?? [];
    const { ancho, alto, izq, abajo, arriba } = this.g;
    const max = Math.max(4, ...dias.flatMap((d) => [d.entradas, d.salidas]));
    const paso = Math.ceil(max / 4);
    const tope = paso * 4;
    const util = alto - abajo - arriba;
    const grupo = (ancho - izq) / Math.max(dias.length, 1);
    const barra = Math.min(18, grupo / 3.2);
    const y = (v: number) => arriba + util - (v / tope) * util;

    const lineas = [0, 1, 2, 3, 4].map((i) => ({ valor: i * paso, y: y(i * paso) }));
    const barras = dias.map((d, i) => {
      const cx = izq + grupo * i + grupo / 2;
      return {
        dia: d.dia, entradas: d.entradas, salidas: d.salidas, cx,
        xE: cx - barra - 2, yE: y(d.entradas), hE: (d.entradas / tope) * util,
        xS: cx + 2, yS: y(d.salidas), hS: (d.salidas / tope) * util,
      };
    });
    const total = dias.reduce((s, d) => s + d.entradas + d.salidas, 0);
    return { lineas, barras, barra, total };
  });

  ngOnInit(): void {
    forkJoin({ panel: this.catalogo.panel(), piezas: this.productoService.listar() }).subscribe({
      next: ({ panel, piezas }) => {
        this.datos.set(panel);
        this.piezas.set(piezas);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  /** Piezas de un tipo de joya: cada una se dibuja como una "cuenta" en su compartimento. */
  protected piezasDe(categoriaId: number): Producto[] {
    return this.piezas().filter((p) => p.categoriaId === categoriaId);
  }

  protected irA(codigo: string): void {
    this.router.navigate(['/inventario', codigo]);
  }
}
