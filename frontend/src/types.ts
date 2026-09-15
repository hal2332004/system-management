export type Role = 'admin' | 'saler';
export type OrderStatus = 'new' | 'confirmed' | 'deposited' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  owner_id: string;
  tour_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  tour_date: string;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  owner?: Pick<Profile, 'display_name' | 'username'>;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action_type: string;
  description: string;
  created_at: string;
  actor?: Pick<Profile, 'display_name' | 'username'>;
}
