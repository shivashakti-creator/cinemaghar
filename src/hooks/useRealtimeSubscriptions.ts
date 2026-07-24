import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeCallbacks {
  onNewBooking?: (payload: any) => void;
  onPaymentUpdate?: (payload: any) => void;
  onTicketScan?: (payload: any) => void;
  onShowtimeUpdate?: (payload: any) => void;
}

export function useRealtimeSubscriptions(callbacks: RealtimeCallbacks) {
  useEffect(() => {
    // Subscribe to bookings insert/update channel
    const bookingsChannel = supabase
      .channel('admin-realtime-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Realtime Bookings update:', payload);
        if (callbacks.onNewBooking) callbacks.onNewBooking(payload);
      })
      .subscribe();

    // Subscribe to scan_logs channel
    const scanChannel = supabase
      .channel('admin-realtime-scans')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scan_logs' }, (payload) => {
        console.log('Realtime Ticket Scan update:', payload);
        if (callbacks.onTicketScan) callbacks.onTicketScan(payload);
      })
      .subscribe();

    // Subscribe to showtimes channel
    const showtimesChannel = supabase
      .channel('admin-realtime-showtimes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'showtimes' }, (payload) => {
        console.log('Realtime Showtimes update:', payload);
        if (callbacks.onShowtimeUpdate) callbacks.onShowtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(scanChannel);
      supabase.removeChannel(showtimesChannel);
    };
  }, [callbacks]);
}
