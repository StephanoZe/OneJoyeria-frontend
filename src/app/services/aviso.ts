import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  texto: string;
  error: boolean;
}

/** Mensajes breves que aparecen abajo a la derecha (por ejemplo "Pieza registrada"). */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  readonly avisos = signal<Aviso[]>([]);
  private siguiente = 1;

  mostrar(texto: string, error = false): void {
    const aviso: Aviso = { id: this.siguiente++, texto, error };
    this.avisos.update((lista) => [...lista, aviso]);
    setTimeout(() => this.avisos.update((lista) => lista.filter((a) => a.id !== aviso.id)), 4200);
  }
}
