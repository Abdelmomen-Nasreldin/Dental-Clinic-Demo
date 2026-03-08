import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VisitsService } from '../../services/visits.service';
import { PAGES } from '../../defines/constants';

@Component({
  selector: 'app-visits-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './visits-page.component.html',
})
export class VisitsPageComponent {
  private readonly router = inject(Router);
  private readonly visitsService = inject(VisitsService);

  searchTerm = signal('');

  filteredVisits = computed(() => {
    const all = this.visitsService.allVisits();
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
