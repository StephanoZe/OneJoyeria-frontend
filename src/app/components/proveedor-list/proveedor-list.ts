import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../../services/proveedor';
import { Proveedor } from '../../models/proveedor';
import { mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';

/** Listado de proveedores con búsqueda por razón social, RUC, contacto o material. */
@Component({
  selector: 'app-proveedor-list',
  imports: [RouterLink, Icono],
  templateUrl: './proveedor-list.html',
})
export class ProveedorList implements OnInit {
  private proveedorService = inject(ProveedorService);
  private router = inject(Router);

  protected readonly proveedores = signal<Proveedor[]>([]);
  protected readonly busqueda = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  private temporizador?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.cargar();
  }

  protected buscar(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda.set(texto.trim());
      this.cargar();
    }, 250);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.proveedorService.listar(this.busqueda()).subscribe({
      next: (lista) => {
        this.proveedores.set(lista);
        this.error.set('');
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected abrir(p: Proveedor): void {
    this.router.navigate(['/proveedores', p.id]);
  }
}
