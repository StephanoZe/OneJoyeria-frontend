import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogoService } from '../../services/catalogo';
import { ProductoService } from '../../services/producto';
import { AvisoService } from '../../services/aviso';
import { Producto } from '../../models/producto';
import { Opcion } from '../../models/opcion';
import { fmt, mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';
import { Estado } from '../compartido/estado';
import { Material } from '../compartido/material';
import { Medidor } from '../compartido/medidor';
import { MovimientoDialogo } from '../compartido/movimiento-dialogo';
import { ConfirmarDialogo } from '../compartido/confirmar-dialogo';

/** Inventario: catálogo agrupado por tipo de joya, con búsqueda, filtros y acciones. */
@Component({
  selector: 'app-inventario',
  imports: [RouterLink, Icono, Estado, Material, Medidor, MovimientoDialogo, ConfirmarDialogo],
  templateUrl: './inventario.html',
})
export class Inventario implements OnInit {
  private productoService = inject(ProductoService);
  private catalogo = inject(CatalogoService);
  private avisos = inject(AvisoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected readonly fmt = fmt;
  protected readonly estados = [
    { valor: '', texto: 'Todos los estados' },
    { valor: 'ok', texto: 'Disponible' },
    { valor: 'bajo', texto: 'Stock bajo' },
    { valor: 'agotado', texto: 'Agotado' },
  ];

  protected readonly categorias = signal<Opcion[]>([]);
  protected readonly piezas = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  // Filtros (también se guardan en la dirección: /inventario?categoria=1&estado=bajo)
  protected readonly busqueda = signal('');
  protected readonly categoriaId = signal('');
  protected readonly estado = signal('');

  // Diálogos abiertos
  protected readonly piezaMovimiento = signal<Producto | null>(null);
  protected readonly piezaEliminar = signal<Producto | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly errorEliminar = signal('');

  /** Texto inicial de la caja de búsqueda (luego la caja se maneja sola). */
  protected textoInicial = '';
  private temporizador?: ReturnType<typeof setTimeout>;

  /** Piezas agrupadas por categoría, en el orden de la vitrina. */
  protected readonly grupos = computed(() =>
    this.categorias()
      .map((c) => {
        const lista = this.piezas().filter((p) => p.categoriaId === c.id);
        return { categoria: c, piezas: lista, unidades: lista.reduce((s, p) => s + p.stockActual, 0) };
      })
      .filter((g) => g.piezas.length > 0));

  protected readonly hayFiltros = computed(() => !!(this.busqueda() || this.categoriaId() || this.estado()));

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.busqueda.set(q.get('q') ?? '');
    this.textoInicial = this.busqueda();
    this.categoriaId.set(q.get('categoria') ?? '');
    this.estado.set(q.get('estado') ?? '');

    this.catalogo.categorias().subscribe({
      next: (c) => this.categorias.set(c),
      error: (err) => this.error.set(mensajeError(err)),
    });
    this.cargar();
  }

  protected cargar(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.busqueda() || null, categoria: this.categoriaId() || null, estado: this.estado() || null },
      replaceUrl: true,
    });
    this.cargando.set(true);
    this.productoService
      .listar({ busqueda: this.busqueda(), categoriaId: this.categoriaId(), estado: this.estado() })
      .subscribe({
        next: (lista) => {
          this.piezas.set(lista);
          this.error.set('');
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  /** Espera a que el usuario deje de escribir antes de buscar. */
  protected buscar(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda.set(texto.trim());
      this.cargar();
    }, 250);
  }

  protected elegirCategoria(id: number | ''): void {
    this.categoriaId.set(String(id));
    this.cargar();
  }

  protected elegirEstado(valor: string): void {
    this.estado.set(valor);
    this.cargar();
  }

  protected quitarFiltros(): void {
    this.busqueda.set('');
    this.categoriaId.set('');
    this.estado.set('');
    this.cargar();
  }

  protected abrir(p: Producto): void {
    this.router.navigate(['/inventario', p.codigo]);
  }

  protected movimientoRegistrado(): void {
    this.piezaMovimiento.set(null);
    this.cargar();
  }

  protected confirmarEliminar(): void {
    const p = this.piezaEliminar();
    if (!p) return;
    this.eliminando.set(true);
    this.errorEliminar.set('');
    this.productoService.eliminar(p.codigo).subscribe({
      next: () => {
        // Respuesta 204: se quita de la lista
        this.avisos.mostrar(`Pieza eliminada: ${p.nombre}.`);
        this.piezas.update((lista) => lista.filter((x) => x.id !== p.id));
        this.piezaEliminar.set(null);
        this.eliminando.set(false);
        this.productoService.refrescarContador();
      },
      error: (err) => {
        this.errorEliminar.set(mensajeError(err));
        this.eliminando.set(false);
      },
    });
  }

  protected cerrarEliminar(): void {
    this.piezaEliminar.set(null);
    this.errorEliminar.set('');
  }
}
