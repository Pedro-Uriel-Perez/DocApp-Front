import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicamentoService } from '../../Core/services/medicamento.service';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamentos.html',
  styleUrl: './medicamentos.css'
})
export class MedicamentosComponent {
  medicamentos: any[] = [];
  nombreMedicamento: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  medicamentoSeleccionado: any = null;

  constructor(private medicamentoService: MedicamentoService) {}

  buscarMedicamentos() {
    if (!this.nombreMedicamento.trim()) {
      this.errorMessage = 'Por favor, ingrese un nombre de medicamento.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.medicamentoSeleccionado = null;

    this.medicamentoService.buscarMedicamentos(this.nombreMedicamento).subscribe({
      next: (response) => {
        if (response.success) {
          this.medicamentos = response.data || [];
          if (this.medicamentos.length === 0) {
            this.errorMessage = 'No se encontraron medicamentos con ese nombre.';
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al buscar medicamentos', error);
        this.loading = false;
        this.errorMessage = 'Error al buscar medicamentos. Intenta de nuevo.';
      }
    });
  }

  verDetalle(medicamento: any) {
    this.medicamentoSeleccionado = medicamento;
  }

  cerrarDetalle() {
    this.medicamentoSeleccionado = null;
  }

  limpiarTexto(texto: string): string {
    if (!texto || texto === 'N/A') return texto;
    return texto.replace(/<[^>]*>/g, '').substring(0, 300) + '...';
  }
}