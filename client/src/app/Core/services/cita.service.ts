import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = 'http://localhost:3000/api/citas';

  constructor(private http: HttpClient) {}

  obtenerMedicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/medicos`);
  }

  solicitarCita(cita: any): Observable<any> {
    return this.http.post(this.apiUrl, cita);
  }

  obtenerCitas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}