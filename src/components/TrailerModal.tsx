import React, { useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import { X, Film, Star, Clock, Calendar, Ticket, ShieldCheck, User, Users, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TrailerModal: React.FC = () => {
  const { trailerUrl, setTrailerUrl, movies, startBooking } = useCinema();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTrailerUrl(null);
      }
    };
    if (trailerUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trailerUrl, setTrailerUrl]);

  if (!trailerUrl) return null;

  // Find movie by trailerUrl or fallback
  const movie = movies.find(
    (m) => m.youtubeTrailerUrl === trailerUrl || (trailerUrl && trailerUrl.includes(m.id))
  );

  // Extract YouTube Video ID
  let videoId = '';
  if (trailerUrl.includes('watch?v=')) {
    videoId = trailerUrl.split('watch?v=')[1]?.split('&')[0];
  } else if (trailerUrl.includes('embed/')) {
    videoId = trailerUrl.split('embed/')[1]?.split('?')[0];
  } else if (trailerUrl.includes('youtu.be/')) {
    videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
  } else {
    videoId = trailerUrl;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;

  const handleBookNow = () => {
    if (movie) {
      startBooking(movie);
      setTrailerUrl(null);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="trailer-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setTrailerUrl(null);
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/90 backdrop-blur-xl overflow-y-auto"
      >
        <motion.div
          id="trailer-modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-6xl bg-[#12131C] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.25)] flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#090A0E] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Film className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-serif">
                GAJURI CINEMAS • CINEMATIC TRAILER
              </span>
            </div>

            <button
              id="close-trailer-modal-btn"
              onClick={() => setTrailerUrl(null)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Close Trailer (ESC)"
            >
              <span>CLOSE</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Modal Body: Video Player + Movie Metadata Side-by-Side */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
            
            {/* Left / Top: Widescreen Video Player Container */}
            <div className="w-full lg:w-[65%] bg-black relative flex items-center justify-center min-h-[240px] sm:min-h-[380px] lg:min-h-[480px]">
              <iframe
                title={movie ? `${movie.title} Trailer` : 'Gajuri Cinemas Official Trailer'}
                src={embedUrl}
                className="w-full h-full aspect-video border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Right / Bottom: Movie Metadata Panel Beside Player */}
            <div className="w-full lg:w-[35%] p-5 sm:p-6 bg-gradient-to-b from-[#12131C] via-[#1A1B28] to-[#090A0E] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between space-y-5 overflow-y-auto">
              
              {movie ? (
                <div className="space-y-4">
                  
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/10 text-amber-300 border border-white/10">
                      {movie.industry}
                    </span>
                    {movie.censorRating && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                        {movie.censorRating}
                      </span>
                    )}
                  </div>

                  {/* Title & Nepali Title */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-white leading-tight">
                      {movie.title}
                    </h2>
                    {movie.nepaliTitle && (
                      <p className="text-base text-[#D4AF37] font-nepali mt-1">
                        {movie.nepaliTitle}
                      </p>
                    )}
                  </div>

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-2xl border border-white/5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Rating</p>
                        <p className="font-bold text-white">{movie.rating} / 10</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Runtime</p>
                        <p className="font-bold text-white">{movie.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Release</p>
                        <p className="font-bold text-white">{movie.releaseDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Age Rating</p>
                        <p className="font-bold text-white">{movie.ageRating}</p>
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Genres</p>
                    <div className="flex flex-wrap gap-1.5">
                      {movie.genre.map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-slate-300">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Director & Cast */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="text-slate-400">Director:</span>
                      <span className="font-semibold text-white">{movie.director}</span>
                    </p>
                    {movie.cast && movie.cast.length > 0 && (
                      <p className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        <span className="text-slate-400">Cast:</span>
                        <span className="font-semibold text-white line-clamp-1">
                          {movie.cast.map((c) => c.name).join(', ')}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Synopsis Excerpt */}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Overview</p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-light">
                      {movie.synopsis}
                    </p>
                  </div>

                </div>
              ) : (
                /* Fallback if movie object is not directly mapped */
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white font-serif">Gajuri Cinemas Official Trailer</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Experience ultra-high resolution 4K Laser Projection and immersive Dolby Atmos surround sound in Gajuri, Dhading.
                  </p>
                </div>
              )}

              {/* Action Buttons at Bottom of Metadata Panel */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {movie && (
                  <button
                    id="trailer-modal-book-btn"
                    onClick={handleBookNow}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#997A15] hover:from-amber-300 hover:to-amber-500 text-black font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 fill-black" />
                    <span>BOOK TICKETS FOR THIS MOVIE</span>
                  </button>
                )}

                <button
                  id="trailer-modal-dismiss-btn"
                  onClick={() => setTrailerUrl(null)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
                >
                  Return to Browse
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
