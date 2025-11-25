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

  // Especialidad del médico que atendió
  especialidadActual: string = '';

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
        this.especialidadActual = historial.especialidad || '';
        this.mostrarModalDetalle = true;
        document.body.classList.add('modal-open');
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



// Detectar tipo de especialidad
esNutricion(): boolean {
  return this.especialidadActual?.toLowerCase().includes('nutrición') ||
         this.especialidadActual?.toLowerCase().includes('nutricion') ||
         this.especialidadActual?.toLowerCase().includes('nutriólogo') ||
         this.especialidadActual?.toLowerCase().includes('nutricionist');
}

esCardiologia(): boolean {
  return this.especialidadActual?.toLowerCase().includes('cardiología') ||
         this.especialidadActual?.toLowerCase().includes('cardiologia') ||
         this.especialidadActual?.toLowerCase().includes('cardiólogo');
}

esPediatria(): boolean {
  return this.especialidadActual?.toLowerCase().includes('pediatría') ||
         this.especialidadActual?.toLowerCase().includes('pediatria') ||
         this.especialidadActual?.toLowerCase().includes('pediatra');
}

esPsiquiatria(): boolean {
  return this.especialidadActual?.toLowerCase().includes('psiquiatría') ||
         this.especialidadActual?.toLowerCase().includes('psiquiatria') ||
         this.especialidadActual?.toLowerCase().includes('psiquiatra');
}

esOdontologia(): boolean {
  return this.especialidadActual?.toLowerCase().includes('odontología') ||
         this.especialidadActual?.toLowerCase().includes('odontologia') ||
         this.especialidadActual?.toLowerCase().includes('dental');
}

esDermatologia(): boolean {
  return this.especialidadActual?.toLowerCase().includes('dermatología') ||
         this.especialidadActual?.toLowerCase().includes('dermatologia') ||
         this.especialidadActual?.toLowerCase().includes('dermatólogo');
}

esTraumatologia(): boolean {
  return this.especialidadActual?.toLowerCase().includes('traumatología') ||
         this.especialidadActual?.toLowerCase().includes('traumatologia') ||
         this.especialidadActual?.toLowerCase().includes('traumatólogo') ||
         this.especialidadActual?.toLowerCase().includes('ortopedia');
}

// Títulos dinámicos según especialidad
getTituloRecetas(): string {
  if (this.esNutricion()) {
    return '🥗 Plan Alimenticio';
  } else if (this.esPediatria()) {
    return '👶 Medicamentos Pediátricos';
  } else if (this.esPsiquiatria()) {
    return '💊 Tratamiento Psiquiátrico';
  } else if (this.esOdontologia()) {
    return '🦷 Tratamiento Dental';
  } else if (this.esDermatologia()) {
    return '🧴 Tratamiento Dermatológico';
  } else if (this.esCardiologia()) {
    return '❤️ Tratamiento Cardiovascular';
  } else if (this.esTraumatologia()) {
    return '🦴 Tratamiento Traumatológico';
  }

  return '💊 Medicamentos Recetados';
}

getTituloDiagnostico(): string {
  if (this.esNutricion()) {
    return '📊 Evaluación Nutricional';
  } else if (this.esPsiquiatria()) {
    return '🧠 Evaluación Psiquiátrica';
  } else if (this.esOdontologia()) {
    return '🦷 Diagnóstico Dental';
  }
  return '🩺 Diagnóstico';
}

getTituloSignosVitales(): string {
  if (this.esNutricion()) {
    return '⚖️ Medidas Antropométricas';
  } else if (this.esCardiologia()) {
    return '❤️ Evaluación Cardiovascular';
  } else if (this.esPediatria()) {
    return '👶 Signos Vitales Pediátricos';
  }
  return '❤️ Signos Vitales';
}

getLabelDosis(): string {
  if (this.esNutricion()) {
    return 'Porción';
  } else if (this.esOdontologia()) {
    return 'Aplicación';
  } else if (this.esDermatologia()) {
    return 'Cantidad';
  }
  return 'Dosis';
}

getLabelFrecuencia(): string {
  if (this.esNutricion()) {
    return 'Horario';
  } else if (this.esPsiquiatria()) {
    return 'Toma';
  } else if (this.esOdontologia()) {
    return 'Aplicación';
  }
  return 'Frecuencia';
}

getLabelDuracion(): string {
  if (this.esNutricion()) {
    return 'Preparación';
  } else if (this.esPsiquiatria()) {
    return 'Periodo';
  } else if (this.esOdontologia()) {
    return 'Tratamiento';
  }
  return 'Duración';
}

getLabelIndicaciones(): string {
  if (this.esNutricion()) {
    return 'Notas / Preparación';
  } else if (this.esPsiquiatria()) {
    return 'Observaciones';
  } else if (this.esOdontologia()) {
    return 'Instrucciones';
  }
  return 'Indicaciones';
}
}