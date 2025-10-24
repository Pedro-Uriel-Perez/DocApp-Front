import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'paciente' | 'medico' | 'admin' | 'ayudante';
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Usuario;
  error?: string;
  requiereVerificacion?: boolean;
  email?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: number;
    email: string;
    requiereVerificacion: boolean;
  };
}

interface VerificarEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.cargarUsuarioDesdeLocalStorage();
    }
  }

  // Registro de usuario
  register(datos: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, datos);
  }

  // Verificar email con código
  verificarEmail(email: string, codigo: string): Observable<VerificarEmailResponse> {
    return this.http.post<VerificarEmailResponse>(`${this.apiUrl}/verificar-email`, {
      email,
      codigo
    }).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.guardarSesion(response.token, response.user);
        }
      })
    );
  }

  //Reenviar código de verificación
  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reenviar-codigo`, { email });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            this.guardarSesion(response.token, response.user);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  private guardarSesion(token: string, user: Usuario): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private cargarUsuarioDesdeLocalStorage(): void {
    if (!this.isBrowser) return;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isRole(rol: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
  }
}