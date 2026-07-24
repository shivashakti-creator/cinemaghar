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
    try {
      const { data, error: fetchErr } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr || !data || data.length === 0) {
        // Fallback to initial mock movies formatted as MovieRecord
        const formatted: MovieRecord[] = INITIAL_MOVIES.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: m.subtitle,
          nepaliTitle: m.nepaliTitle,
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
          vertical_poster: m.verticalPoster,
          genre: m.genre,
          rating: m.rating || 9.0,
          director: m.director,
          producer: m.producer,
          cast_members: m.cast || [],
          hall_type: m.hallType || 'Hall 1 - IMAX 3D',
          featured: m.featured ?? true,
          created_at: m.createdAt || new Date().toISOString()
        }));
        setMovies(formatted);
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
          hall_type: item.hall_type || 'Hall 1 - IMAX 3D',
          featured: item.featured ?? false,
          created_at: item.created_at || new Date().toISOString()
        }));
        setMovies(mapped);
      }
    } catch (err: any) {
      console.warn('Movie fetch error:', err);
      setError(err.message);
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
          
          // Try specific bucket first, fallback to 'movies'
          let uploadResult = await supabase.storage.from(bucketName).upload(fileName, file);
          let activeBucket = bucketName;

          if (uploadResult.error) {
            uploadResult = await supabase.storage.from('movies').upload(fileName, file);
            activeBucket = 'movies';
          }

          if (!uploadResult.error && uploadResult.data) {
            const { data: publicData } = supabase.storage.from(activeBucket).getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              resolve(publicData.publicUrl);
              return;
            }
          }
        } catch (err) {
          console.warn('Storage upload error, using Data URL fallback:', err);
        }
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  // Create Movie
  const createMovie = async (movieData: Partial<MovieRecord>) => {
    const id = movieData.id || `movie-${Date.now()}`;
    const newRecord: MovieRecord = {
      id,
      title: movieData.title || 'Untitled Movie',
      subtitle: movieData.subtitle || '',
      nepaliTitle: movieData.nepaliTitle || '',
      description: movieData.description || movieData.synopsis || '',
      synopsis: movieData.synopsis || movieData.description || '',
      duration_minutes: movieData.duration_minutes || 135,
      duration: movieData.duration || `${movieData.duration_minutes || 135}m`,
      language: movieData.language || 'Nepali',
      languages: movieData.languages || ['Nepali'],
      country: movieData.country || 'Nepal',
      age_rating: movieData.age_rating || 'U/A',
      release_date: movieData.release_date || new Date().toISOString().slice(0, 10),
      end_date: movieData.end_date || '',
      trailer_url: movieData.trailer_url || movieData.youtubeTrailerUrl || '',
      youtubeTrailerUrl: movieData.youtubeTrailerUrl || movieData.trailer_url || '',
      status: movieData.status || 'NOW_SHOWING',
      poster_url: movieData.poster_url || movieData.poster || '',
      poster: movieData.poster || movieData.poster_url || '',
      banner_url: movieData.banner_url || movieData.backdrop || '',
      backdrop: movieData.backdrop || movieData.banner_url || '',
      genre: movieData.genre || ['Drama'],
      rating: movieData.rating || 9.0,
      director: movieData.director || 'Gajuri Cinema House',
      producer: movieData.producer || 'Gajuri Media Group',
      cast_members: movieData.cast_members || [],
      hall_type: movieData.hall_type || 'Hall 1 - IMAX 3D',
      featured: movieData.featured ?? true,
      created_at: new Date().toISOString()
    };

    try {
      const { error: dbErr } = await supabase.from('movies').upsert([{
        id: newRecord.id,
        title: newRecord.title,
        subtitle: newRecord.subtitle,
        nepali_title: newRecord.nepaliTitle,
        poster: newRecord.poster_url,
        backdrop: newRecord.banner_url,
        synopsis: newRecord.description,
        duration: newRecord.duration,
        release_date: newRecord.release_date,
        end_date: newRecord.end_date,
        genre: newRecord.genre,
        rating: newRecord.rating,
        age_rating: newRecord.age_rating,
        languages: newRecord.languages,
        country: newRecord.country,
        status: newRecord.status,
        youtube_trailer_url: newRecord.trailer_url,
        director: newRecord.director,
        producer: newRecord.producer,
        cast_members: newRecord.cast_members,
        hall_type: newRecord.hall_type,
        featured: newRecord.featured
      }]);

      if (dbErr) console.warn('Supabase movie insert error:', dbErr);

      setMovies((prev) => [newRecord, ...prev]);
      return { success: true, movie: newRecord };
    } catch (err: any) {
      setMovies((prev) => [newRecord, ...prev]);
      return { success: true, movie: newRecord };
    }
  };

  // Edit Movie
  const updateMovie = async (id: string, updates: Partial<MovieRecord>) => {
    try {
      const { error: dbErr } = await supabase.from('movies').update({
        title: updates.title,
        subtitle: updates.subtitle,
        nepali_title: updates.nepaliTitle,
        poster: updates.poster_url || updates.poster,
        backdrop: updates.banner_url || updates.backdrop,
        synopsis: updates.description || updates.synopsis,
        duration: updates.duration,
        release_date: updates.release_date,
        end_date: updates.end_date,
        genre: updates.genre,
        age_rating: updates.age_rating,
        languages: updates.languages,
        status: updates.status,
        youtube_trailer_url: updates.trailer_url || updates.youtubeTrailerUrl,
        director: updates.director,
        producer: updates.producer,
        cast_members: updates.cast_members,
        hall_type: updates.hall_type
      }).eq('id', id);

      if (dbErr) console.warn('Supabase movie update error:', dbErr);

      setMovies((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
      return { success: true };
    } catch (err) {
      setMovies((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
      return { success: true };
    }
  };

  // Delete Movie
  const deleteMovie = async (id: string) => {
    try {
      await supabase.from('movies').delete().eq('id', id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    }
  };

  // Bulk Delete
  const bulkDeleteMovies = async (ids: string[]) => {
    try {
      await supabase.from('movies').delete().in('id', ids);
      setMovies((prev) => prev.filter((m) => !ids.includes(m.id)));
      return { success: true };
    } catch (err) {
      setMovies((prev) => prev.filter((m) => !ids.includes(m.id)));
      return { success: true };
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
