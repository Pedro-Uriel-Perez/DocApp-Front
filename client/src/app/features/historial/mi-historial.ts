import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../Core/services/historial.service';
import { AuthService } from '../../Core/services/auth.service';

@Component({
  selector: 'app-mi-historial',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './mi-historial.html',
  styleUrl: './mi-historial.css'
})
export class MiHistorialComponent implements OnInit {
  historiales: any[] = [];
  loading = false;
  error: string | null = null;
  pacienteId: number = 0;
  nombrePaciente: string = '';

  // Modal de detalle
  mostrarModalDetalle = false;
  consultaSeleccionada: any = null;
  recetasConsulta: any[] = [];

  constructor(
    private historialService: HistorialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.rol === 'paciente') {
      this.pacienteId = user.id;
      this.nombrePaciente = `${user.nombre} ${user.apellido}`;
      this.cargarHistorial();
    } else {
      this.error = 'Debe iniciar sesión como paciente';
    }
  }

  cargarHistorial(): void {
    this.loading = true;
    this.historialService.obtenerHistorialPaciente(this.pacienteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.historiales = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.error = 'Error al cargar el historial médico';
        this.loading = false;
      }
    });
  }

  verDetalle(historial: any): void {
  this.loading = true;
  this.historialService.obtenerDetalleConsulta(historial.id).subscribe({
    next: (response) => {
      if (response.success) {
        this.consultaSeleccionada = response.data.historial;
        this.recetasConsulta = response.data.recetas || [];
        this.mostrarModalDetalle = true;
        document.body.classList.add('modal-open'); // ← AGREGA ESTO
      }
      this.loading = false;
    },
    error: (err) => {
      console.error('Error:', err);
      alert('Error al obtener detalle de la consulta');
      this.loading = false;
    }
  });
}

  cerrarDetalle(): void {
  this.mostrarModalDetalle = false;
  this.consultaSeleccionada = null;
  this.recetasConsulta = [];
  document.body.classList.remove('modal-open'); // ← AGREGA ESTO
}

  calcularIMC(peso: number, altura: number): string {
    if (!peso || !altura) return 'N/A';
    const imc = peso / (altura * altura);
    return imc.toFixed(1);
  }

  getIMCClass(peso: number, altura: number): string {
    if (!peso || !altura) return '';
    const imc = peso / (altura * altura);
    if (imc < 18.5) return 'bajo-peso';
    if (imc < 25) return 'normal';
    if (imc < 30) return 'sobrepeso';
    return 'obesidad';
  }

  imprimirReceta(): void {
    window.print();
  }
}