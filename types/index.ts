export type UserRole = 'owner' | 'worker';

export interface Factory {
  id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  factory_id: string;
  role: UserRole;
  full_name: string;
}

export interface Machine {
  id: string;
  factory_id: string;
  name: string;
  location: string | null;
  maintenance_interval_days: number;
  last_maintenance_date: string | null;
  is_active: boolean;
}

export interface WorkOrder {
  id: string;
  factory_id: string;
  product_name: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  planned_start: string | null;
  planned_end: string | null;
  machine_id: string | null;
}

export interface MaintenanceLog {
  id: string;
  factory_id: string;
  machine_id: string;
  date: string;
  note: string | null;
}
