import React, { useState, useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Play, Ticket, Star, Clock, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HeroCarousel: React.FC = () => {
  const { movies, showtimes, startBooking, setTrailerUrl } = useCinema();
  const featuredMovies = movies.filter((m) => m.featured || m.status === 'NOW_SHOWING');
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const activeMovie = featuredMovies[currentIndex];
  const activeShowtimes = showtimes.filter((s) => s.movieId === activeMovie.id && s.date === '2026-07-23');

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] bg-[#090A0E] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Backdrop Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${activeMovie.backdrop})` }}
          >
            {/* Dark Luxury Vignette & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090A0E] via-[#090A0E]/80 to-transparent w-full md:w-3/4" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#090A0E]/40 to-[#090A0E]" />
          </div>

          {/* Banner Content Container */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
            <div className="max-w-2xl space-y-4">

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-white tracking-wide leading-tight drop-shadow-lg">
                  {activeMovie.title}
                </h1>
              </div>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed font-light max-w-xl">
                {activeMovie.synopsis}
              </p>

              {/* Languages & Genres */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-200 font-medium">Languages:</span>
                <span className="text-amber-300">{activeMovie.languages.join(', ')}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-200 font-medium">Genres:</span>
                <span className="text-slate-300">{activeMovie.genre.join(', ')}</span>
              </div>

              {/* Quick Showtimes Bar */}
              {activeShowtimes.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Today's Showtimes at Gajuri:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeShowtimes.map((st) => (
                      <button
                        key={st.id}
                        id={`hero-showtime-${st.id}`}
                        onClick={() => startBooking(activeMovie, st)}
                        className="px-3.5 py-2 rounded-lg bg-[#1A1B28]/80 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/30 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <span>{st.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  id="hero-buy-ticket-btn"
                  onClick={() => startBooking(activeMovie)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#997A15] hover:from-amber-300 hover:to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.7)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
                >
                  <Ticket className="w-5 h-5 fill-black" />
                  <span>BOOK TICKETS NOW</span>
                </button>

                <button
                  id="hero-watch-trailer-btn"
                  onClick={() => setTrailerUrl(activeMovie.youtubeTrailerUrl)}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>WATCH TRAILER</span>
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls */}
      {featuredMovies.length > 1 && (
        <>
          <button
            id="hero-prev-slide"
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1))
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white hover:text-[#D4AF37] backdrop-blur-md transition-all hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            id="hero-next-slide"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white hover:text-[#D4AF37] backdrop-blur-md transition-all hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-8 z-20 flex items-center gap-2">
            {featuredMovies.map((m, idx) => (
              <button
                key={m.id}
                id={`hero-dot-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx
                    ? 'w-8 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
