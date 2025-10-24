import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../../../Core/services/cita.service';

@Component({
  selector: 'app-solicitar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './solicitar-cita.html',
  styleUrl: './solicitar-cita.css'
})
export class SolicitarCitaComponent implements OnInit {
  citaForm: FormGroup;
  submitted = false;
  medicos: any[] = [];
  medicosOriginal: any[] = [];
  especialidades: any[] = [];
  especialidadSeleccionada: number = 0;
  
  // ✅ NUEVO: Para horarios dinámicos
  horariosDisponibles: any[] = [];
  cargandoHorarios = false;
  
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService
  ) {
    this.citaForm = this.fb.group({
      medico_id: ['', Validators.required],
      fecha_cita: ['', Validators.required],
      hora_cita: ['', Validators.required], // ✅ Ahora será solo la hora en formato HH:mm
      tipo_consulta: ['primera_vez', Validators.required],
      motivo_consulta: ['', [Validators.required, Validators.minLength(10)]],
      notas_paciente: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMedicos();
    this.configurarListeners();
  }

  // ✅ NUEVO: Escuchar cambios en médico y fecha
  configurarListeners(): void {
    // Cuando cambia el médico, resetear fecha y horarios
    this.citaForm.get('medico_id')?.valueChanges.subscribe(() => {
      this.citaForm.patchValue({ 
        fecha_cita: '', 
        hora_cita: '' 
      });
      this.horariosDisponibles = [];
    });
    
    // Cuando cambia la fecha, cargar horarios
    this.citaForm.get('fecha_cita')?.valueChanges.subscribe(() => {
      this.cargarHorariosDisponibles();
    });
  }

  cargarMedicos(): void {
    this.loading = true;
    this.citaService.obtenerMedicos().subscribe({
      next: (response) => {
        if (response.success) {
          this.medicosOriginal = response.data;
          this.medicos = response.data;
          this.extraerEspecialidades();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err);
        this.error = 'Error al cargar médicos';
        this.loading = false;
      }
    });
  }

  extraerEspecialidades(): void {
    const especialidadesMap = new Map();
    this.medicosOriginal.forEach(medico => {
      if (!especialidadesMap.has(medico.especialidad_id)) {
        especialidadesMap.set(medico.especialidad_id, {
          id: medico.especialidad_id,
          nombre: medico.especialidad_nombre
        });
      }
    });
    this.especialidades = Array.from(especialidadesMap.values());
  }

  filtrarPorEspecialidad(event: any): void {
    const especialidadId = parseInt(event.target.value);
    this.especialidadSeleccionada = especialidadId;

    if (especialidadId === 0) {
      this.medicos = this.medicosOriginal;
    } else {
      this.medicos = this.medicosOriginal.filter(
        medico => medico.especialidad_id === especialidadId
      );
    }

    // Limpiar selección de médico, fecha y horarios
    this.citaForm.patchValue({ 
      medico_id: '', 
      fecha_cita: '', 
      hora_cita: '' 
    });
    this.horariosDisponibles = [];
  }

  // ✅ NUEVO: Cargar horarios disponibles
  cargarHorariosDisponibles(): void {
    const medicoId = this.citaForm.get('medico_id')?.value;
    const fecha = this.citaForm.get('fecha_cita')?.value;
    
    // Resetear horario seleccionado
    this.citaForm.patchValue({ hora_cita: '' });
    this.horariosDisponibles = [];
    
    // Necesitamos ambos valores
    if (!medicoId || !fecha) {
      return;
    }
    
    this.cargandoHorarios = true;
    this.error = null;
    
    this.citaService.obtenerHorariosDisponibles(medicoId, fecha)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.horariosDisponibles = response.data;
            
            if (this.horariosDisponibles.length === 0) {
              this.error = 'No hay horarios disponibles para esta fecha. Por favor, seleccione otra fecha.';
            }
          }
          this.cargandoHorarios = false;
        },
        error: (err) => {
          console.error('Error al cargar horarios:', err);
          this.error = 'Error al cargar horarios disponibles';
          this.cargandoHorarios = false;
        }
      });
  }

  get f() {
    return this.citaForm.controls;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.citaForm.invalid) {
      this.error = 'Por favor, complete todos los campos requeridos';
      return;
    }

    this.loading = true;
    const formData = this.citaForm.value;
    
    // ✅ Combinar fecha y hora correctamente
    const fechaHora = `${formData.fecha_cita}T${formData.hora_cita}:00`;
    
    const cita = {
      medico_id: parseInt(formData.medico_id),
      fecha_cita: fechaHora,
      tipo_consulta: formData.tipo_consulta,
      motivo_consulta: formData.motivo_consulta,
      notas_paciente: formData.notas_paciente || null
    };

    this.citaService.solicitarCita(cita).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = true;
          this.citaForm.reset({ tipo_consulta: 'primera_vez' });
          this.submitted = false;
          this.horariosDisponibles = [];
          setTimeout(() => this.success = false, 5000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear cita:', err);
        this.error = err.error?.error || 'Error al solicitar la cita';
        this.loading = false;
      }
    });
  }
}