import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../../services/proveedor';
import { AvisoService } from '../../services/aviso';
import { ProveedorRequest } from '../../models/proveedor';
import { mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';

/** Formulario para registrar o editar un proveedor. */
@Component({
  selector: 'app-proveedor-form',
  imports: [FormsModule, RouterLink, Icono],
  templateUrl: './proveedor-form.html',
})
export class ProveedorForm implements OnInit {
  private proveedorService = inject(ProveedorService);
  private avisos = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Id del proveedor si se está editando; null si es nuevo. */
  protected id: number | null = null;
  protected nombreOriginal = '';
  protected readonly cargando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly faltaNombre = signal(false);

  protected form: ProveedorRequest = {
    nombre: '', ruc: '', contacto: '', telefono: '', email: '', direccion: '', suministra: '', observaciones: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.id = Number(id);
    this.cargando.set(true);
    this.proveedorService.obtener(this.id).subscribe({
      next: (p) => {
        this.nombreOriginal = p.nombre;
        this.form = {
          nombre: p.nombre, ruc: p.ruc ?? '', contacto: p.contacto ?? '', telefono: p.telefono ?? '',
          email: p.email ?? '', direccion: p.direccion ?? '', suministra: p.suministra ?? '', observaciones: p.observaciones ?? '',
        };
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    this.faltaNombre.set(!this.form.nombre.trim());
    if (this.faltaNombre()) return;

    this.enviando.set(true);
    this.error.set('');
    const peticion = this.id
      ? this.proveedorService.actualizar(this.id, this.form)
      : this.proveedorService.crear(this.form);

    peticion.subscribe({
      next: (p) => {
        this.avisos.mostrar(this.id ? `Cambios guardados en ${p.nombre}.` : `Proveedor registrado: ${p.nombre}.`);
        this.router.navigate(['/proveedores', p.id]);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
