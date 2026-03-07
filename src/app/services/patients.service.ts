import { Injectable, signal } from '@angular/core';
import { Patient } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor() { }

  private readonly _patients = signal<Patient[]>([]);

  patients = this._patients.asReadonly();

  setPatients(data: Patient[]) {
    this._patients.set(data);
  }

  addPatient(patient: Patient) {
    this._patients.update(list => [...list, patient]);
  }

  removePatient(patientId: string) {
    this._patients.update(list => list.filter(patient => patient.id !== patientId));
  }

  updatePatient(patient: Patient) {
    this._patients.update(list => list.map(p => p.id === patient.id ? patient : p));
  }
}
