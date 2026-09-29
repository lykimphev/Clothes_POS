export interface Customer {
  id: number;
  name: string;
  phone?: string;
  sex?: string;
  points: number;
  total_spent: number;
  status?: boolean;
}
