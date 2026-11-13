import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Componente raíz: sólo muestra la pantalla que corresponde a la ruta. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {}
