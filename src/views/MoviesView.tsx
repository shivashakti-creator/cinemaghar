import React, { useState, useMemo } from 'react';
import { useCinema } from '../context/CinemaContext';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import {
  Search,
  Film,
  Star,
  Clock,
  Calendar,
  Play,
  Ticket,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  User,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MoviesView: React.FC = () => {
  const { publicMovies, searchQuery, setSearchQuery, startBooking, setTrailerUrl } = useCinema();

  // Filter & Search States
  const [industryFilter, setIndustryFilter] = useState<'ALL' | 'Nepali' | 'Bollywood' | 'Hollywood'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOW_SHOWING' | 'COMING_SOON'>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedHallType, setSelectedHallType] = useState<string>('ALL');
  const [comingSoonRange, setComingSoonRange] = useState<'ALL' | 'THIS_MONTH' | 'NEXT_MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'RELEASE_DATE_DESC' | 'RELEASE_DATE_ASC' | 'RATING_DESC' | 'TITLE_ASC'>('RELEASE_DATE_DESC');
  
  // UI toggles
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedMovieDetail, setSelectedMovieDetail] = useState<Movie | null>(null);

  // Extract all unique genres dynamically from publicMovies with count
  const genresWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    publicMovies.forEach((m) => {
      m.genre.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [publicMovies]);

  // Extract all unique languages dynamically
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    publicMovies.forEach((m) => {
      m.languages.forEach((l) => {
        if (l.toLowerCase().includes('nepali')) langs.add('Nepali');
        else if (l.toLowerCase().includes('hindi')) langs.add('Hindi');
        else if (l.toLowerCase().includes('english')) langs.add('English');
        else langs.add(l);
      });
    });
    return Array.from(langs);
  }, [publicMovies]);

  // Filter & Search logic
  const filteredMovies = useMemo(() => {
    return publicMovies.filter((m) => {
      // Industry Filter
      if (industryFilter !== 'ALL' && m.industry !== industryFilter) return false;

      // Status Filter
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;

      // Genre Filter
      if (selectedGenre !== 'ALL' && !m.genre.includes(selectedGenre)) return false;

      // Language Filter
      if (selectedLanguage !== 'ALL') {
        const matchesLang = m.languages.some((l) =>
          l.toLowerCase().includes(selectedLanguage.toLowerCase())
        );
        if (!matchesLang) return false;
      }

      // Hall / Format Filter
      if (selectedHallType !== 'ALL') {
        if (selectedHallType === 'IMAX' && !m.hallType.includes('IMAX')) return false;
        if (selectedHallType === 'Dolby Atmos' && !m.hallType.includes('Dolby')) return false;
      }

      // Coming Soon Release Date Range Filter
      if (comingSoonRange !== 'ALL' && m.status === 'COMING_SOON') {
        const releaseYearMonth = m.releaseDate.slice(0, 7); // e.g., '2026-07' or '2026-08'
        if (comingSoonRange === 'THIS_MONTH' && releaseYearMonth !== '2026-07') return false;
        if (comingSoonRange === 'NEXT_MONTH' && releaseYearMonth !== '2026-08') return false;
      }

      // Search Query (Matches title, nepali title, cast actor names, directors, genres, languages, synopsis)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchNepali = m.nepaliTitle?.toLowerCase().includes(q);
        const matchGenre = m.genre.some((g) => g.toLowerCase().includes(q));
        const matchDirector = m.director?.toLowerCase().includes(q);
        const matchCast = m.cast?.some(
          (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
        );
        const matchSynopsis = m.synopsis?.toLowerCase().includes(q);
        const matchLanguage = m.languages?.some((l) => l.toLowerCase().includes(q));

        if (
          !matchTitle &&
          !matchNepali &&
          !matchGenre &&
          !matchDirector &&
          !matchCast &&
          !matchSynopsis &&
          !matchLanguage
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    publicMovies,
    industryFilter,
    statusFilter,
    selectedGenre,
    selectedLanguage,
    selectedHallType,
    comingSoonRange,
    searchQuery
  ]);

  // Sorting Logic
  const sortedMovies = useMemo(() => {
    return [...filteredMovies].sort((a, b) => {
      if (sortBy === 'RATING_DESC') {
        return b.rating - a.rating;
      }
      if (sortBy === 'RELEASE_DATE_DESC') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (sortBy === 'RELEASE_DATE_ASC') {
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      }
      if (sortBy === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filteredMovies, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (industryFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (selectedGenre !== 'ALL') count++;
    if (selectedLanguage !== 'ALL') count++;
    if (selectedHallType !== 'ALL') count++;
    if (comingSoonRange !== 'ALL') count++;
    if (sortBy !== 'RELEASE_DATE_DESC') count++;
    return count;
  }, [
    searchQuery,
    industryFilter,
    statusFilter,
    selectedGenre,
    selectedLanguage,
    selectedHallType,
    comingSoonRange,
    sortBy
  ]);

  // Reset all filters function
  const handleResetFilters = () => {
    setSearchQuery('');
    setIndustryFilter('ALL');
    setStatusFilter('ALL');
    setSelectedGenre('ALL');
    setSelectedLanguage('ALL');
    setSelectedHallType('ALL');
    setComingSoonRange('ALL');
    setSortBy('RELEASE_DATE_DESC');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
            <Film className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-widest">GAJURI CINEMAS CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
            Explore All Movies
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search by movie title, actor, director, or filter by genre & release date
          </p>
        </div>

        {/* Dynamic Movies Count Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold text-slate-300">
              Showing <strong className="text-white text-sm">{sortedMovies.length}</strong> of {publicMovies.length} movies
            </span>
          </div>
        </div>
      </div>

      {/* Main Search & Filter Control Hub */}
      <div className="bg-[#12131C] rounded-3xl border border-white/10 p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Row: Search Input & Primary Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="movies-search-input"
              type="text"
              placeholder="Search by title, actor (e.g. Vijay Baral, Prabhas), director, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1B28] border border-white/10 focus:border-[#D4AF37] rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                title="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs (Now Showing / Coming Soon) */}
          <div className="flex items-center bg-[#1A1B28] p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              id="status-all-btn"
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Movies
            </button>
            <button
              id="status-now-showing-btn"
              onClick={() => setStatusFilter('NOW_SHOWING')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                statusFilter === 'NOW_SHOWING'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Now Showing</span>
            </button>
            <button
              id="status-coming-soon-btn"
              onClick={() => setStatusFilter('COMING_SOON')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                statusFilter === 'COMING_SOON'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-2 bg-[#1A1B28] border border-white/10 rounded-2xl px-3.5 py-2.5">
              <ArrowUpDown className="w-4 h-4 text-[#D4AF37]" />
              <select
                id="movies-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                <option value="RELEASE_DATE_DESC" className="bg-[#12131C] text-white">Release Date: Newest First</option>
                <option value="RELEASE_DATE_ASC" className="bg-[#12131C] text-white">Release Date: Earliest First</option>
                <option value="RATING_DESC" className="bg-[#12131C] text-white">IMDb Rating: Highest First</option>
                <option value="TITLE_ASC" className="bg-[#12131C] text-white">Title: A to Z</option>
              </select>
            </div>
          </div>

        </div>

        {/* Industry Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Industry:</span>
          </span>
          {(['ALL', 'Nepali', 'Bollywood', 'Hollywood'] as const).map((ind) => (
            <button
              key={ind}
              id={`industry-filter-${ind}`}
              onClick={() => setIndustryFilter(ind)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                industryFilter === ind
                  ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-[#1A1B28] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {ind === 'ALL' ? 'All Film Industries' : `${ind} Cinema`}
            </button>
          ))}

          {/* Toggle More Filters Button */}
          <button
            id="toggle-advanced-filters-btn"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`ml-auto px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              showAdvancedFilters || selectedLanguage !== 'ALL' || selectedHallType !== 'ALL' || comingSoonRange !== 'ALL'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]'
                : 'bg-[#1A1B28] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Genre Pills Slider / Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Filter by Genre:</span>
            {selectedGenre !== 'ALL' && (
              <button
                id="reset-genre-btn"
                onClick={() => setSelectedGenre('ALL')}
                className="text-[#D4AF37] hover:underline normal-case text-[11px] font-semibold"
              >
                Clear Genre Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              id="genre-btn-ALL"
              onClick={() => setSelectedGenre('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                selectedGenre === 'ALL'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                  : 'bg-[#1A1B28] text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>All Genres</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 font-extrabold">
                {publicMovies.length}
              </span>
            </button>

            {genresWithCount.map(([genre, count]) => (
              <button
                key={genre}
                id={`genre-btn-${genre.replace(/\s+/g, '-')}`}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  selectedGenre === genre
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
                    : 'bg-[#1A1B28] text-slate-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white'
                }`}
              >
                <span>{genre}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  selectedGenre === genre ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Advanced Filters (Languages, Formats, Release Timeframes) */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 border-t border-white/10 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Language Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Movie Language
                  </label>
                  <select
                    id="filter-language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Languages</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Format / Hall Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Cinema Format
                  </label>
                  <select
                    id="filter-format-select"
                    value={selectedHallType}
                    onChange={(e) => setSelectedHallType(e.target.value)}
                    className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Screens & Formats</option>
                    <option value="IMAX">IMAX 3D Laser Experience</option>
                    <option value="Dolby Atmos">Gajuri Dolby Atmos Screen</option>
                  </select>
                </div>

                {/* Coming Soon Release Window Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Coming Soon Release Window
                  </label>
                  <select
                    id="filter-coming-soon-range"
                    value={comingSoonRange}
                    onChange={(e) => setComingSoonRange(e.target.value as any)}
                    className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Release Dates</option>
                    <option value="THIS_MONTH">Releasing This Month (July 2026)</option>
                    <option value="NEXT_MONTH">Releasing Next Month (August 2026)</option>
                  </select>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Badges & Reset Bar */}
        {activeFilterCount > 0 && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Active Filters ({activeFilterCount}):
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {industryFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-amber-300 border border-white/20">
                  <span>Industry: {industryFilter}</span>
                  <button onClick={() => setIndustryFilter('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-emerald-300 border border-white/20">
                  <span>Status: {statusFilter === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}</span>
                  <button onClick={() => setStatusFilter('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedGenre !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-slate-200 border border-white/20">
                  <span>Genre: {selectedGenre}</span>
                  <button onClick={() => setSelectedGenre('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedLanguage !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-cyan-300 border border-white/20">
                  <span>Lang: {selectedLanguage}</span>
                  <button onClick={() => setSelectedLanguage('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedHallType !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-purple-300 border border-white/20">
                  <span>Format: {selectedHallType}</span>
                  <button onClick={() => setSelectedHallType('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {comingSoonRange !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-amber-200 border border-white/20">
                  <span>Window: {comingSoonRange === 'THIS_MONTH' ? 'July 2026' : 'August 2026'}</span>
                  <button onClick={() => setComingSoonRange('ALL')} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              id="clear-all-filters-btn"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 py-1 px-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Movies Grid Section */}
      {sortedMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={(m) => setSelectedMovieDetail(m)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-6 bg-[#12131C] rounded-3xl border border-white/10 space-y-4 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Film className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-white">No Movies Found Matching Your Criteria</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              We couldn't find any movies matching {searchQuery ? `"${searchQuery}"` : 'your active filters'}. Try searching for an actor's name (e.g. Vijay Baral, Prabhas, Timothée Chalamet), clearing genre selection, or resetting filters.
            </p>
          </div>
          <button
            id="empty-state-reset-btn"
            onClick={handleResetFilters}
            className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET ALL FILTERS</span>
          </button>
        </div>
      )}

      {/* Movie Details Modal */}
      {selectedMovieDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#12131C] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              id="close-movie-detail-modal"
              onClick={() => setSelectedMovieDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src={selectedMovieDetail.poster}
                alt={selectedMovieDetail.title}
                className="w-full sm:w-48 aspect-[2/3] object-cover rounded-2xl border border-white/10 shrink-0"
              />

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37] text-black">
                    {selectedMovieDetail.hallType}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/10">
                    {selectedMovieDetail.industry}
                  </span>
                  {selectedMovieDetail.censorRating && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
                      {selectedMovieDetail.censorRating}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                    {selectedMovieDetail.title}
                  </h2>
                  {selectedMovieDetail.nepaliTitle && (
                    <p className="text-lg text-[#D4AF37] font-nepali mt-1">{selectedMovieDetail.nepaliTitle}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-bold text-[#D4AF37]">
                    <Star className="w-4 h-4 fill-[#D4AF37]" />
                    <span>{selectedMovieDetail.rating} / 10</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedMovieDetail.duration}</span>
                  </span>
                  <span>•</span>
                  <span>Director: <strong className="text-white">{selectedMovieDetail.director}</strong></span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {selectedMovieDetail.synopsis}
                </p>

                {/* Cast Members */}
                <div>
                  <h4 className="text-xs font-bold text-[#D4AF37] uppercase mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Starring Cast</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedMovieDetail.cast.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedMovieDetail(null);
                          setSearchQuery(c.name);
                        }}
                        className="flex items-center gap-2 bg-[#1A1B28] p-1.5 pr-3 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 cursor-pointer transition-all"
                        title={`Click to filter movies starring ${c.name}`}
                      >
                        <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-white hover:text-[#D4AF37]">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    id="detail-book-now-btn"
                    onClick={() => {
                      const m = selectedMovieDetail;
                      setSelectedMovieDetail(null);
                      startBooking(m);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Ticket className="w-4 h-4 fill-black" />
                    <span>GET TICKETS</span>
                  </button>

                  <button
                    id="detail-trailer-btn"
                    onClick={() => {
                      setTrailerUrl(selectedMovieDetail.youtubeTrailerUrl);
                    }}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>WATCH TRAILER</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
