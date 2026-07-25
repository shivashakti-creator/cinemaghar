import { createClient } from '@supabase/supabase-js';
import { Movie, Showtime, Booking, StaffAccount, ScanLog } from '../types';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const rawUrl = (env.VITE_SUPABASE_URL || '').trim();
const rawKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

function formatSupabaseUrl(url: string): string {
  if (!url) {
    return 'https://qfylfqobfsuprtvnhvco.supabase.co';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.includes('.')) {
    return `https://${url}`;
  }
  return `https://${url}.supabase.co`;
}

const supabaseUrl = formatSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey || 'sb_publishable_TlrVZJAlHME0QBQIcjuFtw_JjJCGaDZ';

console.log('[Supabase Init]: Target URL =', supabaseUrl);
console.log('[Supabase Init]: Anon Key exists =', Boolean(supabaseAnonKey), `(length: ${supabaseAnonKey.length})`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseBookingRecord {
  id?: string;
  created_at?: string;
  booking_code: string;
  movie_id: string;
  movie_title: string;
  movie_poster?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  show_date?: string;
  show_time: string;
  hall_name: string;
  format?: string;
  selected_seats: string[];
  food_items?: { foodId: string; name: string; quantity: number; price: number }[];
  ticket_total?: number;
  snack_total?: number;
  total_price: number;
  payment_method: string;
  payment_status?: string;
  qr_token?: string;
  scanned_by?: string;
  scanned_by_name?: string;
  scanned_at?: string;
  manual_checkin_reason?: string;
}

export async function saveBookingToSupabase(booking: any) {
  try {
    const isAppBooking = 'movieId' in booking;
    const record = {
      id: booking.id || booking.booking_code,
      booking_code: isAppBooking ? booking.id : booking.booking_code,
      movie_id: isAppBooking ? booking.movieId : booking.movie_id,
      movie_title: isAppBooking ? booking.movieTitle : booking.movie_title,
      movie_poster: isAppBooking ? booking.moviePoster || '' : booking.movie_poster || '',
      customer_name: isAppBooking ? booking.customerName : booking.customer_name,
      customer_phone: isAppBooking ? booking.customerPhone : booking.customer_phone,
      customer_email: isAppBooking ? booking.customerEmail || '' : booking.customer_email || '',
      show_date: isAppBooking ? booking.date : booking.show_date || '',
      show_time: isAppBooking ? booking.time : booking.show_time,
      hall_name: isAppBooking ? booking.hallName : booking.hall_name,
      format: isAppBooking ? booking.format : booking.format || '2D',
      selected_seats: isAppBooking ? booking.seatIds : booking.selected_seats,
      food_items: isAppBooking ? booking.snacks : booking.food_items || [],
      ticket_total: isAppBooking ? booking.ticketTotal : booking.ticket_total || 0,
      snack_total: isAppBooking ? booking.snackTotal : booking.snack_total || 0,
      total_price: isAppBooking ? booking.grandTotal : booking.total_price,
      payment_method: isAppBooking ? booking.paymentMethod : booking.payment_method,
      payment_status: isAppBooking ? (booking.status === 'USED' || booking.status === 'CHECKED_IN' ? 'USED' : 'CONFIRMED') : (booking.payment_status || 'CONFIRMED'),
      qr_token: isAppBooking ? (booking.qrCodeData || booking.id) : (booking.qr_token || booking.booking_code),
      scanned_by: isAppBooking ? (booking.scannedBy || '') : (booking.scanned_by || ''),
      scanned_by_name: isAppBooking ? (booking.scannedByName || '') : (booking.scanned_by_name || ''),
      scanned_at: isAppBooking ? (booking.scannedAt || null) : (booking.scanned_at || null),
      manual_checkin_reason: isAppBooking ? (booking.manualCheckinReason || '') : (booking.manual_checkin_reason || ''),
      created_at: isAppBooking ? (booking.createdAt || new Date().toISOString()) : (booking.created_at || new Date().toISOString())
    };

    console.log('[Supabase saveBookingToSupabase Request]:', record);
    const { data, error } = await supabase
      .from('bookings')
      .upsert([record], { onConflict: 'booking_code' })
      .select();

    if (error) {
      console.warn('Supabase booking upsert warning:', error);
      return { success: false, error };
    }

    console.log('Successfully saved booking to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to save booking to Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updateBookingStatusInSupabase(
  bookingId: string,
  paymentStatus: string,
  extraUpdates?: { scannedBy?: string; scannedByName?: string; scannedAt?: string; manualCheckinReason?: string }
) {
  try {
    const updatePayload: Record<string, any> = { payment_status: paymentStatus };
    if (extraUpdates?.scannedBy) updatePayload.scanned_by = extraUpdates.scannedBy;
    if (extraUpdates?.scannedByName) updatePayload.scanned_by_name = extraUpdates.scannedByName;
    if (extraUpdates?.scannedAt) updatePayload.scanned_at = extraUpdates.scannedAt;
    if (extraUpdates?.manualCheckinReason) updatePayload.manual_checkin_reason = extraUpdates.manualCheckinReason;

    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .or(`id.eq.${bookingId},booking_code.eq.${bookingId}`)
      .select();

    return { success: !error, data, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

// Upload file helper (Supabase storage or Base64 Data URL)
export async function uploadMediaFileToSupabase(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `poster_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('movies').upload(fileName, file);
        if (!error && data) {
          const { data: publicData } = supabase.storage.from('movies').getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            resolve(publicData.publicUrl);
            return;
          }
        }
      } catch (err) {
        console.warn('Storage upload fallback to Base64:', err);
      }
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

// Fetch Movies from Supabase
export async function fetchMoviesFromSupabase(): Promise<Movie[] | null> {
  try {
    console.log('[Supabase fetchMoviesFromSupabase]: Querying public.movies table...');
    const { data, error } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    
    console.log('[Supabase fetchMoviesFromSupabase Response]:', { count: data?.length, error });
    if (error) {
      console.warn('[Supabase fetchMoviesFromSupabase Notice]: Supabase database error:', error.message || error);
      return null;
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || '',
      nepaliTitle: item.nepali_title || '',
      poster: item.poster || '',
      backdrop: item.backdrop || '',
      verticalPoster: item.vertical_poster || '',
      trailerThumbnail: item.trailer_thumbnail || '',
      synopsis: item.synopsis || '',
      duration: item.duration || '',
      duration_minutes: item.duration_minutes || 120,
      releaseDate: item.release_date || '',
      endDate: item.end_date || '',
      genre: typeof item.genre === 'string' ? JSON.parse(item.genre) : item.genre || [],
      rating: item.rating || 9.0,
      ageRating: item.age_rating || 'U/A',
      censorRating: item.censor_rating || 'U/A (Nepal Censor Board)',
      languages: typeof item.languages === 'string' ? JSON.parse(item.languages) : item.languages || ['Nepali'],
      country: item.country || 'Nepal',
      industry: item.industry || 'Nepali',
      status: item.status || 'NOW_SHOWING',
      youtubeTrailerUrl: item.youtube_trailer_url || '',
      teaserUrl: item.teaser_url || '',
      director: item.director || '',
      producer: item.producer || '',
      mainCastText: item.main_cast_text || '',
      musicDirector: item.music_director || '',
      cinematographer: item.cinematographer || '',
      cast: typeof item.cast_members === 'string' ? JSON.parse(item.cast_members) : item.cast_members || [],
      hallType: item.hall_type || 'Hall 1 - IMAX 3D Laser',
      featured: item.featured ?? false,
      createdAt: item.created_at
    }));
  } catch (err) {
    console.error('[Supabase fetchMoviesFromSupabase Exception]:', err);
    return null;
  }
}

// Fetch Showtimes from Supabase
export async function fetchShowtimesFromSupabase(): Promise<Showtime[] | null> {
  try {
    console.log('[Supabase fetchShowtimesFromSupabase]: Querying public.showtimes table...');
    const { data, error } = await supabase.from('showtimes').select('*').order('date', { ascending: true });

    if (error) {
      console.warn('[Supabase fetchShowtimesFromSupabase Error]:', error.message);
      return null;
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      movieId: item.movie_id,
      hallId: item.hall_id || 'hall-1',
      hallName: item.hall_name || 'Hall 1 - IMAX 3D Laser',
      screenName: item.screen_name || 'Screen 1',
      date: item.date || '',
      time: item.time || '',
      endTime: item.end_time || '',
      intermissionTime: item.intermission_time || '15 mins',
      format: item.format || 'IMAX 3D',
      prices: typeof item.prices === 'string' ? JSON.parse(item.prices) : (item.prices || { regular: 350, executive: 500, vip: 800 }),
      seatCapacity: item.seat_capacity || 120,
      bookedSeatIds: typeof item.booked_seat_ids === 'string' ? JSON.parse(item.booked_seat_ids) : item.booked_seat_ids || [],
      blockedSeatIds: typeof item.blocked_seat_ids === 'string' ? JSON.parse(item.blocked_seat_ids) : item.blocked_seat_ids || []
    }));
  } catch (err) {
    console.error('[Supabase fetchShowtimesFromSupabase Exception]:', err);
    return null;
  }
}

// Save Showtime to Supabase
export async function saveShowtimeToSupabase(showtime: Showtime) {
  try {
    const record = {
      id: showtime.id,
      movie_id: showtime.movieId,
      hall_id: showtime.hallId || 'hall-1',
      hall_name: showtime.hallName || 'Hall 1 - IMAX 3D Laser',
      screen_name: showtime.screenName || 'Screen 1',
      date: showtime.date,
      time: showtime.time,
      end_time: showtime.endTime || '',
      intermission_time: showtime.intermissionTime || '15 mins',
      format: showtime.format || 'IMAX 3D',
      prices: showtime.prices,
      seat_capacity: showtime.seatCapacity || 120,
      booked_seat_ids: showtime.bookedSeatIds || [],
      blocked_seat_ids: showtime.blockedSeatIds || []
    };

    console.log('[Supabase saveShowtimeToSupabase Request]:', record);
    const { data, error } = await supabase.from('showtimes').upsert([record]).select();

    if (error) {
      console.error('[Supabase saveShowtimeToSupabase Error]:', error);
    }
    return { success: !error, data, error };
  } catch (err) {
    console.error('[Supabase saveShowtimeToSupabase Exception]:', err);
    return { success: false, error: err };
  }
}

// Delete Showtime from Supabase
export async function deleteShowtimeFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('showtimes').delete().eq('id', id);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

// Fetch Bookings from Supabase
export async function fetchBookingsFromSupabase(): Promise<any[] | null> {
  try {
    console.log('[Supabase fetchBookingsFromSupabase]: Querying public.bookings table...');
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase fetchBookingsFromSupabase Error]:', error.message);
      return null;
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id || item.booking_code,
      movieId: item.movie_id,
      movieTitle: item.movie_title,
      moviePoster: item.movie_poster || '',
      showtimeId: item.movie_id,
      hallName: item.hall_name || 'Hall 1 - IMAX 3D',
      date: item.show_date || '',
      time: item.show_time || '',
      format: item.format || '2D',
      seatIds: typeof item.selected_seats === 'string' ? JSON.parse(item.selected_seats) : item.selected_seats || [],
      seatsDescription: Array.isArray(item.selected_seats) ? item.selected_seats.join(', ') : '',
      snacks: typeof item.food_items === 'string' ? JSON.parse(item.food_items) : item.food_items || [],
      ticketTotal: Number(item.ticket_total || 0),
      snackTotal: Number(item.snack_total || 0),
      taxAmount: Math.round(Number(item.total_price || 0) * 0.13),
      grandTotal: Number(item.total_price || 0),
      paymentMethod: item.payment_method || 'eSewa',
      paymentTransactionId: `${(item.payment_method || 'eSewa').toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerName: item.customer_name || 'Guest',
      customerEmail: item.customer_email || '',
      customerPhone: item.customer_phone || '',
      qrCodeData: item.qr_token || item.booking_code || item.id,
      createdAt: item.created_at || new Date().toISOString(),
      status: item.payment_status || 'CONFIRMED',
      scannedBy: item.scanned_by || '',
      scannedByName: item.scanned_by_name || '',
      scannedAt: item.scanned_at || '',
      manualCheckinReason: item.manual_checkin_reason || ''
    }));
  } catch (err) {
    console.error('[Supabase fetchBookingsFromSupabase Exception]:', err);
    return null;
  }
}

// Delete Booking from Supabase
export async function deleteBookingFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('bookings').delete().or(`id.eq.${id},booking_code.eq.${id}`);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}


// Save Movie to Supabase
export async function saveMovieToSupabase(movie: Movie) {
  try {
    const record = {
      id: movie.id,
      title: movie.title,
      subtitle: movie.subtitle || '',
      nepali_title: movie.nepaliTitle || '',
      poster: movie.poster,
      backdrop: movie.backdrop,
      vertical_poster: movie.verticalPoster || '',
      trailer_thumbnail: movie.trailerThumbnail || '',
      synopsis: movie.synopsis,
      duration: movie.duration,
      duration_minutes: movie.duration_minutes || parseInt(movie.duration || '120') || 120,
      release_date: movie.releaseDate,
      end_date: movie.endDate || '',
      genre: movie.genre || [],
      rating: movie.rating || 9.0,
      age_rating: movie.ageRating || 'U/A',
      censor_rating: movie.censorRating || 'U/A (Nepal Censor Board)',
      languages: movie.languages || ['Nepali'],
      country: movie.country || 'Nepal',
      industry: movie.industry || 'Nepali',
      status: movie.status,
      youtube_trailer_url: movie.youtubeTrailerUrl || '',
      teaser_url: movie.teaserUrl || '',
      director: movie.director || '',
      producer: movie.producer || '',
      main_cast_text: movie.mainCastText || '',
      music_director: movie.musicDirector || '',
      cinematographer: movie.cinematographer || '',
      cast_members: movie.cast || [],
      hall_type: movie.hallType || 'Hall 1 - IMAX 3D Laser',
      featured: movie.featured ?? false
    };

    console.log('[Supabase saveMovieToSupabase Request]: Saving record to public.movies:', record);
    const { data, error } = await supabase.from('movies').upsert([record]).select();

    console.log('[Supabase saveMovieToSupabase Response]:', data);
    if (error) {
      console.error('[Supabase saveMovieToSupabase Error]: Failed to save to public.movies:', error);
    }
    return { success: !error, data, error };
  } catch (err) {
    console.error('[Supabase saveMovieToSupabase Exception]:', err);
    return { success: false, error: err };
  }
}

// Fetch Staff Members from Supabase
export async function fetchStaffFromSupabase(): Promise<StaffAccount[] | null> {
  try {
    const { data, error } = await supabase.from('staff_members').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase fetchStaffFromSupabase Error]:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((item: any) => ({
      id: item.id,
      staffId: item.staff_id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      branch: item.branch || 'Gajuri Main Branch',
      assignedHall: item.assigned_hall || 'All Screens',
      role: item.role || 'Gate Scanner',
      isActive: item.is_active ?? true,
      createdAt: item.created_at || new Date().toISOString(),
      password: item.password_hash || 'staff123'
    }));
  } catch (err) {
    console.error('[Supabase fetchStaffFromSupabase Exception]:', err);
    return null;
  }
}

// Save Staff Member to Supabase
export async function saveStaffToSupabase(staff: StaffAccount) {
  try {
    const record = {
      id: staff.id,
      staff_id: staff.staffId,
      full_name: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      password_hash: staff.password || 'staff123',
      branch: staff.branch,
      assigned_hall: staff.assignedHall,
      role: staff.role,
      is_active: staff.isActive
    };
    const { data, error } = await supabase.from('staff_members').upsert([record], { onConflict: 'id' }).select();
    if (error) console.error('[Supabase saveStaffToSupabase Error]:', error);
    return { success: !error, data, error };
  } catch (err) {
    console.error('[Supabase saveStaffToSupabase Exception]:', err);
    return { success: false, error: err };
  }
}

// Delete Staff Member from Supabase
export async function deleteStaffFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

// Fetch Scan Logs from Supabase
export async function fetchScanLogsFromSupabase(): Promise<ScanLog[] | null> {
  try {
    const { data, error } = await supabase.from('scan_logs').select('*').order('scanned_at', { ascending: false });
    if (error) {
      console.warn('[Supabase fetchScanLogsFromSupabase Error]:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((item: any) => ({
      id: item.id,
      bookingId: item.booking_id,
      staffId: item.staff_id,
      staffName: item.staff_name,
      scanMethod: item.scan_method,
      scanResult: item.scan_result,
      manualReason: item.manual_reason,
      scannedAt: item.scanned_at,
      deviceInfo: item.device_info,
      branch: item.branch
    }));
  } catch (err) {
    console.error('[Supabase fetchScanLogsFromSupabase Exception]:', err);
    return null;
  }
}

// Save Scan Log to Supabase
export async function saveScanLogToSupabase(log: ScanLog) {
  try {
    const record = {
      id: log.id || crypto.randomUUID(),
      booking_id: log.bookingId,
      staff_id: log.staffId,
      staff_name: log.staffName,
      scan_method: log.scanMethod,
      scan_result: log.scanResult,
      manual_reason: log.manualReason || '',
      device_info: log.deviceInfo || '',
      branch: log.branch || 'Gajuri Main Branch',
      scanned_at: log.scannedAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('scan_logs').upsert([record], { onConflict: 'id' }).select();
    if (error) console.error('[Supabase saveScanLogToSupabase Error]:', error);
    return { success: !error, data, error };
  } catch (err) {
    console.error('[Supabase saveScanLogToSupabase Exception]:', err);
    return { success: false, error: err };
  }
}

// Delete Movie from Supabase
export async function deleteMovieFromSupabase(id: string) {
  try {
    console.log(`[Supabase deleteMovieFromSupabase Request]: Deleting movie ${id} from public.movies`);
    const { error } = await supabase.from('movies').delete().eq('id', id);

    if (error) {
      console.error('[Supabase deleteMovieFromSupabase Error]: Failed to delete from public.movies:', error);
    } else {
      console.log(`[Supabase deleteMovieFromSupabase Success]: Deleted movie ${id}`);
    }
    return { success: !error, error };
  } catch (err) {
    console.error('[Supabase deleteMovieFromSupabase Exception]:', err);
    return { success: false, error: err };
  }
}
