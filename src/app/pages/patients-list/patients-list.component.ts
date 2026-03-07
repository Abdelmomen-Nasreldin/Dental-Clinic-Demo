import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { NotifyService } from '../../services/notify.service';
import { Patient, TrackingStatus } from '../../models/patient';
import { PAGES } from '../../defines/constants';

@Component({
  selector: 'app-patients-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './patients-list.component.html',
})
export class PatientsListComponent {
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  readonly patientsService = inject(PatientsService);

  readonly statuses: (TrackingStatus | 'All')[] = [
    'All',
    'New',
    'InTreatment',
    'FollowUpNeeded',
    'Completed',
  ];

  showAddForm = false;
  newPatient: Partial<Patient> = this.emptyPatient();

  get searchTerm() {
    return this.patientsService.searchTerm();
  }

  get activeFilter() {
    return this.patientsService.statusFilter();
  }

  onSearch(term: string) {
    this.patientsService.setSearchTerm(term);
  }

  onFilterStatus(status: TrackingStatus | 'All') {
    this.patientsService.setStatusFilter(status);
  }

  openProfile(id: string) {
    this.router.navigate([PAGES.PATIENT_PROFILE, id]);
  }

  statusLabel(status: TrackingStatus): string {
    const map: Record<TrackingStatus, string> = {
      New: 'New',
      InTreatment: 'In Treatment',
      FollowUpNeeded: 'Follow-Up Needed',
      Completed: 'Completed',
    };
    return map[status];
  }

  statusColor(status: TrackingStatus): string {
    const map: Record<TrackingStatus, string> = {
      New: 'bg-blue-100 text-blue-800',
      InTreatment: 'bg-yellow-100 text-yellow-800',
      FollowUpNeeded: 'bg-orange-100 text-orange-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return map[status];
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newPatient = this.emptyPatient();
    }
  }

  submitNewPatient() {
    if (!this.newPatient.firstName?.trim() || !this.newPatient.lastName?.trim() || !this.newPatient.phone?.trim()) {
      this.notify.showErrorAlert();
      return;
    }

    const patient: Patient = {
      id: this.patientsService.generateNextId(),
      firstName: (this.newPatient.firstName ?? '').trim(),
      lastName: (this.newPatient.lastName ?? '').trim(),
      phone: (this.newPatient.phone ?? '').trim(),
      email: this.newPatient.email?.trim() ?? '',
      dateOfBirth: this.newPatient.dateOfBirth ?? '',
      gender: this.newPatient.gender ?? 'male',
      allergies: this.newPatient.allergies?.trim(),
      notes: this.newPatient.notes?.trim(),
      address: this.newPatient.address?.trim(),
      isSmoker: this.newPatient.isSmoker ?? false,
      totalBill: this.newPatient.totalBill ?? 0,
      amountPaid: 0,
      trackingStatus: 'New',
      visits: [],
      history: [
        {
          id: `E${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'status_change',
          description: 'Patient registered — status set to New.',
        },
      ],
    };

    this.patientsService.addPatient(patient);
    this.showAddForm = false;
    this.notify.showSuccessAlert();
  }

  deletePatient(event: Event, id: string) {
    event.stopPropagation();
    this.notify.showConfirmAlert('warning').then((result) => {
      if (result.isConfirmed) {
        this.patientsService.removePatient(id);
        this.notify.showSuccessAlert();
      }
    });
  }

  balanceColor(patient: Patient): string {
    const remaining = patient.totalBill - patient.amountPaid;
    if (patient.totalBill === 0) return 'text-gray-400';
    return remaining <= 0 ? 'text-green-600' : 'text-red-600';
  }

  private emptyPatient(): Partial<Patient> {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      gender: 'male',
      allergies: '',
      notes: '',
      address: '',
      isSmoker: false,
      totalBill: 0,
    };
  }
}
