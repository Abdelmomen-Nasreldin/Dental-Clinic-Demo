import { Procedure } from './procedure';

export interface Visit {
  id: string;
  visitDate: string;
  diagnosis: string;
  notes?: string;
  procedures: Procedure[];
}
