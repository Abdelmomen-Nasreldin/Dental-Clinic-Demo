export interface Visit {
  id: string;
  patientId: string;
  appointmentId?: string;
  visitDate: string;
  diagnosis: string;
  notes?: string;
}
