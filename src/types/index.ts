export type MovieStatus =
  | 'NOW_SHOWING'
  | 'COMING_SOON'
  | 'ADVANCE_BOOKING'
  | 'SPECIAL_SCREENING'
  | 'FESTIVAL_SCREENING'
  | 'ARCHIVED'
  | 'HIDDEN';

export interface CastMember {
  name: string;
  role: string;
  image: string;
}

export interface Movie {
  id: string;
  title: string;
  subtitle?: string;
  nepaliTitle?: string;
  poster: string;
  backdrop: string;
  verticalPoster?: string;
  trailerThumbnail?: string;
  synopsis: string;
  duration: string;
  releaseDate: string;
  endDate?: string;
  genre: string[];
  rating: number; // e.g. 8.8
  ageRating: 'U' | 'U/A' | '16+' | '18+' | 'PG-13' | 'PG' | 'R';
  censorRating?: string; // e.g. "U (Nepal Censor Board)"
  languages: string[];
  country?: string;
  industry: 'Nepali' | 'Bollywood' | 'Hollywood' | 'International';
  status: MovieStatus;
  youtubeTrailerUrl: string; // Official YouTube channel embed URL
  teaserUrl?: string;
  director: string;
  producer?: string;
  mainCastText?: string;
  musicDirector?: string;
  cinematographer?: string;
  cast: CastMember[];
  hallType: string; // e.g. "Hall 1 - IMAX 3D Laser"
  featured?: boolean;
  createdAt?: string;
}

export type SeatType = 'regular' | 'executive' | 'vip' | 'recliner';
export type SeatState = 'available' | 'selected' | 'booked' | 'blocked';

export interface Seat {
  id: string; // e.g. "A1"
  row: string; // e.g. "A"
  number: number;
  type: SeatType;
  price: number; // in NPR
  status: SeatState;
}

export interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  hallName: string;
  screenName?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM", "02:30 PM", "06:00 PM", "09:15 PM"
  endTime?: string;
  intermissionTime?: string;
  format: '2D' | '3D' | 'IMAX 3D' | 'Dolby Atmos' | '4DX';
  prices: {
    regular: number; // e.g. 350
    executive?: number; // e.g. 500
    premium?: number;
    vip: number; // e.g. 800
    recliner?: number;
  };
  seatCapacity?: number;
  bookedSeatIds: string[];
  blockedSeatIds: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'Popcorn' | 'Beverages' | 'Combos' | 'Nepali Snacks';
  price: number; // NPR
  image: string;
  description: string;
  popular?: boolean;
}

export interface SelectedSnack {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'eSewa' | 'Khalti' | 'IME Pay' | 'Card' | 'Counter';

export type UserRole = 'user' | 'staff' | 'admin';

export type StaffRoleType = 'Counter Staff' | 'Gate Scanner' | 'Cinema Manager' | 'Hall Supervisor';

export interface StaffAccount {
  id: string;
  staffId: string; // e.g. STF-001
  fullName: string;
  email: string;
  phone: string;
  branch: string; // e.g. "Gajuri Main Branch"
  assignedHall: string; // e.g. "Hall 1 - IMAX 3D Laser", "All Screens"
  role: StaffRoleType;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ScanLog {
  id: string;
  bookingId: string;
  staffId: string;
  staffName: string;
  scanMethod: 'camera' | 'upload' | 'manual';
  scanResult: 'valid' | 'invalid' | 'already_used';
  manualReason?: string;
  scannedAt: string;
  deviceInfo?: string;
  branch?: string;
}

export interface Booking {
  id: string; // e.g. "GAJ-20260723-9981"
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  showtimeId: string;
  hallName: string;
  date: string;
  time: string;
  format: string;
  seatIds: string[]; // e.g. ["D5", "D6"]
  seatsDescription: string; // e.g. "Rows D (Executive) - D5, D6"
  snacks: SelectedSnack[];
  ticketTotal: number;
  snackTotal: number;
  taxAmount: number; // 13% VAT / Cinema Tax included or extra
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentTransactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  qrCodeData: string;
  createdAt: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'USED' | 'CANCELLED';
  scannedBy?: string; // staff ID
  scannedByName?: string; // staff full name
  scannedAt?: string; // ISO string
  manualCheckinReason?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  memberTier: 'Silver' | 'Gold' | 'Gajuri VIP';
  avatar: string;
}

export interface RevenueMetric {
  date: string;
  amount: number;
  bookingsCount: number;
}
