export const PAGES = {
DASHBOARD: 'dashboard',
PATIENTS: 'patients',
PATIENT_PROFILE: 'patient-profile',
APPOINTMENTS: 'appointments',
VISITS: 'visits',
}

export const PAGE_ROUTES_DATA
 = {
  DASHBOARD: {
    name: 'Dashboard',
    nameAr: 'لوحة التحكم',
    icon: 'dashboard',
    path: 'dashboard',
  },
  PATIENTS: {
    name: 'Patients',
    nameAr: 'المرضى',
    icon: 'person',
    path: 'patients',
  },
  // APPOINTMENTS: {
  //   name: 'Appointments',
  //   nameAr: 'المواعيد',
  //   icon: 'person',
  //   path: 'appointments',
  // },
  // VISITS: {
  //   name: 'Visits',
  //   nameAr: 'الزيارات',
  //   icon: 'person',
  //   path: 'visits',
  // },
} as const;
