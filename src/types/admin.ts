export type AdminRole = 'admin' | 'super_admin' | 'staff' | 'user';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  created_at?: string;
}

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON' | 'ADVANCE_BOOKING' | 'ARCHIVED' | 'HIDDEN';

export interface MovieRecord {
  id: string;
  title: string;
  subtitle?: string;
  nepaliTitle?: string;
  description: string; // or synopsis
  synopsis?: string;
  duration_minutes: number;
  duration?: string;
  language: string; // or languages array
  languages?: string[];
  country: string;
  age_rating: string; // e.g. U/A, 16+, 18+
  release_date: string;
  end_date?: string;
  trailer_url: string; // YouTube
  youtubeTrailerUrl?: string;
  status: MovieStatus;
  poster_url: string;
  poster?: string;
  banner_url: string;
  backdrop?: string;
  vertical_poster?: string;
  genre?: string[];
  rating?: number;
  director?: string;
  producer?: string;
  cast_members?: { name: string; role: string; image?: string }[];
  hall_type?: string;
  featured?: boolean;
  created_at?: string;
}

export interface ShowtimeRecord {
  id: string;
  movie_id: string;
  movie_title?: string;
  poster_url?: string;
  hall: string; // e.g. 'Hall 1 - IMAX 3D', 'Hall 2 - Dolby Atmos'
  hall_id?: string;
  screen_name?: string;
  show_date: string;
  start_time: string;
  end_time: string;
  format?: string; // 2D, 3D, IMAX 3D, Dolby Atmos
  regular_price: number;
  premium_price: number;
  vip_price: number;
  total_seats: number;
  booked_seat_ids: string[];
  blocked_seat_ids: string[];
  created_at?: string;
}

export interface BookingRecord {
  id: string;
  booking_code: string;
  movie_id: string;
  movie_title: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  show_date: string;
  show_time: string;
  hall_name: string;
  format?: string;
  selected_seats: string[];
  food_items?: { foodId: string; name: string; quantity: number; price: number }[];
  ticket_total: number;
  snack_total: number;
  total_price: number;
  payment_method: 'eSewa' | 'Khalti' | 'Fonepay' | 'IME Pay' | 'Cash' | 'Card';
  payment_status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | 'USED';
  qr_token?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_code: string;
  provider: 'eSewa' | 'Khalti' | 'Fonepay' | 'IME Pay' | 'Cash' | 'Card';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  transaction_id: string;
  created_at: string;
  customer_name?: string;
}

export interface StaffRecord {
  id: string;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'staff' | 'admin';
  is_active: boolean;
  last_login?: string;
  total_scans?: number;
  device_used?: string;
  branch?: string;
  assigned_hall?: string;
  created_at?: string;
}

export interface ScanLogRecord {
  id: string;
  scanned_at: string;
  booking_code: string;
  booking_id?: string;
  staff_name: string;
  staff_id?: string;
  scan_method: 'camera' | 'upload' | 'manual';
  scan_result: 'valid' | 'invalid' | 'already_used';
  manual_reason?: string;
  device_info?: string;
  branch?: string;
}

export interface DashboardMetrics {
  totalMovies: number;
  activeShowtimes: number;
  todaysBookings: number;
  todaysRevenue: number;
  occupancyRate: number;
  totalCustomers: number;
  sevenDayRevenue: { date: string; revenue: number; bookingsCount: number }[];
  bookingStatusDistribution: { name: string; value: number; color: string }[];
  popularMovies: { title: string; bookings: number; revenue: number }[];
}
