import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = 'http://localhost:3000/api/citas';

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

  obtenerMedicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/medicos`);
  }

  solicitarCita(cita: any): Observable<any> {
    return this.http.post(this.apiUrl, cita, { headers: this.getHeaders() });
  }

  obtenerCitas(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerCitasPaciente(paciente_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/paciente/${paciente_id}`, { headers: this.getHeaders() });
  }

  cancelarCita(id: number, motivo?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancelar`, 
      { motivo_cancelacion: motivo }, 
      { headers: this.getHeaders() }
    );
  }

  reprogramarCita(id: number, fecha_cita: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reprogramar`, 
      { fecha_cita }, 
      { headers: this.getHeaders() }
    );
  }

  obtenerCitasMedico(medico_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/medico/${medico_id}`, { headers: this.getHeaders() });
  }

  confirmarCita(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/confirmar`, {}, { headers: this.getHeaders() });
  }

  completarCita(id: number, notas_medico: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/completar`, 
      { notas_medico }, 
      { headers: this.getHeaders() }
    );
  }

  rechazarCita(id: number, motivo: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/rechazar`, 
      { motivo_cancelacion: motivo }, 
      { headers: this.getHeaders() }
    );
  }
}