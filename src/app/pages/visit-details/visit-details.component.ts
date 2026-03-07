import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { PAGES } from '../../defines/constants';

@Component({
  selector: 'app-visit-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-details.component.html',
})
export class VisitDetailsComponent {
  private readonly router = inject(Router);
  readonly patientsService = inject(PatientsService);

  searchTerm = signal('');

  filteredVisits = computed(() => {
    const all = this.patientsService.allVisits();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return all;
    return all.filter((v) => v.patientName.toLowerCase().includes(term));
  });

  onSearch(term: string) {
    this.searchTerm.set(term);
  }

  openProfile(patientId: string) {
    this.router.navigate([PAGES.PATIENT_PROFILE, patientId]);
  }

  visitTotalCost(visit: { procedures: { cost: number }[] }): number {
    return visit.procedures.reduce((sum, pr) => sum + pr.cost, 0);
  }
}
