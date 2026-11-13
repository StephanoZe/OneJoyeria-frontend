import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../../services/proveedor';
import { AvisoService } from '../../services/aviso';
import { Proveedor } from '../../models/proveedor';
import { fmt, mensajeError } from '../../utils/formato';
import { Icono } from '../compartido/icono';
import { Estado } from '../compartido/estado';
import { ConfirmarDialogo } from '../compartido/confirmar-dialogo';

/** Ficha del proveedor con sus datos de contacto y las piezas que suministra. */
@Component({
  selector: 'app-proveedor-detalle',
  imports: [RouterLink, Icono, Estado, ConfirmarDialogo],
  templateUrl: './proveedor-detalle.html',
})
export class ProveedorDetalle implements OnInit {
  private proveedorService = inject(ProveedorService);
  private avisos = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly fmt = fmt;
  protected readonly proveedor = signal<Proveedor | null>(null);
  protected readonly error = signal('');
  protected readonly confirmando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly errorEliminar = signal('');

  protected readonly piezas = computed(() => this.proveedor()?.productos ?? []);
  protected readonly unidades = computed(() => this.piezas().reduce((s, p) => s + p.stockActual, 0));

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.proveedorService.obtener(id).subscribe({
      next: (p) => this.proveedor.set(p),
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  protected telefonoLimpio(t: string): string {
    return t.replace(/\s/g, '');
  }

  protected eliminar(): void {
    const p = this.proveedor();
    if (!p) return;
    this.eliminando.set(true);
    this.proveedorService.eliminar(p.id).subscribe({
      next: () => {
        this.avisos.mostrar(`Proveedor eliminado: ${p.nombre}.`);
        this.router.navigate(['/proveedores']);
      },
      error: (err) => {
        this.errorEliminar.set(mensajeError(err));
        this.eliminando.set(false);
      },
    });
  }
}
