import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private apiUrl = 'http://localhost:3000/api/drugs';

  constructor(private http: HttpClient) {}

  buscarMedicamentos(nombre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/${nombre}`);
  }
}