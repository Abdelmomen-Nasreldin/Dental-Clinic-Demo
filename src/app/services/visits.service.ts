import { computed, inject, Injectable, signal } from '@angular/core';
import { Visit } from '../models/visit';
import { PatientsService } from './patients.service';
import { TrackingEvent } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {
  private readonly _visits = signal<Visit[]>([]);
  visits = this._visits.asReadonly();

  private readonly patientsService = inject(PatientsService);

  addVisit(patientId: string, visit: Visit) {
    const totalCost = visit.procedures.reduce((sum, pr) => sum + pr.cost, 0);
    const event: TrackingEvent = {
      id: `E${Date.now()}`,
      date: visit.visitDate,
      type: 'visit',
      description: 'Visit: ' + visit.diagnosis + (totalCost ? ' (' + totalCost + ' EGP)' : ''),
    };
    this.patientsService.addVisitToPatient(patientId, visit, event);
  }

  removeVisit(patientId: string, visitId: string) {
    this.patientsService.removeVisitFromPatient(patientId, visitId);
  }

  getVisitsForPatient(patientId: string): Visit[] {
    return this.patientsService.patients().find((p) => p.id === patientId)?.visits ?? [];
  }

  allVisits = computed(() => {
    return this.patientsService.patients()
      .flatMap((p) =>
        p.visits.map((v) => ({
          ...v,
          patientId: p.id,
          patientName: `${p.firstName} ${p.lastName}`,
        })),
      )
      .sort((a, b) => (b.visitDate > a.visitDate ? 1 : -1));
  });
}
