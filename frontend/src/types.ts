export type Role = 'admin' | 'saler';
export type OrderStatus = 'new' | 'consulting' | 'closed' | 'cancelled';
export type TourType = 'grupal' | 'privado';

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerReturnVisit {
  id: string;
  customer_id: string;
  visit_number: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSearchResult {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  country: string | null;
  created_at: string;
  total_orders: number;
  total_visits: number;
  last_tour_date: string | null;
  last_booking_date: string | null;
}

export interface CustomerHistoryOrder {
  id: string;
  order_code: string;
  tour_name: string;
  tour_type?: TourType;
  private_tour_name?: string | null;
  booking_date: string;
  tour_date: string;
  status: OrderStatus;
  rating?: number | null;
  num_guests?: number | null;
  created_at: string;
  owner?: {
    display_name: string;
    username: string;
    avatar_url?: string | null;
  };
}

export interface CustomerHistoryVisit {
  id: string;
  visit_number: number;
  notes?: string | null;
  created_at: string;
  orders: CustomerHistoryOrder[];
}

export interface CustomerHistoryData {
  customer: Customer;
  visits: CustomerHistoryVisit[];
}

export interface Order {
  id: string;
  order_code: string;
  owner_id: string;
  customer_id?: string | null;
  return_visit_id?: string | null;
  tour_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  tour_date: string;
  status: OrderStatus;
  tour_type?: TourType;
  private_tour_name?: string | null;
  private_tour_pdf_path?: string | null;
  room_type?: string | null;
  num_guests?: number | null;
  rating?: number | null;
  notes: string | null;
  customer_country: string | null;
  destinations?: string[] | null;
  request_source: string | null;
  request_source_other: string | null;
  created_at: string;
  updated_at: string;
  owner?: Pick<Profile, 'display_name' | 'username' | 'avatar_url'>;
  customer?: Customer | null;
  return_visit?: CustomerReturnVisit | null;
}


export const ALLOWED_DESTINATIONS = [
  "Vietnam",
  "Tailandia",
  "Camboya",
  "Bali",
  "China",
  "Japon",
  "Corea",
  "Laos",
  "Singapore",
  "Malaisia",
] as const;

export type Destination = (typeof ALLOWED_DESTINATIONS)[number];

export interface Tour {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  target_user_id?: string | null;
  action_type: string;
  description: string;
  created_at: string;
  actor?: Pick<Profile, 'display_name' | 'username' | 'avatar_url'>;
  target_user?: Pick<Profile, 'display_name' | 'username' | 'avatar_url'>;
}
