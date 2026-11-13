import { AfterViewInit, Component, ElementRef, ViewChild, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { Movimiento, TipoMovimiento } from '../../models/movimiento';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { AvisoService } from '../../services/aviso';
import { mensajeError } from '../../utils/formato';

/** Ventana para registrar una entrada o salida de stock, con vista previa del resultado. */
@Component({
  selector: 'app-movimiento-dialogo',
  templateUrl: './movimiento-dialogo.html',
})
export class MovimientoDialogo implements OnInit, AfterViewInit {
  private productoService = inject(ProductoService);
  private auth = inject(AuthService);
  private avisos = inject(AvisoService);

  readonly pieza = input.required<Producto>();
  readonly tipoInicial = input<TipoMovimiento>('Entrada');
  readonly sugerida = input(1);
  readonly registrado = output<Movimiento>();
  readonly cerrado = output<void>();

  @ViewChild('dlg') private dlg!: ElementRef<HTMLDialogElement>;
  @ViewChild('cantidadInput') private cantidadInput!: ElementRef<HTMLInputElement>;

  protected readonly tipo = signal<TipoMovimiento>('Entrada');
  protected readonly cantidad = signal(1);
  protected readonly responsable = signal('');
  protected readonly observaciones = signal('');
  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  /** Stock que quedaría después del movimiento. */
  protected readonly resultado = computed(() =>
    this.tipo() === 'Entrada' ? this.pieza().stockActual + this.cantidad() : this.pieza().stockActual - this.cantidad());

  protected readonly invalido = computed(() => this.resultado() < 0 || this.cantidad() < 1);

  protected readonly claseResultado = computed(() =>
    this.resultado() < 0 ? 'bad' : this.tipo() === 'Entrada' ? 'up' : 'down');

  protected readonly nota = computed(() => {
    const p = this.pieza();
    if (this.tipo() === 'Salida' && p.stockActual === 0) return 'La pieza está agotada: no se puede registrar una salida.';
    if (this.resultado() < 0) return `Sólo hay ${p.stockActual} unidades disponibles.`;
    if (this.cantidad() < 1) return 'Ingresa una cantidad mayor a 0.';
    if (this.resultado() === 0) return 'La pieza quedará agotada.';
    if (this.resultado() <= p.stockMinimo) return `Quedará en stock bajo (mínimo ${p.stockMinimo}).`;
    return '';
  });

  ngOnInit(): void {
    this.tipo.set(this.tipoInicial());
    this.cantidad.set(Math.max(1, this.sugerida()));
    this.responsable.set(this.auth.sesion()?.nombre ?? '');
  }

  ngAfterViewInit(): void {
    this.dlg.nativeElement.showModal();
    this.cantidadInput.nativeElement.select();
  }

  protected leerCantidad(valor: string): void {
    this.cantidad.set(parseInt(valor, 10) || 0);
  }

  protected registrar(): void {
    if (this.invalido()) return;
    this.enviando.set(true);
    this.error.set('');
    this.productoService.registrarMovimiento(this.pieza().codigo, {
      tipoMovimiento: this.tipo(),
      cantidad: this.cantidad(),
      responsable: this.responsable(),
      observaciones: this.observaciones(),
    }).subscribe({
      next: (m) => {
        this.avisos.mostrar(`${m.tipoMovimiento} registrada: ${this.pieza().nombre} pasó de ${m.stockAnterior} a ${m.stockNuevo} unidades.`);
        this.productoService.refrescarContador();
        this.registrado.emit(m);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
