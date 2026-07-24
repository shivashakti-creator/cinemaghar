import { createClient } from '@supabase/supabase-js';
import { Movie, Showtime } from '../types';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseBookingRecord {
  id?: string;
  created_at?: string;
  booking_code: string;
  movie_id: string;
  movie_title: string;
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
}

export async function saveBookingToSupabase(booking: SupabaseBookingRecord) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          booking_code: booking.booking_code,
          movie_id: booking.movie_id,
          movie_title: booking.movie_title,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          customer_email: booking.customer_email || '',
          show_date: booking.show_date || '',
          show_time: booking.show_time,
          hall_name: booking.hall_name,
          format: booking.format || '2D',
          selected_seats: booking.selected_seats,
          food_items: booking.food_items || [],
          ticket_total: booking.ticket_total || 0,
          snack_total: booking.snack_total || 0,
          total_price: booking.total_price,
          payment_method: booking.payment_method,
          payment_status: booking.payment_status || 'CONFIRMED'
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase insert warning:', error);
      return { success: false, error };
    }

    console.log('Successfully saved booking to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to save booking to Supabase:', err);
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
      console.warn('[Supabase fetchMoviesFromSupabase Notice]: Supabase database unreachable or returning error:', error.message || error);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      nepaliTitle: item.nepali_title,
      poster: item.poster,
      backdrop: item.backdrop,
      verticalPoster: item.vertical_poster,
      trailerThumbnail: item.trailer_thumbnail,
      synopsis: item.synopsis,
      duration: item.duration,
      releaseDate: item.release_date,
      endDate: item.end_date,
      genre: typeof item.genre === 'string' ? JSON.parse(item.genre) : item.genre || [],
      rating: item.rating || 9.0,
      ageRating: item.age_rating || 'U/A',
      censorRating: item.censor_rating || 'U/A (Nepal Censor Board)',
      languages: typeof item.languages === 'string' ? JSON.parse(item.languages) : item.languages || ['Nepali'],
      country: item.country || 'Nepal',
      industry: item.industry || 'Nepali',
      status: item.status || 'NOW_SHOWING',
      youtubeTrailerUrl: item.youtube_trailer_url,
      teaserUrl: item.teaser_url,
      director: item.director,
      producer: item.producer,
      mainCastText: item.main_cast_text,
      musicDirector: item.music_director,
      cinematographer: item.cinematographer,
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
      release_date: movie.releaseDate,
      end_date: movie.endDate || '',
      genre: movie.genre,
      rating: movie.rating || 9.0,
      age_rating: movie.ageRating || 'U/A',
      censor_rating: movie.censorRating || 'U/A (Nepal Censor Board)',
      languages: movie.languages,
      country: movie.country || 'Nepal',
      industry: movie.industry,
      status: movie.status,
      youtube_trailer_url: movie.youtubeTrailerUrl,
      teaser_url: movie.teaserUrl || '',
      director: movie.director,
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
