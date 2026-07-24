export type PaymentGateway = 'esewa' | 'khalti' | 'fonepay' | 'counter';

export type BookingStatus = 
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'failed'
  | 'expired';

export type PaymentStatus = 
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded';

export interface SeatReservation {
  id: string;
  showId: string;
  seatId: string;
  bookingId: string;
  status: 'reserved' | 'locked' | 'expired';
  expiresAt: string; // ISO String
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  booking_reference: string;
  user_id?: string;
  movie_id: string;
  movie_title: string;
  movie_poster?: string;
  show_id: string;
  hall_name: string;
  show_date: string;
  show_time: string;
  format: string;
  seat_numbers: string[];
  amount: number;
  ticket_total: number;
  snack_total: number;
  tax_amount: number;
  food_items?: { foodId: string; name: string; quantity: number; price: number }[];
  payment_method: PaymentGateway;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  transaction_id?: string;
  gateway_reference?: string;
  qr_token: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  expires_at: string;
  created_at: string;
}

export interface PaymentLog {
  id: string;
  booking_id: string;
  booking_reference: string;
  gateway: PaymentGateway;
  request_payload: Record<string, any>;
  response_payload: Record<string, any>;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  created_at: string;
}

export interface PaymentInitiateRequest {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  showId: string;
  hallName: string;
  showDate: string;
  showTime: string;
  format: string;
  selectedSeats: string[];
  selectedSnacks: { foodId: string; name: string; quantity: number; price: number }[];
  ticketTotal: number;
  snackTotal: number;
  totalAmount: number;
  paymentMethod: PaymentGateway;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  bookingReference: string;
  bookingId: string;
  paymentMethod: PaymentGateway;
  paymentUrl?: string; // Redirect URL for Khalti or eSewa
  gatewayData?: Record<string, any>; // Form fields for eSewa or Fonepay
  expiresAt: string;
  error?: string;
}

export interface PaymentVerifyRequest {
  bookingReference: string;
  gateway: PaymentGateway;
  transactionId?: string;
  pidx?: string; // Khalti
  data?: string; // eSewa base64 encoded string
  PRN?: string; // Fonepay
  status?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  bookingReference: string;
  transactionId?: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  booking?: BookingRecord;
  error?: string;
}

export interface GatewayConfig {
  esewa: {
    merchantCode: string;
    secretKey: string;
    targetUrl: string;
  };
  khalti: {
    publicKey: string;
    secretKey: string;
    targetUrl: string;
  };
  fonepay: {
    merchantCode: string;
    secretKey: string;
    targetUrl: string;
  };
}
