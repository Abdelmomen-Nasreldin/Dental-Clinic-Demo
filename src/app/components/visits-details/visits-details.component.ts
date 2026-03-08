import { Component, inject, input, output } from '@angular/core';
import { VisitsService } from '../../services/visits.service';
import { Patient } from '../../models/patient';
import { NotifyService } from '../../services/notify.service';
import { PatientsService } from '../../services/patients.service';
import { Visit } from '../../models/visit';
import { Procedure } from '../../models/procedure';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visits-details',
  imports: [FormsModule, CommonModule],
  templateUrl: './visits-details.component.html',
  styleUrl: './visits-details.component.scss'
})
export class VisitsDetailsComponent {
  private readonly visitsService = inject(VisitsService);
  private readonly notify = inject(NotifyService);
  private readonly patientsService = inject(PatientsService);

  patient = input.required<Patient>();
  refreshPatient = output<void>();

  showVisitForm = false;
  visitDraft = this.emptyVisit();
  procedureDraft = this.emptyProcedure();
  submitVisit() {
    const p = this.patient();
    if (!p || !this.visitDraft.visitDate || !this.visitDraft.diagnosis?.trim()) {
      this.notify.showErrorAlert();
      return;
    }

    const visit: Visit = {
      id: `V${Date.now()}`,
      visitDate: this.visitDraft.visitDate,
      diagnosis: this.visitDraft.diagnosis.trim(),
      notes: this.visitDraft.notes?.trim() || undefined,
      procedures: [...this.visitDraft.procedures],
    };

    this.visitsService.addVisit(p.id, visit);
    this.showVisitForm = false;
    this.visitDraft = this.emptyVisit();
    this.refreshPatient.emit();
    this.notify.showSuccessAlert();
  }

  deleteVisit(visitId: string) {
    const p = this.patient();
    if (!p) return;
    this.notify.showConfirmAlert('warning').then((result) => {
      if (result.isConfirmed) {
        this.visitsService.removeVisit(p.id, visitId);
        this.refreshPatient.emit();
        this.notify.showSuccessAlert();
      }
    });
  }

  visitTotalCost(visit: Visit): number {
    return visit.procedures.reduce((sum, pr) => sum + pr.cost, 0);
  }

  private emptyVisit(): Visit {
    return { id: '', visitDate: '', diagnosis: '', notes: '', procedures: [] };
  }

  private emptyProcedure(): Procedure {
    return { id: '', toothNumber: 0, procedureType: '', cost: 0 };
  }

  toggleVisitForm() {
    this.showVisitForm = !this.showVisitForm;
    if (this.showVisitForm) {
      this.visitDraft = this.emptyVisit();
      this.procedureDraft = this.emptyProcedure();
    }
  }

  addProcedureToVisit() {
    if (!this.procedureDraft.procedureType?.trim() || this.procedureDraft.cost <= 0) {
      this.notify.showErrorAlert();
      return;
    }
    this.visitDraft.procedures.push({
      ...this.procedureDraft,
      id: `PR${Date.now()}`,
    });
    this.procedureDraft = this.emptyProcedure();
  }

  removeProcedureFromDraft(index: number) {
    this.visitDraft.procedures.splice(index, 1);
  }
}
