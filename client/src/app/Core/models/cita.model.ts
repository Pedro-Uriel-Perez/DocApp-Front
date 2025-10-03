export interface Cita {
  id?: number;
  paciente_id: number;
  medico_id: number;
  fecha_cita: string;
  motivo_consulta: string;
}