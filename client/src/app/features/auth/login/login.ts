import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../Core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 onSubmit(): void {
  if (!this.email || !this.password) {
    this.error = 'Complete todos los campos';
    return;
  }

  this.loading = true;
  this.error = null;

  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      if (response.success && response.user) {
        // Redirigir según rol
        if (response.user.rol === 'medico') {
          this.router.navigate(['/medico/citas']);
        } else if (response.user.rol === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (response.user.rol === 'paciente') {
          this.router.navigate(['/solicitar-cita']); // ← CAMBIAR DE '/' a '/solicitar-cita'
        } else {
          this.router.navigate(['/solicitar-cita']); // ← Por defecto también
        }
      } else {
        this.error = response.error || 'Error al iniciar sesión';
      }
      this.loading = false;
    },
    error: (err) => {
      console.error('Error:', err);
      this.error = err.error?.error || 'Error al iniciar sesión';
      this.loading = false;
    }
  });
}
}