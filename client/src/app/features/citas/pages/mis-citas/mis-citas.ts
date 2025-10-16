import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../../Core/services/cita.service';
import { AuthService } from '../../../../Core/services/auth.service';



@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  loading = false;
  error: string | null = null;
  pacienteId: number = 0;
  nombrePaciente: string = '';
  
  // Para modal de cancelar
  mostrarModalCancelar = false;
  citaACancelar: any = null;
  motivoCancelacion = '';

  // Para modal de reprogramar
  mostrarModalReprogramar = false;
  citaAReprogramar: any = null;
  nuevaFecha = '';
  nuevaHora = '';

  constructor(private citaService: CitaService, private authService: AuthService) {}

   ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.rol === 'paciente') {
      this.pacienteId = user.id;
      this.nombrePaciente = `${user.nombre} ${user.apellido}`;
      this.cargarCitas();
    } else {
      this.error = 'Debe iniciar sesión como paciente';
    }
  }

  cargarCitas(): void {
    this.loading = true;
    this.citaService.obtenerCitasPaciente(this.pacienteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.citas = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.error = 'Error al cargar las citas';
        this.loading = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      'solicitada': 'estado-solicitada',
      'confirmada': 'estado-confirmada',
      'cancelada': 'estado-cancelada',
      'completada': 'estado-completada'
    };
    return clases[estado] || '';
  }

  puedeModificar(cita: any): boolean {
    const fechaCita = new Date(cita.fecha_cita);
    const ahora = new Date();
    return fechaCita > ahora && 
           (cita.estado === 'solicitada' || cita.estado === 'confirmada');
  }

  // Cancelar cita
  abrirModalCancelar(cita: any): void {
    this.citaACancelar = cita;
    this.motivoCancelacion = '';
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.citaACancelar = null;
    this.motivoCancelacion = '';
  }

  confirmarCancelar(): void {
    if (!this.citaACancelar) return;

    this.citaService.cancelarCita(this.citaACancelar.id, this.motivoCancelacion).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita cancelada exitosamente');
          this.cargarCitas();
          this.cerrarModalCancelar();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert(err.error?.error || 'Error al cancelar la cita');
      }
    });
  }

  // Reprogramar cita
  abrirModalReprogramar(cita: any): void {
    this.citaAReprogramar = cita;
    const fecha = new Date(cita.fecha_cita);
    this.nuevaFecha = fecha.toISOString().split('T')[0];
    this.nuevaHora = fecha.toTimeString().slice(0, 5);
    this.mostrarModalReprogramar = true;
  }

  cerrarModalReprogramar(): void {
    this.mostrarModalReprogramar = false;
    this.citaAReprogramar = null;
    this.nuevaFecha = '';
    this.nuevaHora = '';
  }

  confirmarReprogramar(): void {
    if (!this.citaAReprogramar || !this.nuevaFecha || !this.nuevaHora) {
      alert('Complete fecha y hora');
      return;
    }

    const fechaHora = `${this.nuevaFecha}T${this.nuevaHora}:00`;

    this.citaService.reprogramarCita(this.citaAReprogramar.id, fechaHora).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita reprogramada exitosamente');
          this.cargarCitas();
          this.cerrarModalReprogramar();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert(err.error?.error || 'Error al reprogramar la cita');
      }
    });
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}