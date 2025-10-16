import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = 'http://localhost:3000/api/historial';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  crearHistorial(historialData: any): Observable<any> {
    return this.http.post(this.apiUrl, historialData, { headers: this.getHeaders() });
  }

  obtenerHistorialPaciente(pacienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/paciente/${pacienteId}`, { headers: this.getHeaders() });
  }

  obtenerDetalleConsulta(historialId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${historialId}`, { headers: this.getHeaders() });
  }

  obtenerRecetas(historialId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${historialId}/recetas`, { headers: this.getHeaders() });
  }
}