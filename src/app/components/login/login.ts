import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { mensajeError } from '../../utils/formato';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected usuario = '';
  protected contrasena = '';
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly faltan = signal(false);

  constructor() {
    if (this.auth.sesion()) this.router.navigate(['/panel']);
  }

  protected entrar(): void {
    this.error.set('');
    this.faltan.set(!this.usuario.trim() || !this.contrasena);
    if (this.faltan()) return;

    this.enviando.set(true);
    this.auth.login(this.usuario.trim(), this.contrasena).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (err) => {
        this.error.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }
}
