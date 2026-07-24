import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { BookingRecord } from '../types/admin';
import { INITIAL_BOOKINGS } from '../data/mockData';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all bookings from Supabase
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr || !data || data.length === 0) {
        // Fallback to mock bookings
        const formatted: BookingRecord[] = INITIAL_BOOKINGS.map((b) => ({
          id: b.id,
          booking_code: b.id,
          movie_id: b.movieId,
          movie_title: b.movieTitle,
          customer_name: b.customerName,
          customer_phone: b.customerPhone,
          customer_email: b.customerEmail || '',
          show_date: b.date,
          show_time: b.time,
          hall_name: b.hallName,
          format: b.format || 'IMAX 3D',
          selected_seats: b.seatIds,
          food_items: b.snacks,
          ticket_total: b.ticketTotal || (b.grandTotal - (b.snackTotal || 0)),
          snack_total: b.snackTotal || 0,
          total_price: b.grandTotal,
          payment_method: b.paymentMethod as any,
          payment_status: b.status as any,
          qr_token: b.qrCodeData || b.id,
          created_at: b.createdAt
        }));
        setBookings(formatted);
      } else {
        const mapped: BookingRecord[] = data.map((item: any) => ({
          id: item.id,
          booking_code: item.booking_code || item.id,
          movie_id: item.movie_id,
          movie_title: item.movie_title,
          customer_name: item.customer_name,
          customer_phone: item.customer_phone,
          customer_email: item.customer_email || '',
          show_date: item.show_date || '',
          show_time: item.show_time || '',
          hall_name: item.hall_name || 'Hall 1 - IMAX 3D',
          format: item.format || '2D',
          selected_seats: Array.isArray(item.selected_seats) ? item.selected_seats : [],
          food_items: Array.isArray(item.food_items) ? item.food_items : [],
          ticket_total: Number(item.ticket_total || 0),
          snack_total: Number(item.snack_total || 0),
          total_price: Number(item.total_price || item.amount || 0),
          payment_method: item.payment_method || 'eSewa',
          payment_status: item.payment_status || 'CONFIRMED',
          qr_token: item.qr_token || item.booking_code || item.id,
          created_at: item.created_at || new Date().toISOString()
        }));
        setBookings(mapped);
      }
    } catch (err: any) {
      console.warn('Bookings fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update Booking Status in Supabase (Confirm, Cancel, Refund, Mark Used)
  const updateBookingStatus = async (
    bookingId: string,
    newStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | 'USED'
  ) => {
    try {
      await supabase
        .from('bookings')
        .update({ payment_status: newStatus })
        .eq('id', bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, payment_status: newStatus } : b))
      );
      return { success: true };
    } catch (err) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, payment_status: newStatus } : b))
      );
      return { success: true };
    }
  };

  // Mark Ticket as Used (for Scan Check-In)
  const markTicketAsUsed = async (bookingCode: string) => {
    const booking = bookings.find((b) => b.booking_code.toLowerCase() === bookingCode.toLowerCase());
    if (booking) {
      return updateBookingStatus(booking.id, 'USED');
    }
    return { success: false, error: 'Booking code not found' };
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    markTicketAsUsed
  };
}
