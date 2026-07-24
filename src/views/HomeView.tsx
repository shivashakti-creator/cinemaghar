import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { HeroCarousel } from '../components/HeroCarousel';
import { MovieCard } from '../components/MovieCard';
import { GajuriMap } from '../components/GajuriMap';
import { Sparkles, Film, Calendar, ArrowRight, Play, Globe } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { publicMovies, setActiveTab, setTrailerUrl, startBooking } = useCinema();
  const [filterTag, setFilterTag] = useState<'ALL' | 'Nepali' | 'Bollywood' | 'Hollywood'>('ALL');
  const [upcomingFilter, setUpcomingFilter] = useState<'ALL' | 'Nepali' | 'Hollywood' | 'Bollywood'>('ALL');

  const nowShowing = publicMovies.filter((m) => m.status === 'NOW_SHOWING');
  
  // Filter upcoming movies (releasing within 1 month)
  const comingSoon = publicMovies.filter((m) => {
    if (m.status !== 'COMING_SOON') return false;
    if (upcomingFilter !== 'ALL' && m.industry !== upcomingFilter) return false;
    return true;
  });

  const filteredNowShowing = nowShowing.filter((m) => {
    if (filterTag === 'ALL') return true;
    return m.industry === filterTag;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Banner Slider */}
      <HeroCarousel />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section 1: Now Showing Movies with Industry Filters */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
                <Film className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">GAJURI CINEMAS SHOWING NOW</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
                Now Showing
              </h2>
            </div>

            {/* Industry Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'Nepali', 'Bollywood', 'Hollywood'] as const).map((tag) => (
                <button
                  key={tag}
                  id={`home-industry-tag-${tag}`}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterTag === tag
                      ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {tag === 'ALL' ? 'All Cinema' : `${tag} Movies`}
                </button>
              ))}
            </div>
          </div>

          {/* Movie Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNowShowing.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        {/* Section 3: Coming Soon Trailers (Worldwide & Nepali releasing within 1 month) */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">UPCOMING WITHIN 1 MONTH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white flex items-center gap-2">
                <span>Coming Soon</span>
                <Globe className="w-6 h-6 text-[#D4AF37]" />
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#12131C] p-1 rounded-xl border border-white/10">
                {(['ALL', 'Nepali', 'Bollywood', 'Hollywood'] as const).map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setUpcomingFilter(ind)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      upcomingFilter === ind ? 'bg-[#D4AF37] text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>

              <button
                id="view-all-movies-btn"
                onClick={() => setActiveTab('movies')}
                className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Explore All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comingSoon.map((movie) => (
              <div
                key={movie.id}
                id={`coming-soon-card-${movie.id}`}
                className="bg-[#12131C] rounded-3xl border border-white/10 overflow-hidden flex flex-col sm:flex-row group hover:border-[#D4AF37]/50 transition-all duration-300"
              >
                <div className="relative sm:w-2/5 aspect-[2/3] overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      id={`play-coming-trailer-${movie.id}`}
                      onClick={() => setTrailerUrl(movie.youtubeTrailerUrl)}
                      className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Watch Official YouTube Trailer"
                    >
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-bold">
                      <span className="text-amber-300">
                        RELEASING: {movie.releaseDate}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-white">
                        {movie.industry}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-white group-hover:text-[#D4AF37] transition-colors">
                      {movie.title}
                    </h3>
                    {movie.nepaliTitle && (
                      <p className="text-sm text-[#D4AF37] font-nepali mt-0.5">{movie.nepaliTitle}</p>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-3 mt-3 font-light leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id={`prebook-coming-btn-${movie.id}`}
                      onClick={() => startBooking(movie)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/30 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <span>PRE-BOOK TICKETS</span>
                    </button>

                    <button
                      id={`watch-coming-trailer-${movie.id}`}
                      onClick={() => setTrailerUrl(movie.youtubeTrailerUrl)}
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="hidden sm:inline">TRAILER</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Interactive Dark Cinematic Google Maps Location Component */}
        <GajuriMap />

      </div>

    </div>
  );
};
