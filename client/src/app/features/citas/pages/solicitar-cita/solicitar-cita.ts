import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CitaService } from '../../../../Core/services/cita.service';

@Component({
  selector: 'app-solicitar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './solicitar-cita.html',
  styleUrl: './solicitar-cita.css'
})
export class SolicitarCitaComponent implements OnInit {
  citaForm: FormGroup;
  submitted = false;
  medicos: any[] = [];
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
      hora_cita: ['', Validators.required],
      tipo_consulta: ['primera_vez', Validators.required],
      motivo_consulta: ['', [Validators.required, Validators.minLength(10)]],
      notas_paciente: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.loading = true;
    this.citaService.obtenerMedicos().subscribe({
      next: (response) => {
        if (response.success) {
          this.medicos = response.data;
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
      return;
    }

    this.loading = true;
    const formData = this.citaForm.value;
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
          setTimeout(() => this.success = false, 5000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear cita:', err);
        this.error = 'Error al solicitar la cita';
        this.loading = false;
      }
    });
  }
}