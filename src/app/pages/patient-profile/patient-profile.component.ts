import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { VisitsService } from '../../services/visits.service';
import { NotifyService } from '../../services/notify.service';
import { ImageCategory, Patient, PatientImage, TrackingStatus } from '../../models/patient';
import { Visit } from '../../models/visit';
import { Procedure } from '../../models/procedure';
import { PAGES } from '../../defines/constants';
import { VisitsDetailsComponent } from "../../components/visits-details/visits-details.component";

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, FormsModule, VisitsDetailsComponent],
  templateUrl: './patient-profile.component.html',
})
export class PatientProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly visitsService = inject(VisitsService);
  private readonly notify = inject(NotifyService);

  readonly statuses: TrackingStatus[] = ['New', 'InTreatment', 'FollowUpNeeded', 'Completed'];
  readonly patientId = signal('');

  patient = computed(() => this.patientsService.getPatientById(this.patientId()));

  isEditing = false;
  editDraft: Partial<Patient> = {};

  newNote = '';
  newFollowUpDate = '';
  paymentAmount: number | null = null;

  readonly imageCategories: ImageCategory[] = ['xray', 'panoramic', 'intraoral', 'before_after', 'other'];
  selectedImageCategory: ImageCategory = 'xray';
  imageLabel = '';
  selectedFile: File | null = null;
  imageFilter: ImageCategory | 'all' = 'all';
  lightboxImage: PatientImage | null = null;



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
      isSmoker: this.editDraft.isSmoker ?? current.isSmoker,
      totalBill: this.editDraft.totalBill ?? current.totalBill,
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

  submitPayment() {
    const p = this.patient();
    if (!p || !this.paymentAmount || this.paymentAmount <= 0) {
      this.notify.showErrorAlert();
      return;
    }

    const remaining = p.totalBill - p.amountPaid;
    if (remaining <= 0) {
      this.notify.showErrorAlert();
      return;
    }

    this.patientsService.recordPayment(p.id, this.paymentAmount);
    this.paymentAmount = null;
    this.refreshPatientSignal();
    this.notify.showSuccessAlert();
  }







  get filteredImages(): PatientImage[] {
    const p = this.patient();
    if (!p) return [];
    if (this.imageFilter === 'all') return p.images;
    return p.images.filter((img) => img.category === this.imageFilter);
  }

  categoryLabel(cat: ImageCategory): string {
    const map: Record<ImageCategory, string> = {
      xray: 'X-Ray',
      panoramic: 'Panoramic',
      intraoral: 'Intraoral',
      before_after: 'Before / After',
      other: 'Other',
    };
    return map[cat];
  }

  imageCategoryCount(patient: Patient, cat: ImageCategory): number {
    return patient.images.filter((img) => img.category === cat).length;
  }

  categoryColor(cat: ImageCategory): string {
    const map: Record<ImageCategory, string> = {
      xray: 'bg-indigo-100 text-indigo-800',
      panoramic: 'bg-purple-100 text-purple-800',
      intraoral: 'bg-pink-100 text-pink-800',
      before_after: 'bg-amber-100 text-amber-800',
      other: 'bg-gray-100 text-gray-700',
    };
    return map[cat];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadImage() {
    const p = this.patient();
    if (!p || !this.selectedFile) {
      this.notify.showErrorAlert();
      return;
    }

    const file = this.selectedFile;
    const reader = new FileReader();
    reader.onload = () => {
      const image: PatientImage = {
        id: `IMG${Date.now()}`,
        dataUrl: reader.result as string,
        category: this.selectedImageCategory,
        label: this.imageLabel.trim() || undefined,
        dateAdded: new Date().toISOString().split('T')[0],
      };
      this.patientsService.addImageToPatient(p.id, image);
      this.selectedFile = null;
      this.imageLabel = '';
      this.selectedImageCategory = 'xray';
      this.refreshPatientSignal();
      this.notify.showSuccessAlert();
    };
    reader.readAsDataURL(file);
  }

  deleteImage(imageId: string) {
    const p = this.patient();
    if (!p) return;
    this.notify.showConfirmAlert('warning').then((result) => {
      if (result.isConfirmed) {
        this.patientsService.removeImageFromPatient(p.id, imageId);
        if (this.lightboxImage?.id === imageId) {
          this.lightboxImage = null;
        }
        this.refreshPatientSignal();
        this.notify.showSuccessAlert();
      }
    });
  }

  openLightbox(image: PatientImage) {
    this.lightboxImage = image;
  }

  closeLightbox() {
    this.lightboxImage = null;
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
      payment: '💰',
      image: '📷',
    };
    return map[type] ?? '•';
  }

  refreshPatientSignal() {
    const id = this.patientId();
    this.patientId.set('');
    this.patientId.set(id);
  }


}
