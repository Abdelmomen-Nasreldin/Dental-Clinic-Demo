export type TrackingStatus = 'New' | 'InTreatment' | 'FollowUpNeeded' | 'Completed';

export type ImageCategory = 'xray' | 'panoramic' | 'intraoral' | 'before_after' | 'other';

export interface PatientImage {
  id: string;
  dataUrl: string;
  category: ImageCategory;
  label?: string;
  dateAdded: string;
}

export interface TrackingEvent {
  id: string;
  date: string;
  type: 'status_change' | 'visit' | 'note' | 'follow_up' | 'payment' | 'image';
  description: string;
}

import { Visit } from './visit';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  allergies?: string;
  notes?: string;
  address?: string;
  isSmoker: boolean;
  totalBill: number;
  amountPaid: number;
  trackingStatus: TrackingStatus;
  lastVisitDate?: string;
  nextFollowUpDate?: string;
  visits: Visit[];
  history: TrackingEvent[];
  images: PatientImage[];
}
