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
}
