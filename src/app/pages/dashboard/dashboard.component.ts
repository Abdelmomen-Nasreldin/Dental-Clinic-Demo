import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { TrackingStatus } from '../../models/patient';
import { PAGES } from '../../defines/constants';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);

  totalPatients = computed(() => this.patientsService.patients().length);

  statusCounts = computed(() => {
    const patients = this.patientsService.patients();
    const counts: Record<TrackingStatus, number> = {
      New: 0,
      InTreatment: 0,
      FollowUpNeeded: 0,
      Completed: 0,
    };
    patients.forEach((p) => counts[p.trackingStatus]++);
    return counts;
  });

  upcomingFollowUps = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.patientsService
      .patients()
      .filter((p) => p.nextFollowUpDate && p.nextFollowUpDate >= today)
      .sort((a, b) => (a.nextFollowUpDate! > b.nextFollowUpDate! ? 1 : -1))
      .slice(0, 5);
  });

  goToPatients(status?: TrackingStatus) {
    if (status) {
      this.patientsService.setStatusFilter(status);
    } else {
      this.patientsService.setStatusFilter('All');
    }
    this.router.navigate([PAGES.PATIENTS]);
  }

  goToProfile(id: string) {
    this.router.navigate([PAGES.PATIENT_PROFILE, id]);
  }
}
