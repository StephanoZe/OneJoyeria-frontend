import { AfterViewInit, Component, ElementRef, ViewChild, input, output } from '@angular/core';

/** Ventana para confirmar una eliminación. */
@Component({
  selector: 'app-confirmar-dialogo',
  template: `
    <dialog #dlg (cancel)="$event.preventDefault(); cancelar.emit()">
      <div class="dialog-head">
        <h2>{{ titulo() }}</h2>
        <p><strong>{{ destacado() }}</strong> {{ mensaje() }}</p>
      </div>
      <div class="dialog-body">
        @if (error()) { <div class="form-error">{{ error() }}</div> }
      </div>
      <div class="dialog-foot">
        <button type="button" class="btn btn-line" (click)="cancelar.emit()">Cancelar</button>
        <button type="button" class="btn btn-danger" [disabled]="procesando()" (click)="confirmar.emit()">{{ textoBoton() }}</button>
      </div>
    </dialog>`,
})
export class ConfirmarDialogo implements AfterViewInit {
  readonly titulo = input.required<string>();
  readonly destacado = input('');
  readonly mensaje = input('');
  readonly textoBoton = input('Eliminar');
  readonly procesando = input(false);
  readonly error = input('');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  @ViewChild('dlg') private dlg!: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void {
    this.dlg.nativeElement.showModal();
  }
}
