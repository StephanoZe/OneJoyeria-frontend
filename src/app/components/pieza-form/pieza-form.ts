import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CatalogoService } from '../../services/catalogo';
import { ProductoService } from '../../services/producto';
import { ProveedorService } from '../../services/proveedor';
import { AvisoService } from '../../services/aviso';
import { Opcion } from '../../models/opcion';
import { Proveedor } from '../../models/proveedor';
import { ProductoRequest } from '../../models/producto';
import { mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';

/** Formulario para registrar una pieza nueva o editar una existente. */
@Component({
  selector: 'app-pieza-form',
  imports: [FormsModule, RouterLink, Icono],
  templateUrl: './pieza-form.html',
})
export class PiezaForm implements OnInit {
  private productoService = inject(ProductoService);
  private catalogo = inject(CatalogoService);
  private proveedorService = inject(ProveedorService);
  private avisos = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Código de la pieza si se está editando; null si es nueva. */
  protected codigoOriginal: string | null = null;
  protected nombreOriginal = '';

  protected readonly categorias = signal<Opcion[]>([]);
  protected readonly materiales = signal<Opcion[]>([]);
  protected readonly proveedores = signal<Proveedor[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly faltan = signal<string[]>([]);

  protected form: ProductoRequest = {
    codigo: '', nombre: '', descripcion: '', categoriaId: null, materialId: null,
    proveedorId: null, precio: null, stockActual: 0, stockMinimo: 3,
  };

  ngOnInit(): void {
    this.codigoOriginal = this.route.snapshot.paramMap.get('codigo');
    forkJoin({
      categorias: this.catalogo.categorias(),
      materiales: this.catalogo.materiales(),
      proveedores: this.proveedorService.listar(),
      pieza: this.codigoOriginal ? this.productoService.obtener(this.codigoOriginal) : of(null),
    }).subscribe({
      next: ({ categorias, materiales, proveedores, pieza }) => {
        this.categorias.set(categorias);
        this.materiales.set(materiales);
        this.proveedores.set(proveedores);
        if (pieza) {
          this.nombreOriginal = pieza.nombre;
          this.form = {
            codigo: pieza.codigo, nombre: pieza.nombre, descripcion: pieza.descripcion ?? '',
            categoriaId: pieza.categoriaId, materialId: pieza.materialId, proveedorId: pieza.proveedorId,
            precio: pieza.precio, stockActual: pieza.stockActual, stockMinimo: pieza.stockMinimo,
          };
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected falta(campo: string): boolean {
    return this.faltan().includes(campo);
  }

  protected guardar(): void {
    const f = this.form;
    const faltan: string[] = [];
    if (!f.nombre.trim()) faltan.push('nombre');
    if (f.precio === null || f.precio === undefined) faltan.push('precio');
    if (!f.categoriaId) faltan.push('categoriaId');
    if (!f.materialId) faltan.push('materialId');
    if (f.stockMinimo === null || f.stockMinimo === undefined) faltan.push('stockMinimo');
    this.faltan.set(faltan);
    if (faltan.length) return;

    const datos: ProductoRequest = { ...f, codigo: f.codigo?.trim() || null };
    if (this.codigoOriginal) delete datos.stockActual;

    this.enviando.set(true);
    this.error.set('');
    const peticion = this.codigoOriginal
      ? this.productoService.actualizar(this.codigoOriginal, datos)
      : this.productoService.crear(datos);

    peticion.subscribe({
      next: (p) => {
        this.avisos.mostrar(this.codigoOriginal ? `Cambios guardados en ${p.nombre}.` : `Pieza registrada: ${p.nombre} (${p.codigo}).`);
        this.router.navigate(['/inventario', p.codigo]);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.enviando.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
}
