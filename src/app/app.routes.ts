import { Routes } from '@angular/router';
import { PAGES } from './defines/constants';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { PatientsListComponent } from './pages/patients-list/patients-list.component';
import { VisitDetailsComponent } from './pages/visit-details/visit-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: PAGES.DASHBOARD, component: DashboardComponent },
  { path: PAGES.PATIENTS, component: PatientsListComponent },
  { path: PAGES.PATIENT_PROFILE + '/:id', component:  PatientProfileComponent},
  { path: PAGES.VISITS, component: VisitDetailsComponent },
];
