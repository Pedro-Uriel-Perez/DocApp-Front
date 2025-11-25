import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../../Core/services/cita.service';
import { HistorialService } from '../../../../Core/services/historial.service';
import { AuthService } from '../../../../Core/services/auth.service';

@Component({
  selector: 'app-citas-medico',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './citas-medico.html',
  styleUrl: './citas-medico.css'
})
export class CitasMedicoComponent implements OnInit {
  citas: any[] = [];
  loading = false;
  error: string | null = null;
  medicoId: number = 0;
  nombreMedico: string = '';
  filtroEstado: string = 'todas';

  // --- NUEVO: Bandera de Especialidad ---
  esNutriologo: boolean = false;
  especialidadMedico: string = '';

  // Modal completar con historial médico
  mostrarModalCompletar = false;
  citaACompletar: any = null;
  
  // Datos del historial médico
  diagnostico: string = '';
  sintomas: string = '';
  exploracionFisica: string = '';
  presionArterial: string = '';
  temperatura: number | null = null;
  peso: number | null = null;
  altura: number | null = null;
  observaciones: string = '';
  planTratamiento: string = '';
  fechaSeguimiento: string = '';
  
  // Recetas médicas / plan alimenticio
  recetas: any[] = [];
  nuevaReceta = {
    medicamento_nombre: '',
    medicamento_generico: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    via_administracion: 'Oral',
    indicaciones: ''
  };

  // Modal rechazar
  mostrarModalRechazar = false;
  citaARechazar: any = null;
  motivoRechazo: string = '';

  constructor(
    private citaService: CitaService,
    private historialService: HistorialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.rol === 'medico') {
      this.medicoId = user.id;
      this.nombreMedico = `${user.nombre} ${user.apellido}`;

       // --- LÓGICA DE DETECCIÓN AUTOMÁTICA ---
      // Verificamos si en la sesión se guardó la especialidad
      // OJO: Si tu objeto user no tiene 'especialidad', el backend lo manejará,
      // pero para que el FRONT cambie los labels, necesitamos saberlo aquí.
      // Para la DEMO, si no tienes el dato, puedes forzarlo temporalmente así:
      // this.esNutriologo = false; // <--- DESCOMENTAR SOLO PARA PROBAR VISUALMENTE SI NO TIENES EL DATO

      const especialidad = user.especialidad || '';
      this.especialidadMedico = especialidad;
      this.esNutriologo = especialidad.toLowerCase().includes('nutrición');

      this.cargarCitas();
    } else {
      this.error = 'Debe iniciar sesión como médico';
    }
  }


   // --- GETTERS DINÁMICOS (La Magia del Frontend) ---

  // Detectores de especialidad
  esNutricion(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('nutrición') ||
           this.especialidadMedico?.toLowerCase().includes('nutricion') ||
           this.especialidadMedico?.toLowerCase().includes('nutriólogo');
  }

  esPediatria(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('pediatría') ||
           this.especialidadMedico?.toLowerCase().includes('pediatria') ||
           this.especialidadMedico?.toLowerCase().includes('pediatra');
  }

  esPsiquiatria(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('psiquiatría') ||
           this.especialidadMedico?.toLowerCase().includes('psiquiatria') ||
           this.especialidadMedico?.toLowerCase().includes('psiquiatra');
  }

  esOdontologia(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('odontología') ||
           this.especialidadMedico?.toLowerCase().includes('odontologia') ||
           this.especialidadMedico?.toLowerCase().includes('dental');
  }

  esDermatologia(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('dermatología') ||
           this.especialidadMedico?.toLowerCase().includes('dermatologia');
  }

  esCardiologia(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('cardiología') ||
           this.especialidadMedico?.toLowerCase().includes('cardiologia') ||
           this.especialidadMedico?.toLowerCase().includes('cardiólogo');
  }

  esTraumatologia(): boolean {
    return this.especialidadMedico?.toLowerCase().includes('traumatología') ||
           this.especialidadMedico?.toLowerCase().includes('traumatologia') ||
           this.especialidadMedico?.toLowerCase().includes('ortopedia');
  }

  get tituloSeccionItems(): string {
    if (this.esNutricion()) return '🥗 Plan Alimenticio';
    if (this.esPediatria()) return '👶 Medicamentos Pediátricos';
    if (this.esPsiquiatria()) return '💊 Tratamiento Psiquiátrico';
    if (this.esOdontologia()) return '🦷 Tratamiento Dental';
    if (this.esDermatologia()) return '🧴 Tratamiento Dermatológico';
    if (this.esCardiologia()) return '❤️ Tratamiento Cardiovascular';
    if (this.esTraumatologia()) return '🦴 Tratamiento Traumatológico';
    return '💊 Recetas Médicas';
  }

  get lblAgregarBtn(): string {
    if (this.esNutricion()) return 'Agregar Alimento';
    if (this.esPediatria()) return 'Agregar Medicamento Pediátrico';
    if (this.esOdontologia()) return 'Agregar Tratamiento';
    if (this.esDermatologia()) return 'Agregar Producto';
    return 'Agregar Medicamento';
  }

  get lblNombreItem(): string {
    if (this.esNutricion()) return 'Alimento / Platillo';
    if (this.esPediatria()) return 'Medicamento Pediátrico';
    if (this.esOdontologia()) return 'Tratamiento / Procedimiento';
    if (this.esDermatologia()) return 'Producto / Medicamento';
    if (this.esPsiquiatria()) return 'Medicamento Psiquiátrico';
    return 'Medicamento';
  }

  get placeholderNombre(): string {
    if (this.esNutricion()) return 'Ej. Pechuga de Pollo';
    if (this.esPediatria()) return 'Ej. Amoxicilina infantil';
    if (this.esOdontologia()) return 'Ej. Limpieza dental';
    if (this.esDermatologia()) return 'Ej. Crema hidratante';
    return 'Ej. Paracetamol';
  }

  get lblDosis(): string {
    if (this.esNutricion()) return 'Porción';
    if (this.esPediatria()) return 'Dosis Pediátrica';
    if (this.esOdontologia()) return 'Aplicación';
    if (this.esDermatologia()) return 'Cantidad';
    return 'Dosis';
  }

  get placeholderDosis(): string {
    if (this.esNutricion()) return 'Ej. 150g / 1 taza';
    if (this.esPediatria()) return 'Ej. 5ml / según peso';
    if (this.esOdontologia()) return 'Ej. 1 aplicación';
    if (this.esDermatologia()) return 'Ej. Capa fina';
    return 'Ej. 500mg';
  }

  get lblFrecuencia(): string {
    if (this.esNutricion()) return 'Horario';
    if (this.esPsiquiatria()) return 'Toma';
    if (this.esOdontologia()) return 'Frecuencia de Aplicación';
    return 'Frecuencia';
  }

  get placeholderFrecuencia(): string {
    if (this.esNutricion()) return 'Ej. Desayuno';
    if (this.esPediatria()) return 'Ej. Cada 8 horas';
    if (this.esOdontologia()) return 'Ej. 2 veces al día';
    return 'Ej. Cada 8 horas';
  }

  get lblDuracion(): string {
    if (this.esNutricion()) return 'Preparación';
    if (this.esOdontologia()) return 'Periodo de Tratamiento';
    return 'Duración';
  }

  get placeholderDuracion(): string {
    if (this.esNutricion()) return 'Ej. Al vapor / Asado';
    if (this.esPediatria()) return 'Ej. 7 días';
    if (this.esOdontologia()) return 'Ej. 2 semanas';
    return 'Ej. 5 días / 1 semana';
  }

  get lblIndicaciones(): string {
    if (this.esNutricion()) return 'Notas / Preparación';
    if (this.esPsiquiatria()) return 'Observaciones';
    if (this.esOdontologia()) return 'Instrucciones';
    if (this.esPediatria()) return 'Indicaciones para padres';
    return 'Indicaciones';
  }

  get mostrarGenerico(): boolean {
    return !this.esNutricion();
  }

  get mostrarViaAdministracion(): boolean {
    return !this.esNutricion() && !this.esOdontologia();
  }
  // ------------------------------------------------

  cargarCitas(): void {
    this.loading = true;
    this.citaService.obtenerCitasMedico(this.medicoId).subscribe({
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

  get citasFiltradas() {
    if (this.filtroEstado === 'todas') {
      return this.citas;
    }
    return this.citas.filter(c => c.estado === this.filtroEstado);
  }

  contarPorEstado(estado: string): number {
    return this.citas.filter(c => c.estado === estado).length;
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase();
  }

  esFutura(fecha: string): boolean {
    return new Date(fecha) > new Date();
  }

  confirmarCita(cita: any): void {
    if (!confirm('¿Confirmar esta cita?')) return;

    this.citaService.confirmarCita(cita.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita confirmada exitosamente');
          this.cargarCitas();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al confirmar la cita');
      }
    });
  }

  // NUEVO: Abrir modal con formulario completo
  abrirModalCompletar(cita: any): void {
    this.citaACompletar = cita;
    this.limpiarFormulario();
    this.mostrarModalCompletar = true;
  }

  cerrarModalCompletar(): void {
    this.mostrarModalCompletar = false;
    this.citaACompletar = null;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    // Nota: No reseteamos 'esNutriologo' aquí porque eso depende del usuario, no del formulario
    this.diagnostico = '';
    this.sintomas = '';
    this.exploracionFisica = '';
    this.presionArterial = '';
    this.temperatura = null;
    this.peso = null;
    this.altura = null;
    this.observaciones = '';
    this.planTratamiento = '';
    this.fechaSeguimiento = '';
    this.recetas = [];
    this.nuevaReceta = {
      medicamento_nombre: '',
      medicamento_generico: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      via_administracion: 'Oral',
      indicaciones: ''
    };
  }

  // NUEVO: Agregar receta a la lista
  agregarReceta(): void {
    if (!this.nuevaReceta.medicamento_nombre || !this.nuevaReceta.dosis || 
        !this.nuevaReceta.frecuencia || !this.nuevaReceta.duracion) {
      alert('Complete los campos obligatorios de la receta (medicamento, dosis, frecuencia, duración)');
      return;
    }

    this.recetas.push({ ...this.nuevaReceta });
    
    // Limpiar formulario de receta
    this.nuevaReceta = {
      medicamento_nombre: '',
      medicamento_generico: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      via_administracion: 'Oral',
      indicaciones: ''
    };

    alert('Receta agregada. Puede agregar más o guardar el historial.');
  }

  // NUEVO: Eliminar receta de la lista
  eliminarReceta(index: number): void {
    if (confirm('¿Eliminar esta receta?')) {
      this.recetas.splice(index, 1);
    }
  }

  // NUEVO: Confirmar y crear historial completo
  confirmarCompletar(): void {
    if (!this.citaACompletar || !this.diagnostico.trim()) {
      alert('El diagnóstico es obligatorio');
      return;
    }

    const historialData = {
      cita_id: this.citaACompletar.id,
      diagnostico: this.diagnostico,
      sintomas: this.sintomas || null,
      exploracion_fisica: this.exploracionFisica || null,
      presion_arterial: this.presionArterial || null,
      temperatura: this.temperatura || null,
      peso: this.peso || null,
      altura: this.altura || null,
      observaciones: this.observaciones || null,
      plan_tratamiento: this.planTratamiento || null,
      fecha_seguimiento: this.fechaSeguimiento || null,
      recetas: this.recetas
    };

    this.historialService.crearHistorial(historialData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Historial médico creado exitosamente');
          this.cargarCitas();
          this.cerrarModalCompletar();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert(err.error?.error || 'Error al crear historial médico');
      }
    });
  }

  // Modal rechazar
  abrirModalRechazar(cita: any): void {
    this.citaARechazar = cita;
    this.motivoRechazo = '';
    this.mostrarModalRechazar = true;
  }

  cerrarModalRechazar(): void {
    this.mostrarModalRechazar = false;
    this.citaARechazar = null;
    this.motivoRechazo = '';
  }

  confirmarRechazar(): void {
    if (!this.citaARechazar) return;

    this.citaService.rechazarCita(this.citaARechazar.id, this.motivoRechazo).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita rechazada');
          this.cargarCitas();
          this.cerrarModalRechazar();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al rechazar la cita');
      }
    });
  }
}