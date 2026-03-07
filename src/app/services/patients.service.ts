import { computed, Injectable, signal } from '@angular/core';
import { Patient, TrackingEvent, TrackingStatus } from '../models/patient';
import { Visit } from '../models/visit';
import { patients as mockPatients } from '../defines/mock-ups';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly _patients = signal<Patient[]>(mockPatients);

  patients = this._patients.asReadonly();

  private readonly _searchTerm = signal('');
  private readonly _statusFilter = signal<TrackingStatus | 'All'>('All');

  searchTerm = this._searchTerm.asReadonly();
  statusFilter = this._statusFilter.asReadonly();

  filteredPatients = computed(() => {
    let list = this._patients();
    const term = this._searchTerm().toLowerCase().trim();
    const status = this._statusFilter();

    if (status !== 'All') {
      list = list.filter((p) => p.trackingStatus === status);
    }

    if (term) {
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(term) ||
          p.lastName.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          p.id.toLowerCase().includes(term),
      );
    }

    return list;
  });

  setSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  setStatusFilter(status: TrackingStatus | 'All') {
    this._statusFilter.set(status);
  }

  getPatientById(id: string): Patient | undefined {
    return this._patients().find((p) => p.id === id);
  }

  setPatients(data: Patient[]) {
    this._patients.set(data);
  }

  addPatient(patient: Patient) {
    this._patients.update((list) => [...list, patient]);
  }

  removePatient(patientId: string) {
    this._patients.update((list) => list.filter((p) => p.id !== patientId));
  }

  updatePatient(patient: Patient) {
    this._patients.update((list) =>
      list.map((p) => (p.id === patient.id ? patient : p)),
    );
  }

  updateTrackingStatus(patientId: string, newStatus: TrackingStatus) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const event: TrackingEvent = {
          id: `E${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'status_change',
          description: `Status changed to ${newStatus}.`,
        };
        return {
          ...p,
          trackingStatus: newStatus,
          history: [...p.history, event],
        };
      }),
    );
  }

  setFollowUpDate(patientId: string, date: string) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const event: TrackingEvent = {
          id: `E${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'follow_up',
          description: `Follow-up scheduled for ${date}.`,
        };
        return {
          ...p,
          nextFollowUpDate: date,
          history: [...p.history, event],
        };
      }),
    );
  }

  addNote(patientId: string, note: string) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const event: TrackingEvent = {
          id: `E${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'note',
          description: note,
        };
        return {
          ...p,
          history: [...p.history, event],
        };
      }),
    );
  }

  recordPayment(patientId: string, amount: number) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const cappedAmount = Math.min(amount, p.totalBill - p.amountPaid);
        if (cappedAmount <= 0) return p;
        const newPaid = p.amountPaid + cappedAmount;
        const fullyPaid = newPaid >= p.totalBill;
        const event: TrackingEvent = {
          id: `E${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'payment',
          description: `Payment of ${cappedAmount} EGP received.${fullyPaid ? ' Fully paid.' : ''}`,
        };
        return {
          ...p,
          amountPaid: newPaid,
          history: [...p.history, event],
        };
      }),
    );
  }

  updateBill(patientId: string, newTotal: number) {
    this._patients.update((list) =>
      list.map((p) => (p.id === patientId ? { ...p, totalBill: newTotal } : p)),
    );
  }

  addVisit(patientId: string, visit: Visit) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const totalCost = visit.procedures.reduce((sum, pr) => sum + pr.cost, 0);
        const event: TrackingEvent = {
          id: `E${Date.now()}`,
          date: visit.visitDate,
          type: 'visit',
          description: 'Visit: ' + visit.diagnosis + (totalCost ? ' (' + totalCost + ' EGP)' : ''),
        };
        return {
          ...p,
          visits: [...p.visits, visit],
          lastVisitDate: visit.visitDate > (p.lastVisitDate ?? '') ? visit.visitDate : p.lastVisitDate,
          history: [...p.history, event],
        };
      }),
    );
  }

  removeVisit(patientId: string, visitId: string) {
    this._patients.update((list) =>
      list.map((p) => {
        if (p.id !== patientId) return p;
        const filtered = p.visits.filter((v) => v.id !== visitId);
        const dates = filtered.map((v) => v.visitDate).sort();
        const lastDate = dates.length ? dates[dates.length - 1] : undefined;
        return { ...p, visits: filtered, lastVisitDate: lastDate || undefined };
      }),
    );
  }

  getVisitsForPatient(patientId: string): Visit[] {
    return this._patients().find((p) => p.id === patientId)?.visits ?? [];
  }

  allVisits = computed(() => {
    return this._patients()
      .flatMap((p) =>
        p.visits.map((v) => ({
          ...v,
          patientId: p.id,
          patientName: `${p.firstName} ${p.lastName}`,
        })),
      )
      .sort((a, b) => (b.visitDate > a.visitDate ? 1 : -1));
  });

  generateNextId(): string {
    const ids = this._patients().map((p) => Number.parseInt(p.id.replace('P', ''), 10));
    const max = ids.length ? Math.max(...ids) : 0;
    return `P${String(max + 1).padStart(3, '0')}`;
  }
}
