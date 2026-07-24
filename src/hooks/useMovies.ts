import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MovieRecord, MovieStatus } from '../types/admin';
import { INITIAL_MOVIES } from '../data/mockData';

export function useMovies() {
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all movies from Supabase
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Supabase Fetch Movies]: Querying public.movies table...');
      const { data, error: fetchErr } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[Supabase Fetch Movies Response]:', { count: data?.length, data, error: fetchErr });

      if (fetchErr || !data || data.length === 0) {
        console.warn('[Supabase Fetch Movies Notice]: Table unreachable or empty, falling back to initial catalog:', fetchErr?.message || 'Empty data');
        const fallbackList: MovieRecord[] = INITIAL_MOVIES.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: m.subtitle || '',
          nepaliTitle: m.nepaliTitle || '',
          description: m.synopsis,
          synopsis: m.synopsis,
          duration_minutes: parseInt(m.duration) || 135,
          duration: m.duration,
          language: m.languages[0] || 'Nepali',
          languages: m.languages,
          country: m.country || 'Nepal',
          age_rating: m.ageRating || 'U/A',
          release_date: m.releaseDate,
          end_date: m.endDate || '',
          trailer_url: m.youtubeTrailerUrl,
          youtubeTrailerUrl: m.youtubeTrailerUrl,
          status: m.status as MovieStatus,
          poster_url: m.poster,
          poster: m.poster,
          banner_url: m.backdrop,
          backdrop: m.backdrop,
          vertical_poster: m.verticalPoster || '',
          genre: m.genre,
          rating: m.rating || 9.0,
          director: m.director,
          producer: m.producer,
          cast_members: m.cast || [],
          hall_type: m.hallType || 'Hall 1 - IMAX 3D Laser',
          featured: m.featured ?? true,
          created_at: m.createdAt || new Date().toISOString()
        }));
        setMovies(fallbackList);
      } else {
        const mapped: MovieRecord[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || '',
          nepaliTitle: item.nepali_title || '',
          description: item.synopsis || item.description || '',
          synopsis: item.synopsis || item.description || '',
          duration_minutes: item.duration_minutes || parseInt(item.duration) || 120,
          duration: item.duration || `${item.duration_minutes || 120}m`,
          language: Array.isArray(item.languages) ? item.languages[0] : item.language || 'Nepali',
          languages: Array.isArray(item.languages) ? item.languages : (typeof item.languages === 'string' ? JSON.parse(item.languages) : ['Nepali']),
          country: item.country || 'Nepal',
          age_rating: item.age_rating || item.censor_rating || 'U/A',
          release_date: item.release_date || item.releaseDate || '',
          end_date: item.end_date || '',
          trailer_url: item.youtube_trailer_url || item.trailer_url || '',
          youtubeTrailerUrl: item.youtube_trailer_url || item.trailer_url || '',
          status: item.status as MovieStatus,
          poster_url: item.poster || item.poster_url || '',
          poster: item.poster || item.poster_url || '',
          banner_url: item.backdrop || item.banner_url || '',
          backdrop: item.backdrop || item.banner_url || '',
          vertical_poster: item.vertical_poster || '',
          genre: Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? JSON.parse(item.genre) : []),
          rating: item.rating || 9.0,
          director: item.director || '',
          producer: item.producer || '',
          cast_members: Array.isArray(item.cast_members) ? item.cast_members : [],
          hall_type: item.hall_type || 'Hall 1 - IMAX 3D Laser',
          featured: item.featured ?? false,
          created_at: item.created_at || new Date().toISOString()
        }));
        setMovies(mapped);
      }
    } catch (err: any) {
      console.warn('[Supabase Fetch Movies Notice]: Exception fetching movies, using initial catalog:', err.message);
      const fallbackList: MovieRecord[] = INITIAL_MOVIES.map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: m.subtitle || '',
        nepaliTitle: m.nepaliTitle || '',
        description: m.synopsis,
        synopsis: m.synopsis,
        duration_minutes: parseInt(m.duration) || 135,
        duration: m.duration,
        language: m.languages[0] || 'Nepali',
        languages: m.languages,
        country: m.country || 'Nepal',
        age_rating: m.ageRating || 'U/A',
        release_date: m.releaseDate,
        end_date: m.endDate || '',
        trailer_url: m.youtubeTrailerUrl,
        youtubeTrailerUrl: m.youtubeTrailerUrl,
        status: m.status as MovieStatus,
        poster_url: m.poster,
        poster: m.poster,
        banner_url: m.backdrop,
        backdrop: m.backdrop,
        vertical_poster: m.verticalPoster || '',
        genre: m.genre,
        rating: m.rating || 9.0,
        director: m.director,
        producer: m.producer,
        cast_members: m.cast || [],
        hall_type: m.hallType || 'Hall 1 - IMAX 3D Laser',
        featured: m.featured ?? true,
        created_at: m.createdAt || new Date().toISOString()
      }));
      setMovies(fallbackList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Upload Poster / Banner File to Supabase Storage Buckets
  const uploadImageToBucket = async (file: File, bucketName: 'movie-posters' | 'movie-banners' | 'movies'): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${bucketName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          
          console.log(`[Supabase Storage Request]: Uploading image to bucket '${bucketName}' as '${fileName}'`);
          let uploadResult = await supabase.storage.from(bucketName).upload(fileName, file);
          let activeBucket = bucketName;

          if (uploadResult.error) {
            console.warn(`[Supabase Storage Warning]: Bucket '${bucketName}' error, attempting fallback bucket 'movies'`, uploadResult.error);
            uploadResult = await supabase.storage.from('movies').upload(fileName, file);
            activeBucket = 'movies';
          }

          if (!uploadResult.error && uploadResult.data) {
            const { data: publicData } = supabase.storage.from(activeBucket).getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              console.log('[Supabase Storage Success]: Public URL:', publicData.publicUrl);
              resolve(publicData.publicUrl);
              return;
            }
          } else if (uploadResult.error) {
            console.error('[Supabase Storage Error]: Upload failed:', uploadResult.error);
          }
        } catch (err) {
          console.warn('[Supabase Storage Exception]: Using Data URL fallback:', err);
        }
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  // Create Movie directly into public.movies
  const createMovie = async (movieData: Partial<MovieRecord>): Promise<{ success: boolean; movie?: MovieRecord; error?: string }> => {
    const id = movieData.id || `movie-${Date.now()}`;
    const dbRecord = {
      id,
      title: movieData.title || 'Untitled Movie',
      subtitle: movieData.subtitle || '',
      nepali_title: movieData.nepaliTitle || '',
      poster: movieData.poster_url || movieData.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
      backdrop: movieData.banner_url || movieData.backdrop || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600',
      vertical_poster: movieData.vertical_poster || '',
      trailer_thumbnail: '',
      synopsis: movieData.description || movieData.synopsis || 'An exciting cinematic release at Gajuri Cinemas.',
      duration: movieData.duration || `${movieData.duration_minutes || 135} mins`,
      release_date: movieData.release_date || new Date().toISOString().slice(0, 10),
      end_date: movieData.end_date || '',
      genre: movieData.genre || ['Drama'],
      rating: movieData.rating || 9.0,
      age_rating: movieData.age_rating || 'U/A',
      censor_rating: 'U/A (Nepal Censor Board)',
      languages: movieData.languages || [movieData.language || 'Nepali'],
      country: movieData.country || 'Nepal',
      industry: 'Nepali',
      status: movieData.status || 'NOW_SHOWING',
      youtube_trailer_url: movieData.trailer_url || movieData.youtubeTrailerUrl || '',
      teaser_url: '',
      director: movieData.director || 'Gajuri Cinema House',
      producer: movieData.producer || 'Gajuri Media Group',
      main_cast_text: '',
      music_director: '',
      cinematographer: '',
      cast_members: movieData.cast_members || [],
      hall_type: movieData.hall_type || 'Hall 1 - IMAX 3D Laser',
      featured: movieData.featured ?? true
    };

    try {
      console.log('[Supabase Insert Movie Request]: Inserting record into public.movies:', dbRecord);
      const { data: insertedData, error: dbErr } = await supabase
        .from('movies')
        .insert([dbRecord])
        .select();

      console.log('[Supabase Insert Movie Response]:', insertedData);

      if (dbErr) {
        console.error('[Supabase Insert Movie Error]: Failed to save to public.movies:', dbErr);
        return { success: false, error: dbErr.message || 'Failed to insert movie into database' };
      }

      console.log('[Supabase Insert Movie Success]: Movie saved directly to public.movies table!');
      // Immediately refresh movie list from Supabase
      await fetchMovies();
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Insert Movie Exception]:', err);
      return { success: false, error: err.message || 'Unexpected error while inserting movie' };
    }
  };

  // Edit Movie directly in public.movies
  const updateMovie = async (id: string, updates: Partial<MovieRecord>): Promise<{ success: boolean; error?: string }> => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.nepaliTitle !== undefined) dbUpdates.nepali_title = updates.nepaliTitle;
    if (updates.poster_url || updates.poster) dbUpdates.poster = updates.poster_url || updates.poster;
    if (updates.banner_url || updates.backdrop) dbUpdates.backdrop = updates.banner_url || updates.backdrop;
    if (updates.synopsis || updates.description) dbUpdates.synopsis = updates.synopsis || updates.description;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.release_date) dbUpdates.release_date = updates.release_date;
    if (updates.end_date !== undefined) dbUpdates.end_date = updates.end_date;
    if (updates.genre) dbUpdates.genre = updates.genre;
    if (updates.age_rating) dbUpdates.age_rating = updates.age_rating;
    if (updates.languages) dbUpdates.languages = updates.languages;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.trailer_url || updates.youtubeTrailerUrl) dbUpdates.youtube_trailer_url = updates.trailer_url || updates.youtubeTrailerUrl;
    if (updates.director !== undefined) dbUpdates.director = updates.director;
    if (updates.producer !== undefined) dbUpdates.producer = updates.producer;
    if (updates.cast_members) dbUpdates.cast_members = updates.cast_members;
    if (updates.hall_type) dbUpdates.hall_type = updates.hall_type;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

    try {
      console.log(`[Supabase Update Movie Request]: Updating movie ${id} in public.movies:`, dbUpdates);
      const { data: updatedData, error: dbErr } = await supabase
        .from('movies')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      console.log('[Supabase Update Movie Response]:', updatedData);

      if (dbErr) {
        console.error('[Supabase Update Movie Error]: Failed to update public.movies:', dbErr);
        return { success: false, error: dbErr.message || 'Failed to update movie' };
      }

      console.log(`[Supabase Update Movie Success]: Movie ${id} updated in public.movies`);
      // Immediately refresh movie list from Supabase
      await fetchMovies();
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Update Movie Exception]:', err);
      return { success: false, error: err.message || 'Unexpected error updating movie' };
    }
  };

  // Delete Movie directly from public.movies
  const deleteMovie = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`[Supabase Delete Movie Request]: Deleting movie ${id} from public.movies`);
      const { error: dbErr } = await supabase.from('movies').delete().eq('id', id);

      if (dbErr) {
        console.error('[Supabase Delete Movie Error]: Failed to delete from public.movies:', dbErr);
        return { success: false, error: dbErr.message || 'Failed to delete movie' };
      }

      console.log(`[Supabase Delete Movie Success]: Movie ${id} deleted from public.movies`);
      // Immediately refresh movie list from Supabase
      await fetchMovies();
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Delete Movie Exception]:', err);
      return { success: false, error: err.message || 'Unexpected error deleting movie' };
    }
  };

  // Bulk Delete directly from public.movies
  const bulkDeleteMovies = async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`[Supabase Bulk Delete Request]: Deleting movies from public.movies:`, ids);
      const { error: dbErr } = await supabase.from('movies').delete().in('id', ids);

      if (dbErr) {
        console.error('[Supabase Bulk Delete Error]: Failed to bulk delete from public.movies:', dbErr);
        return { success: false, error: dbErr.message || 'Failed to bulk delete movies' };
      }

      console.log(`[Supabase Bulk Delete Success]: Deleted ${ids.length} movies from public.movies`);
      // Immediately refresh movie list from Supabase
      await fetchMovies();
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Bulk Delete Exception]:', err);
      return { success: false, error: err.message || 'Unexpected error bulk deleting movies' };
    }
  };

  // Archive Movie
  const archiveMovie = async (id: string) => {
    return updateMovie(id, { status: 'ARCHIVED' });
  };

  // Toggle Active/Inactive Status
  const toggleMovieStatus = async (id: string) => {
    const movie = movies.find((m) => m.id === id);
    if (!movie) return;
    const newStatus: MovieStatus = movie.status === 'NOW_SHOWING' ? 'HIDDEN' : 'NOW_SHOWING';
    return updateMovie(id, { status: newStatus });
  };

  return {
    movies,
    loading,
    error,
    fetchMovies,
    uploadImageToBucket,
    createMovie,
    updateMovie,
    deleteMovie,
    bulkDeleteMovies,
    archiveMovie,
    toggleMovieStatus
  };
}
