export type TrackingStatus = 'New' | 'InTreatment' | 'FollowUpNeeded' | 'Completed';

export interface TrackingEvent {
  id: string;
  date: string;
  type: 'status_change' | 'visit' | 'note' | 'follow_up' | 'payment';
  description: string;
}

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
  history: TrackingEvent[];
}
