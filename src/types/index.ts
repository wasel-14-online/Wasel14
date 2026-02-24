export type UserRole = 'passenger' | 'driver' | 'admin';
export type TripStatus = 'pending' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type Currency = 'AED' | 'SAR' | 'EGP' | 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Trip {
  id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_location: Location;
  dropoff_location: Location;
  status: TripStatus;
  fare: number;
  currency: Currency;
  distance: number;
  duration: number;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Driver extends User {
  status: 'offline' | 'online' | 'busy';
  current_location?: Location;
  rating: number;
  total_trips: number;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_color?: string;
}

export interface Payment {
  id: string;
  trip_id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'trip_update' | 'payment' | 'promo' | 'system' | 'safety';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
