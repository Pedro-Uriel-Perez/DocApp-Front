import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  verificarForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  mostrarPassword = false;
  mostrarConfirmPassword = false;

  // Control del modal
  mostrarModal = false;
  emailRegistrado = '';
  verificando = false;
  errorVerificacion: string | null = null;
  successVerificacion = false;
  reenviando = false;
  countdown = 60;
  canResend = true;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    this.verificarForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/), Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const isLengthValid = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isLengthValid;

    return passwordValid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        isLengthValid
      }
    };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registroForm.controls;
  }

  get fv() {
    return this.verificarForm.controls;
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.mostrarPassword = !this.mostrarPassword;
    } else {
      this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.registroForm.invalid) {
      return;
    }

    this.loading = true;
    const { confirmPassword, ...datos } = this.registroForm.value;

    this.authService.register(datos).subscribe({
      next: (response) => {
        if (response.success) {
          this.emailRegistrado = datos.email;
          this.mostrarModal = true; // ✅ Abrir modal
          this.startCountdown();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.error = err.error?.error || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }

  // ✅ NUEVO: Verificar código desde el modal
  verificarCodigo(): void {
    this.errorVerificacion = null;

    if (this.verificarForm.invalid) {
      return;
    }

    this.verificando = true;
    const codigo = this.verificarForm.value.codigo;

    this.authService.verificarEmail(this.emailRegistrado, codigo).subscribe({
      next: (response) => {
        if (response.success) {
          this.successVerificacion = true;
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/solicitar-cita']);
          }, 2000);
        }
        this.verificando = false;
      },
      error: (err) => {
        console.error('Error al verificar:', err);
        this.errorVerificacion = err.error?.error || 'Código inválido o expirado';
        this.verificando = false;
      }
    });
  }

  // ✅ NUEVO: Reenviar código
  reenviarCodigo(): void {
    if (!this.canResend) return;

    this.reenviando = true;
    this.errorVerificacion = null;

    this.authService.reenviarCodigo(this.emailRegistrado).subscribe({
      next: (response) => {
        if (response.success) {
          this.startCountdown();
        }
        this.reenviando = false;
      },
      error: (err) => {
        console.error('Error al reenviar:', err);
        this.errorVerificacion = err.error?.error || 'Error al reenviar código';
        this.reenviando = false;
      }
    });
  }

  // ✅ NUEVO: Cerrar modal (cancelar)
  cerrarModal(): void {
    this.mostrarModal = false;
    this.verificarForm.reset();
    this.errorVerificacion = null;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // ✅ NUEVO: Countdown para reenviar
  private startCountdown(): void {
    this.canResend = false;
    this.countdown = 60;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  // ✅ NUEVO: Solo números en el input
  onCodigoInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    this.verificarForm.patchValue({ codigo: value });
  }
}