import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ShowtimeRecord } from '../types/admin';
import { INITIAL_SHOWTIMES } from '../data/mockData';

export function useShowtimes() {
  const [showtimes, setShowtimes] = useState<ShowtimeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch showtimes from Supabase
  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('showtimes')
        .select('*')
        .order('date', { ascending: true });

      if (fetchErr || !data || data.length === 0) {
        // Fallback to initial showtimes formatted as ShowtimeRecord
        const formatted: ShowtimeRecord[] = INITIAL_SHOWTIMES.map((s) => ({
          id: s.id,
          movie_id: s.movieId,
          hall: s.hallName || 'Hall 1 - IMAX 3D',
          hall_id: s.hallId,
          screen_name: s.screenName,
          show_date: s.date,
          start_time: s.time,
          end_time: s.endTime || '06:00 PM',
          format: s.format,
          regular_price: s.prices.regular || 350,
          premium_price: s.prices.premium || 500,
          vip_price: s.prices.vip || 800,
          total_seats: s.seatCapacity || 120,
          booked_seat_ids: s.bookedSeatIds || [],
          blocked_seat_ids: s.blockedSeatIds || [],
          created_at: new Date().toISOString()
        }));
        setShowtimes(formatted);
      } else {
        const mapped: ShowtimeRecord[] = data.map((item: any) => ({
          id: item.id,
          movie_id: item.movie_id,
          hall: item.hall_name || item.hall || 'Hall 1 - IMAX 3D',
          hall_id: item.hall_id || 'hall-1',
          screen_name: item.screen_name || 'Screen 1',
          show_date: item.date || item.show_date || '',
          start_time: item.time || item.start_time || '',
          end_time: item.end_time || '',
          format: item.format || 'IMAX 3D',
          regular_price: typeof item.prices === 'object' ? (item.prices.regular || 350) : (item.regular_price || 350),
          premium_price: typeof item.prices === 'object' ? (item.prices.premium || 500) : (item.premium_price || 500),
          vip_price: typeof item.prices === 'object' ? (item.prices.vip || 800) : (item.vip_price || 800),
          total_seats: item.seat_capacity || item.total_seats || 120,
          booked_seat_ids: Array.isArray(item.booked_seat_ids) ? item.booked_seat_ids : [],
          blocked_seat_ids: Array.isArray(item.blocked_seat_ids) ? item.blocked_seat_ids : [],
          created_at: item.created_at || new Date().toISOString()
        }));
        setShowtimes(mapped);
      }
    } catch (err: any) {
      console.warn('Showtimes fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  // Helper to generate seat inventory rows A-J (1-15) for show_seats table
  const generateSeatInventory = (showtimeId: string) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 15;
    const inventory = [];

    for (const row of rows) {
      const category = (row === 'I' || row === 'J') ? 'VIP' : (row === 'G' || row === 'H') ? 'PREMIUM' : 'REGULAR';
      for (let num = 1; num <= seatsPerRow; num++) {
        const seatCode = `${row}${num}`;
        inventory.push({
          showtime_id: showtimeId,
          seat_number: seatCode,
          row_label: row,
          seat_num: num,
          category: category,
          status: 'available',
          price: category === 'VIP' ? 800 : category === 'PREMIUM' ? 500 : 350
        });
      }
    }
    return inventory;
  };

  // Create Showtime with automatic seat inventory creation
  const createShowtime = async (data: Partial<ShowtimeRecord>) => {
    const id = data.id || `st-${Date.now()}`;
    const newRecord: ShowtimeRecord = {
      id,
      movie_id: data.movie_id || '',
      hall: data.hall || 'Hall 1 - IMAX 3D',
      hall_id: data.hall_id || 'hall-1',
      screen_name: data.screen_name || 'Screen 1',
      show_date: data.show_date || new Date().toISOString().slice(0, 10),
      start_time: data.start_time || '03:30 PM',
      end_time: data.end_time || '06:00 PM',
      format: data.format || 'IMAX 3D',
      regular_price: data.regular_price || 350,
      premium_price: data.premium_price || 500,
      vip_price: data.vip_price || 800,
      total_seats: data.total_seats || 120,
      booked_seat_ids: [],
      blocked_seat_ids: [],
      created_at: new Date().toISOString()
    };

    try {
      // 1. Insert into showtimes table
      const { error: dbErr } = await supabase.from('showtimes').upsert([{
        id: newRecord.id,
        movie_id: newRecord.movie_id,
        hall_id: newRecord.hall_id,
        hall_name: newRecord.hall,
        screen_name: newRecord.screen_name,
        date: newRecord.show_date,
        time: newRecord.start_time,
        end_time: newRecord.end_time,
        format: newRecord.format,
        prices: {
          regular: newRecord.regular_price,
          premium: newRecord.premium_price,
          vip: newRecord.vip_price
        },
        seat_capacity: newRecord.total_seats,
        booked_seat_ids: [],
        blocked_seat_ids: []
      }]);

      if (dbErr) console.warn('Supabase showtime insert error:', dbErr);

      // 2. Automatically generate seat inventory in `show_seats` table if it exists
      try {
        const seatInventory = generateSeatInventory(newRecord.id);
        await supabase.from('show_seats').insert(seatInventory);
      } catch (seatErr) {
        console.warn('Seat inventory auto-gen skipped:', seatErr);
      }

      setShowtimes((prev) => [newRecord, ...prev]);
      return { success: true, showtime: newRecord };
    } catch (err) {
      setShowtimes((prev) => [newRecord, ...prev]);
      return { success: true, showtime: newRecord };
    }
  };

  // Edit Showtime
  const updateShowtime = async (id: string, updates: Partial<ShowtimeRecord>) => {
    try {
      await supabase.from('showtimes').update({
        date: updates.show_date,
        time: updates.start_time,
        end_time: updates.end_time,
        hall_name: updates.hall,
        format: updates.format,
        prices: {
          regular: updates.regular_price || 350,
          premium: updates.premium_price || 500,
          vip: updates.vip_price || 800
        }
      }).eq('id', id);

      setShowtimes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      return { success: true };
    } catch (err) {
      setShowtimes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      return { success: true };
    }
  };

  // Delete Showtime
  const deleteShowtime = async (id: string) => {
    try {
      await supabase.from('showtimes').delete().eq('id', id);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    } catch (err) {
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    }
  };

  // Duplicate Showtime for another date
  const duplicateShowtime = async (id: string, newDate: string) => {
    const existing = showtimes.find((s) => s.id === id);
    if (!existing) return;
    return createShowtime({
      ...existing,
      id: `st-${Date.now()}`,
      show_date: newDate,
      booked_seat_ids: [],
      blocked_seat_ids: []
    });
  };

  return {
    showtimes,
    loading,
    error,
    fetchShowtimes,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    duplicateShowtime
  };
}
