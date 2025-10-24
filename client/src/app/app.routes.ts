import { Routes } from '@angular/router';
import { SolicitarCitaComponent } from './features/citas/pages/solicitar-cita/solicitar-cita';
import { MisCitasComponent } from './features/citas/pages/mis-citas/mis-citas';
import { CitasMedicoComponent } from './features/citas/pages/citas-medico/citas-medico';
import { LoginComponent } from './features/auth/login/login';
import { MedicamentosComponent } from './features/medicamentos/medicamentos'; 
import { MiHistorialComponent } from './features/historial/mi-historial';
import { RegistroComponent } from './features/auth/registro/registro.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'solicitar-cita', component: SolicitarCitaComponent },
  { path: 'mis-citas', component: MisCitasComponent },
  { path: 'medico/citas', component: CitasMedicoComponent },
  { path: 'medicamentos', component: MedicamentosComponent },
  { path: 'mi-historial', component: MiHistorialComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, //  Redirigir al login
  { path: '**', redirectTo: '/login' }
];



