import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { NotifyService } from '../../services/notify.service';
import { Patient, TrackingStatus } from '../../models/patient';
import { PAGES } from '../../defines/constants';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.component.html',
})
export class PatientProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly notify = inject(NotifyService);

  readonly statuses: TrackingStatus[] = ['New', 'InTreatment', 'FollowUpNeeded', 'Completed'];
  readonly patientId = signal('');

  patient = computed(() => this.patientsService.getPatientById(this.patientId()));

  isEditing = false;
  editDraft: Partial<Patient> = {};

  newNote = '';
  newFollowUpDate = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.patientId.set(id);
    if (!this.patient()) {
      this.router.navigate([PAGES.PATIENTS]);
    }
  }

  goBack() {
    this.router.navigate([PAGES.PATIENTS]);
  }

  startEditing() {
    const p = this.patient();
    if (!p) return;
    this.editDraft = { ...p };
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.editDraft = {};
  }

  saveEdits() {
    if (!this.editDraft.firstName?.trim() || !this.editDraft.lastName?.trim() || !this.editDraft.phone?.trim()) {
      this.notify.showErrorAlert();
      return;
    }

    const current = this.patient();
    if (!current) return;

    const updated: Patient = {
      ...current,
      firstName: (this.editDraft.firstName ?? '').trim(),
      lastName: (this.editDraft.lastName ?? '').trim(),
      phone: (this.editDraft.phone ?? '').trim(),
      email: this.editDraft.email?.trim() ?? current.email,
      dateOfBirth: this.editDraft.dateOfBirth ?? current.dateOfBirth,
      gender: this.editDraft.gender ?? current.gender,
      allergies: this.editDraft.allergies?.trim(),
      notes: this.editDraft.notes?.trim(),
      address: this.editDraft.address?.trim(),
    };

    this.patientsService.updatePatient(updated);
    this.isEditing = false;
    this.notify.showSuccessAlert();
  }

  changeStatus(newStatus: TrackingStatus) {
    const p = this.patient();
    if (!p || p.trackingStatus === newStatus) return;

    this.patientsService.updateTrackingStatus(p.id, newStatus);
    this.refreshPatientSignal();
    this.notify.showSuccessAlert();
  }

  submitFollowUp() {
    const p = this.patient();
    if (!p || !this.newFollowUpDate) {
      this.notify.showErrorAlert();
      return;
    }

    this.patientsService.setFollowUpDate(p.id, this.newFollowUpDate);
    this.newFollowUpDate = '';
    this.refreshPatientSignal();
    this.notify.showSuccessAlert();
  }

  submitNote() {
    const p = this.patient();
    if (!p || !this.newNote.trim()) {
      this.notify.showErrorAlert();
      return;
    }

    this.patientsService.addNote(p.id, this.newNote.trim());
    this.newNote = '';
    this.refreshPatientSignal();
    this.notify.showSuccessAlert();
  }

  deletePatient() {
    const p = this.patient();
    if (!p) return;

    this.notify.showConfirmAlert('warning').then((result) => {
      if (result.isConfirmed) {
        this.patientsService.removePatient(p.id);
        this.notify.showSuccessAlert();
        this.router.navigate([PAGES.PATIENTS]);
      }
    });
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

  eventIcon(type: string): string {
    const map: Record<string, string> = {
      status_change: '🔄',
      visit: '🦷',
      note: '📝',
      follow_up: '📅',
    };
    return map[type] ?? '•';
  }

  private refreshPatientSignal() {
    const id = this.patientId();
    this.patientId.set('');
    this.patientId.set(id);
  }
}
