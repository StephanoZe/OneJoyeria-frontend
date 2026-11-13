import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ProductoService } from '../../services/producto';
import { AvisoService } from '../../services/aviso';

/** Estructura común: barra superior con el menú, contenido de cada sección y avisos. */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
})
export class Layout {
  protected auth = inject(AuthService);
  protected productoService = inject(ProductoService);
  protected avisoService = inject(AvisoService);
  private router = inject(Router);

  constructor() {
    this.productoService.refrescarContador();
    // Cada vez que cambia de sección: volver arriba y actualizar el contador de alertas
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      this.productoService.refrescarContador();
    });
  }

  protected salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
