export type UserRole = 'owner' | 'worker';

export type LocaleCode = 'ar' | 'fr';

export interface Factory {
  id: string;
  name: string;
  industry_type: string | null;
  address: string | null;
  contact_info: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  factory_id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  locale?: LocaleCode;
}

export interface Machine {
  id: string;
  factory_id: string;
  name: string;
  location: string | null;
  notes: string | null;
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

export interface Supplier {
  id: string;
  factory_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  lead_time_days: number | null;
  minimum_order: number | null;
  is_active: boolean;
  created_at: string;
}
