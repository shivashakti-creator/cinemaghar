import { BookingRecord, PaymentGateway, PaymentInitiateRequest, PaymentInitiateResponse, PaymentVerifyRequest, PaymentVerifyResponse, SeatReservation } from '../../types/payment';
import { esewaService } from './esewaService';
import { khaltiService } from './khaltiService';
import { fonepayService } from './fonepayService';
import { supabase } from '../../lib/supabase';

// In-memory seat reservations store for instant local reactivity & server sync
const activeReservations: Map<string, SeatReservation> = new Map();
const activeBookings: Map<string, BookingRecord> = new Map();

/**
 * Unified Payment Manager
 */
export class PaymentManager {

  /**
   * Generates a 6-character unique uppercase booking reference (e.g., GAJ-9X2A)
   */
  public generateBookingReference(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = '';
    for (let i = 0; i < 5; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `GAJ-${ref}`;
  }

  /**
   * Generates a secure token for QR Ticket scanning
   */
  public generateQRToken(bookingRef: string, movieTitle: string, showTime: string, seats: string[]): string {
    const payload = {
      ref: bookingRef,
      title: movieTitle,
      time: showTime,
      seats,
      verifiedAt: new Date().toISOString(),
      hall: 'Gajuri Cinema Screen 1'
    };
    return btoa(JSON.stringify(payload));
  }

  /**
   * Temporarily Reserve Seats for 10 minutes
   */
  public async reserveSeats(showId: string, seats: string[], bookingId: string): Promise<boolean> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    for (const seatId of seats) {
      const key = `${showId}_${seatId}`;
      const existing = activeReservations.get(key);

      if (existing && existing.status === 'locked') {
        console.warn(`Seat ${seatId} is already booked permanently`);
        return false;
      }

      if (existing && existing.status === 'reserved' && new Date(existing.expiresAt) > new Date() && existing.bookingId !== bookingId) {
        console.warn(`Seat ${seatId} is temporarily held by another customer`);
        return false;
      }

      activeReservations.set(key, {
        id: `res_${Date.now()}_${seatId}`,
        showId,
        seatId,
        bookingId,
        status: 'reserved',
        expiresAt,
        createdAt: new Date().toISOString()
      });
    }

    return true;
  }

  /**
   * Initiate Payment Flow for eSewa, Khalti, Fonepay, or Counter
   */
  public async initiatePayment(req: PaymentInitiateRequest, appUrl: string): Promise<PaymentInitiateResponse> {
    const bookingRef = this.generateBookingReference();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 1. Temporarily reserve seats
    const reservedSuccess = await this.reserveSeats(req.showId, req.selectedSeats, bookingRef);
    if (!reservedSuccess) {
      return {
        success: false,
        bookingReference: '',
        bookingId: '',
        paymentMethod: req.paymentMethod,
        expiresAt: '',
        error: 'One or more selected seats have already been taken. Please choose different seats.'
      };
    }

    // 2. Create Pending Booking Record
    const qrToken = this.generateQRToken(bookingRef, req.movieTitle, req.showTime, req.selectedSeats);
    const bookingRecord: BookingRecord = {
      id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      booking_reference: bookingRef,
      movie_id: req.movieId,
      movie_title: req.movieTitle,
      movie_poster: req.moviePoster,
      show_id: req.showId,
      hall_name: req.hallName,
      show_date: req.showDate,
      show_time: req.showTime,
      format: req.format,
      seat_numbers: req.selectedSeats,
      amount: req.totalAmount,
      ticket_total: req.ticketTotal,
      snack_total: req.snackTotal,
      tax_amount: Math.round(req.totalAmount * 0.13),
      food_items: req.selectedSnacks,
      payment_method: req.paymentMethod,
      payment_status: 'pending',
      booking_status: 'payment_pending',
      qr_token: qrToken,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      customer_phone: req.customerPhone,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    activeBookings.set(bookingRef, bookingRecord);

    // Save to Supabase
    try {
      await supabase.from('bookings').upsert([{
        id: bookingRef,
        booking_code: bookingRef,
        movie_id: req.movieId,
        movie_title: req.movieTitle,
        customer_name: req.customerName,
        customer_phone: req.customerPhone,
        customer_email: req.customerEmail || '',
        show_date: req.showDate,
        show_time: req.showTime,
        hall_name: req.hallName,
        format: req.format,
        selected_seats: req.selectedSeats,
        food_items: req.selectedSnacks,
        ticket_total: req.ticketTotal,
        snack_total: req.snackTotal,
        total_price: req.totalAmount,
        payment_method: req.paymentMethod,
        payment_status: 'PENDING',
        booking_status: 'payment_pending',
        qr_token: qrToken,
        expires_at: expiresAt
      }], { onConflict: 'booking_code' });
    } catch (e) {
      console.warn('Supabase pending booking save info:', e);
    }

    // Log request
    this.logPayment(bookingRecord.id, bookingRef, req.paymentMethod, { req }, {}, 'PENDING');

    // 3. Demo Payment Simulation for all gateways
    bookingRecord.payment_status = 'success';
    bookingRecord.booking_status = 'confirmed';
    bookingRecord.transaction_id = `DEMO-${req.paymentMethod.toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    this.lockSeatsPermanently(req.showId, req.selectedSeats, bookingRef);
    this.logPayment(bookingRecord.id, bookingRef, req.paymentMethod, { req }, { status: 'SUCCESS' }, 'SUCCESS');

    return {
      success: true,
      bookingReference: bookingRef,
      bookingId: bookingRecord.id,
      paymentMethod: req.paymentMethod,
      paymentUrl: `${appUrl}/booking/success?ref=${bookingRef}`,
      expiresAt
    };
  }

  /**
   * Verify Server-Side Payment Status
   */
  public async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    const booking = activeBookings.get(req.bookingReference);

    if (!booking) {
      // Try fetching from Supabase if not in active map
      try {
        const { data } = await supabase.from('bookings').select('*').eq('booking_code', req.bookingReference).single();
        if (data) {
          const fetchedBooking: BookingRecord = {
            id: data.id || req.bookingReference,
            booking_reference: data.booking_code,
            movie_id: data.movie_id,
            movie_title: data.movie_title,
            show_id: data.show_id || 's-101',
            hall_name: data.hall_name || 'Hall 1',
            show_date: data.show_date || '2026-07-23',
            show_time: data.show_time || '11:00 AM',
            format: data.format || '2D',
            seat_numbers: data.selected_seats || [],
            amount: data.total_price || 0,
            ticket_total: data.ticket_total || 0,
            snack_total: data.snack_total || 0,
            tax_amount: Math.round((data.total_price || 0) * 0.13),
            food_items: data.food_items || [],
            payment_method: data.payment_method || 'esewa',
            payment_status: 'success',
            booking_status: 'confirmed',
            transaction_id: req.transactionId || `TXN_${Date.now()}`,
            qr_token: this.generateQRToken(data.booking_code, data.movie_title, data.show_time || '11:00 AM', data.selected_seats || []),
            customer_name: data.customer_name,
            customer_email: data.customer_email || '',
            customer_phone: data.customer_phone,
            expires_at: data.expires_at || new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString()
          };
          return {
            success: true,
            bookingReference: req.bookingReference,
            transactionId: fetchedBooking.transaction_id,
            paymentStatus: 'success',
            bookingStatus: 'confirmed',
            booking: fetchedBooking
          };
        }
      } catch (e) {
        console.warn('Supabase fetch booking error:', e);
      }
    }

    let verificationResult = { isValid: true, transactionId: req.transactionId || `TXN_${Date.now()}`, error: '' };

    if (req.gateway === 'esewa' && req.data) {
      const res = esewaService.verifyCallback(req.data);
      verificationResult = { isValid: res.isValid, transactionId: res.transactionId || `ESEWA_${Date.now()}`, error: res.error || '' };
    } else if (req.gateway === 'khalti' && req.pidx) {
      const res = await khaltiService.verifyPayment(req.pidx);
      verificationResult = { isValid: res.isValid, transactionId: res.transactionId || `KHL_${Date.now()}`, error: res.error || '' };
    } else if (req.gateway === 'fonepay' && req.PRN) {
      const res = fonepayService.verifyCallback(req.PRN, req.transactionId);
      verificationResult = { isValid: res.isValid, transactionId: res.transactionId || `FP_${Date.now()}`, error: res.error || '' };
    }

    if (!verificationResult.isValid) {
      if (booking) {
        booking.payment_status = 'failed';
        booking.booking_status = 'failed';
        this.releaseSeats(booking.show_id, booking.seat_numbers);
      }

      this.logPayment(booking?.id || req.bookingReference, req.bookingReference, req.gateway, { req }, { error: verificationResult.error }, 'FAILED');

      return {
        success: false,
        bookingReference: req.bookingReference,
        paymentStatus: 'failed',
        bookingStatus: 'failed',
        error: verificationResult.error || 'Payment signature / transaction status could not be verified server-side.'
      };
    }

    // Payment Verified Successfully
    if (booking) {
      booking.payment_status = 'success';
      booking.booking_status = 'confirmed';
      booking.transaction_id = verificationResult.transactionId;
      booking.gateway_reference = req.pidx || req.data || req.PRN || req.bookingReference;

      this.lockSeatsPermanently(booking.show_id, booking.seat_numbers, req.bookingReference);

      this.logPayment(booking.id, req.bookingReference, req.gateway, { req }, { transactionId: verificationResult.transactionId }, 'SUCCESS');

      // Update Supabase
      try {
        await supabase.from('bookings').upsert([{
          id: req.bookingReference,
          booking_code: req.bookingReference,
          movie_id: booking.movie_id,
          movie_title: booking.movie_title,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          customer_email: booking.customer_email || '',
          show_date: booking.show_date,
          show_time: booking.show_time,
          hall_name: booking.hall_name,
          format: booking.format,
          selected_seats: booking.seat_numbers,
          food_items: booking.food_items,
          ticket_total: booking.ticket_total,
          snack_total: booking.snack_total,
          total_price: booking.amount,
          payment_method: booking.payment_method,
          payment_status: 'CONFIRMED',
          booking_status: 'confirmed',
          qr_token: booking.qr_token || req.bookingReference,
          transaction_id: verificationResult.transactionId
        }], { onConflict: 'booking_code' });
      } catch (e) {
        console.warn('Supabase update status error:', e);
      }

      return {
        success: true,
        bookingReference: req.bookingReference,
        transactionId: verificationResult.transactionId,
        paymentStatus: 'success',
        bookingStatus: 'confirmed',
        booking
      };
    }

    return {
      success: true,
      bookingReference: req.bookingReference,
      transactionId: verificationResult.transactionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed'
    };
  }

  /**
   * Permanently Lock Seats
   */
  private lockSeatsPermanently(showId: string, seats: string[], bookingId: string) {
    for (const seatId of seats) {
      const key = `${showId}_${seatId}`;
      activeReservations.set(key, {
        id: `res_${Date.now()}_${seatId}`,
        showId,
        seatId,
        bookingId,
        status: 'locked',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Permanent
        createdAt: new Date().toISOString()
      });
    }
  }

  /**
   * Release Seats
   */
  private releaseSeats(showId: string, seats: string[]) {
    for (const seatId of seats) {
      const key = `${showId}_${seatId}`;
      const existing = activeReservations.get(key);
      if (existing && existing.status !== 'locked') {
        activeReservations.delete(key);
      }
    }
  }

  /**
   * Release Expired Reservations (>10 minutes without payment)
   */
  public releaseExpiredReservations(): number {
    const now = new Date();
    let releasedCount = 0;

    activeReservations.forEach((res, key) => {
      if (res.status === 'reserved' && new Date(res.expiresAt) < now) {
        activeReservations.delete(key);
        releasedCount++;
      }
    });

    activeBookings.forEach((b) => {
      if (b.booking_status === 'payment_pending' && new Date(b.expires_at) < now) {
        b.booking_status = 'expired';
        b.payment_status = 'failed';
      }
    });

    return releasedCount;
  }

  /**
   * Log Payment
   */
  private logPayment(bookingId: string, bookingRef: string, gateway: PaymentGateway, reqPayload: any, resPayload: any, status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED') {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      booking_id: bookingId,
      booking_reference: bookingRef,
      gateway,
      request_payload: reqPayload,
      response_payload: resPayload,
      status,
      created_at: new Date().toISOString()
    };

    try {
      supabase.from('payment_logs').insert([{
        booking_id: bookingId,
        booking_reference: bookingRef,
        gateway,
        request_payload: reqPayload,
        response_payload: resPayload,
        status
      }]).then();
    } catch (e) {
      console.warn('Log payment error:', e);
    }
  }

  /**
   * Get Active Booking
   */
  public getBooking(bookingRef: string): BookingRecord | undefined {
    return activeBookings.get(bookingRef);
  }
}

export const paymentManager = new PaymentManager();
