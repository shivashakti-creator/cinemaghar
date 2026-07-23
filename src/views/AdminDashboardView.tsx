import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Movie, Showtime, MovieStatus } from '../types';
import { uploadMediaFileToSupabase } from '../lib/supabase';
import { generateHall1Seats } from '../data/mockData';
import {
  ShieldAlert,
  Plus,
  Film,
  Calendar,
  Armchair,
  QrCode,
  BarChart3,
  Trash2,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Archive,
  Search,
  Filter,
  ArrowUpDown,
  Upload,
  X,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const GENRE_LIST = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Historical',
  'Horror',
  'Mystery',
  'Musical',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Superhero',
  'Thriller',
  'War',
  'Western',
  'Psychological',
  'Biopic',
  'Nepali',
  'Bollywood',
  'Hollywood'
];

const LANGUAGE_LIST = [
  'Nepali',
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Korean',
  'Japanese',
  'Spanish',
  'French'
];

export const AdminDashboardView: React.FC = () => {
  const {
    movies,
    showtimes,
    bookings,
    addMovie,
    updateMovie,
    hideMovie,
    archiveMovie,
    deleteMoviePermanently,
    duplicateMovie,
    addShowtime,
    duplicateShowtime,
    bulkAddWeeklySchedule,
    deleteShowtime,
    toggleBlockSeat,
    verifyTicketQR,
    logoutAdmin,
    setActiveTab,
    showToast
  } = useCinema();

  const [adminTab, setAdminTab] = useState<'analytics' | 'movies' | 'showtimes' | 'blocker' | 'qr-scanner'>('movies');

  // Search, Filter & Sort State for Movies Table
  const [movieSearch, setMovieSearch] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('ALL');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'status'>('newest');

  // Movie Form State (for Create / Edit)
  const [showMovieFormModal, setShowMovieFormModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formNepaliTitle, setFormNepaliTitle] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formDuration, setFormDuration] = useState('2h 15m');
  const [formReleaseDate, setFormReleaseDate] = useState('2026-08-01');
  const [formEndDate, setFormEndDate] = useState('2026-08-30');
  const [formCountry, setFormCountry] = useState('Nepal');
  const [formAgeRating, setFormAgeRating] = useState<'U' | 'U/A' | '16+' | '18+' | 'PG-13' | 'PG' | 'R'>('U/A');
  const [formSelectedGenres, setFormSelectedGenres] = useState<string[]>(['Drama', 'Nepali']);
  const [formSelectedLangs, setFormSelectedLangs] = useState<string[]>(['Nepali']);
  const [formPoster, setFormPoster] = useState('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800');
  const [formBackdrop, setFormBackdrop] = useState('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600');
  const [formVerticalPoster, setFormVerticalPoster] = useState('');
  const [formTrailerThumbnail, setFormTrailerThumbnail] = useState('');
  const [formYoutubeTrailer, setFormYoutubeTrailer] = useState('https://www.youtube.com/embed/5-p5f2M1Yc8');
  const [formTeaserUrl, setFormTeaserUrl] = useState('');
  const [formDirector, setFormDirector] = useState('Gajuri Cinema House');
  const [formProducer, setFormProducer] = useState('Gajuri Media Group');
  const [formMainCastText, setFormMainCastText] = useState('');
  const [formMusicDirector, setFormMusicDirector] = useState('');
  const [formCinematographer, setFormCinematographer] = useState('');
  const [formIndustry, setFormIndustry] = useState<'Nepali' | 'Bollywood' | 'Hollywood' | 'International'>('Nepali');
  const [formStatus, setFormStatus] = useState<MovieStatus>('NOW_SHOWING');
  const [formHallType, setFormHallType] = useState('Hall 1 - IMAX 3D Laser');

  // Removal Options Confirmation Modal
  const [deleteDangerMovie, setDeleteDangerMovie] = useState<Movie | null>(null);

  // Preview Movie Drawer State
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);

  // Add Showtime State
  const [showAddShowtimeModal, setShowAddShowtimeModal] = useState(false);
  const [stMovieId, setStMovieId] = useState(movies[0]?.id || '');
  const [stHallId, setStHallId] = useState('hall-1');
  const [stDate, setStDate] = useState('2026-07-24');
  const [stStartTime, setStStartTime] = useState('03:30 PM');
  const [stEndTime, setStEndTime] = useState('06:00 PM');
  const [stIntermission, setStIntermission] = useState('15 mins');
  const [stFormat, setStFormat] = useState<'2D' | '3D' | 'IMAX 3D' | 'Dolby Atmos' | '4DX'>('IMAX 3D');
  const [stPriceRegular, setStPriceRegular] = useState(350);
  const [stPricePremium, setStPricePremium] = useState(500);
  const [stPriceVip, setStPriceVip] = useState(800);
  const [stPriceRecliner, setStPriceRecliner] = useState(1200);

  // Bulk Weekly Schedule State
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [bulkMovieId, setBulkMovieId] = useState(movies[0]?.id || '');
  const [bulkHallId, setBulkHallId] = useState('hall-1');
  const [bulkStartDate, setBulkStartDate] = useState('2026-07-24');
  const [bulkTimeSlots, setBulkTimeSlots] = useState<string[]>(['11:00 AM', '02:30 PM', '06:00 PM', '09:15 PM']);

  // Seat Blocker Selection
  const [blockerShowtimeId, setBlockerShowtimeId] = useState(showtimes[0]?.id || '');

  // Gate Scanner Simulator Input
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ valid: boolean; booking?: any; message: string } | null>(null);

  // Dashboard Stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.grandTotal, 0);
  const nowShowingCount = movies.filter((m) => m.status === 'NOW_SHOWING').length;
  const comingSoonCount = movies.filter((m) => m.status === 'COMING_SOON').length;
  const archivedCount = movies.filter((m) => m.status === 'ARCHIVED').length;
  const hiddenCount = movies.filter((m) => m.status === 'HIDDEN').length;
  const upcomingShowsCount = showtimes.length;

  // Open Edit Form
  const handleOpenEditMovie = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setFormTitle(movie.title);
    setFormSubtitle(movie.subtitle || '');
    setFormNepaliTitle(movie.nepaliTitle || '');
    setFormSynopsis(movie.synopsis);
    setFormDuration(movie.duration);
    setFormReleaseDate(movie.releaseDate);
    setFormEndDate(movie.endDate || '');
    setFormCountry(movie.country || 'Nepal');
    setFormAgeRating(movie.ageRating || 'U/A');
    setFormSelectedGenres(movie.genre || []);
    setFormSelectedLangs(movie.languages || ['Nepali']);
    setFormPoster(movie.poster);
    setFormBackdrop(movie.backdrop);
    setFormVerticalPoster(movie.verticalPoster || '');
    setFormTrailerThumbnail(movie.trailerThumbnail || '');
    setFormYoutubeTrailer(movie.youtubeTrailerUrl);
    setFormTeaserUrl(movie.teaserUrl || '');
    setFormDirector(movie.director);
    setFormProducer(movie.producer || '');
    setFormMainCastText(movie.mainCastText || '');
    setFormMusicDirector(movie.musicDirector || '');
    setFormCinematographer(movie.cinematographer || '');
    setFormIndustry(movie.industry);
    setFormStatus(movie.status);
    setFormHallType(movie.hallType);
    setShowMovieFormModal(true);
  };

  // Open Create Form
  const handleOpenCreateMovie = () => {
    setEditingMovieId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormNepaliTitle('');
    setFormSynopsis('');
    setFormDuration('2h 15m');
    setFormReleaseDate('2026-08-01');
    setFormEndDate('2026-08-30');
    setFormCountry('Nepal');
    setFormAgeRating('U/A');
    setFormSelectedGenres(['Drama', 'Nepali']);
    setFormSelectedLangs(['Nepali']);
    setFormPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800');
    setFormBackdrop('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600');
    setFormVerticalPoster('');
    setFormTrailerThumbnail('');
    setFormYoutubeTrailer('https://www.youtube.com/embed/5-p5f2M1Yc8');
    setFormTeaserUrl('');
    setFormDirector('Gajuri Cinema House');
    setFormProducer('Gajuri Media Group');
    setFormMainCastText('');
    setFormMusicDirector('');
    setFormCinematographer('');
    setFormIndustry('Nepali');
    setFormStatus('NOW_SHOWING');
    setFormHallType('Hall 1 - IMAX 3D Laser');
    setShowMovieFormModal(true);
  };

  // Drag and Drop / File upload helper for Poster
  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      showToast('Uploading poster...', 'info');
      const uploadedUrl = await uploadMediaFileToSupabase(file);
      setFormPoster(uploadedUrl);
      showToast('Poster uploaded successfully!', 'success');
    }
  };

  const handleBackdropFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      showToast('Uploading banner...', 'info');
      const uploadedUrl = await uploadMediaFileToSupabase(file);
      setFormBackdrop(uploadedUrl);
      showToast('Banner uploaded successfully!', 'success');
    }
  };

  // Submit Movie Form
  const handleSaveMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Movie title is required', 'warning');
      return;
    }

    const payload = {
      title: formTitle,
      subtitle: formSubtitle,
      nepaliTitle: formNepaliTitle,
      synopsis: formSynopsis || 'An exciting new cinematic experience at Gajuri Cinemas.',
      duration: formDuration,
      releaseDate: formReleaseDate,
      endDate: formEndDate,
      country: formCountry,
      ageRating: formAgeRating,
      genre: formSelectedGenres.length > 0 ? formSelectedGenres : ['Drama'],
      languages: formSelectedLangs.length > 0 ? formSelectedLangs : ['Nepali'],
      poster: formPoster,
      backdrop: formBackdrop,
      verticalPoster: formVerticalPoster,
      trailerThumbnail: formTrailerThumbnail,
      youtubeTrailerUrl: formYoutubeTrailer,
      teaserUrl: formTeaserUrl,
      director: formDirector,
      producer: formProducer,
      mainCastText: formMainCastText,
      musicDirector: formMusicDirector,
      cinematographer: formCinematographer,
      industry: formIndustry,
      status: formStatus,
      hallType: formHallType,
      rating: 9.1,
      cast: [
        {
          name: formMainCastText || 'Lead Actor',
          role: 'Protagonist',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
        }
      ],
      featured: true
    };

    if (editingMovieId) {
      await updateMovie(editingMovieId, payload);
    } else {
      await addMovie(payload);
    }

    setShowMovieFormModal(false);
  };

  // Handle Add Showtime Submit
  const handleAddShowtimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const movie = movies.find((m) => m.id === stMovieId);
    addShowtime({
      movieId: stMovieId,
      hallId: stHallId,
      hallName: stHallId === 'hall-1' ? 'Hall 1 - IMAX 3D Laser' : 'Hall 2 - Gajuri Dolby Atmos',
      screenName: stHallId === 'hall-1' ? 'IMAX Laser Screen' : 'Dolby Atmos Screen 2',
      date: stDate,
      time: stStartTime,
      endTime: stEndTime,
      intermissionTime: stIntermission,
      format: stFormat,
      prices: {
        regular: stPriceRegular,
        premium: stPricePremium,
        vip: stPriceVip,
        recliner: stPriceRecliner
      },
      seatCapacity: 120
    });
    setShowAddShowtimeModal(false);
  };

  // Filter & Sort Movies
  const filteredMoviesList = movies
    .filter((m) => {
      // Search
      if (movieSearch.trim()) {
        const q = movieSearch.toLowerCase();
        const titleMatch = m.title.toLowerCase().includes(q);
        const nepaliMatch = m.nepaliTitle?.toLowerCase().includes(q);
        if (!titleMatch && !nepaliMatch) return false;
      }
      // Genre Filter
      if (selectedGenreFilter !== 'ALL' && !m.genre.includes(selectedGenreFilter)) return false;
      // Language Filter
      if (selectedLangFilter !== 'ALL' && !m.languages.includes(selectedLangFilter)) return false;
      // Status Filter
      if (selectedStatusFilter !== 'ALL' && m.status !== selectedStatusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'oldest') return a.releaseDate.localeCompare(b.releaseDate);
      return b.releaseDate.localeCompare(a.releaseDate); // newest default
    });

  const selectedBlockerShowtime = showtimes.find((s) => s.id === blockerShowtimeId);
  const hall1Seats = generateHall1Seats();

  const handleQRScanVerify = () => {
    if (!scanInput.trim()) return;
    const res = verifyTicketQR(scanInput.trim());
    setScanResult(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Top Header Bar with Admin Title & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">GAJURI CINEMAS CONTROL TOWER</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
              Live Real-Time Sync
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-wide">
            Commercial Cinema Management System
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="admin-logout-btn"
            onClick={logoutAdmin}
            className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>

          <button
            id="admin-view-site-btn"
            onClick={() => setActiveTab('home')}
            className="px-4 py-2 rounded-xl bg-[#181A26] hover:bg-[#222536] border border-white/10 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
            <span>View Public Website</span>
          </button>

          <button
            id="admin-quick-add-movie-btn"
            onClick={handleOpenCreateMovie}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW MOVIE</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="bg-[#0F1018] p-4 rounded-2xl border border-white/10 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Movies</p>
          <p className="text-2xl font-black font-serif text-white">{movies.length}</p>
          <p className="text-[10px] text-slate-400">{archivedCount} Archived • {hiddenCount} Hidden</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-emerald-500/30 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Now Showing</p>
          <p className="text-2xl font-black font-serif text-emerald-400">{nowShowingCount}</p>
          <p className="text-[10px] text-emerald-300 font-medium">Live on Homepage</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-amber-500/30 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Coming Soon</p>
          <p className="text-2xl font-black font-serif text-amber-300">{comingSoonCount}</p>
          <p className="text-[10px] text-amber-200">Pre-Booking Teasers</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-white/10 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-black font-serif text-white">{bookings.length}</p>
          <p className="text-[10px] text-slate-400">Confirmed Tickets</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-[#D4AF37]/40 space-y-1 bg-gradient-to-b from-[#D4AF37]/10 to-transparent">
          <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black font-serif text-[#D4AF37]">NPR {totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-bold">+18% this month</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-white/10 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-2xl font-black font-serif text-emerald-400">78.5%</p>
          <p className="text-[10px] text-slate-400">Peak Weekend Demand</p>
        </div>

        <div className="bg-[#0F1018] p-4 rounded-2xl border border-white/10 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Upcoming Shows</p>
          <p className="text-2xl font-black font-serif text-sky-400">{upcomingShowsCount}</p>
          <p className="text-[10px] text-slate-400">Across 2 Halls</p>
        </div>
      </div>

      {/* Main Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 bg-[#0F1018] p-2 rounded-2xl border border-white/10">
        <button
          id="admin-tab-movies"
          onClick={() => setAdminTab('movies')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            adminTab === 'movies' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Movie Management</span>
        </button>

        <button
          id="admin-tab-showtimes"
          onClick={() => setAdminTab('showtimes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            adminTab === 'showtimes' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Showtimes & Scheduling</span>
        </button>

        <button
          id="admin-tab-analytics"
          onClick={() => setAdminTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            adminTab === 'analytics' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Financials</span>
        </button>

        <button
          id="admin-tab-blocker"
          onClick={() => setAdminTab('blocker')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            adminTab === 'blocker' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>Seat Blocker</span>
        </button>

        <button
          id="admin-tab-qr"
          onClick={() => setAdminTab('qr-scanner')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            adminTab === 'qr-scanner' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Gate Ticket Check-In</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MOVIE MANAGEMENT SYSTEM (COMPLETE CRUD) */}
      {/* ========================================================= */}
      {adminTab === 'movies' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Search, Filter & Sort Controls Bar */}
          <div className="bg-[#0F1018] p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-movie-search-input"
                  type="text"
                  placeholder="Search movie title or nepali title..."
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  className="w-full bg-[#161722] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Genre Filter */}
                <select
                  id="admin-filter-genre-select"
                  value={selectedGenreFilter}
                  onChange={(e) => setSelectedGenreFilter(e.target.value)}
                  className="bg-[#161722] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="ALL">All Genres</option>
                  {GENRE_LIST.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                {/* Language Filter */}
                <select
                  id="admin-filter-lang-select"
                  value={selectedLangFilter}
                  onChange={(e) => setSelectedLangFilter(e.target.value)}
                  className="bg-[#161722] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="ALL">All Languages</option>
                  {LANGUAGE_LIST.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  id="admin-filter-status-select"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-[#161722] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NOW_SHOWING">Now Showing</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="ADVANCE_BOOKING">Advance Booking</option>
                  <option value="SPECIAL_SCREENING">Special Screening</option>
                  <option value="FESTIVAL_SCREENING">Festival Screening</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="HIDDEN">Hidden from Website</option>
                </select>

                {/* Sort By */}
                <select
                  id="admin-sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#161722] border border-[#D4AF37]/40 text-[#D4AF37] font-bold rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="title">Sort: Title A-Z</option>
                  <option value="status">Sort: By Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* EASY MOVIE TABLE */}
          <div className="bg-[#0F1018] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif text-white">Movie Master Records</h3>
                <p className="text-xs text-slate-400">Showing {filteredMoviesList.length} of {movies.length} total catalog movies</p>
              </div>
              <button
                id="table-add-movie-btn"
                onClick={handleOpenCreateMovie}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Movie</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#161722] uppercase text-[10px] text-slate-400 tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4">Poster</th>
                    <th className="p-4">Title & Details</th>
                    <th className="p-4">Genre</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Release Date</th>
                    <th className="p-4">Active Shows</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMoviesList.map((m) => {
                    const activeShows = showtimes.filter((s) => s.movieId === m.id).length;

                    return (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Poster Thumbnail */}
                        <td className="p-4">
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-xl border border-white/10 shadow"
                          />
                        </td>

                        {/* Title & Details */}
                        <td className="p-4 space-y-0.5 max-w-xs">
                          <p className="font-bold text-white text-sm font-serif">{m.title}</p>
                          {m.nepaliTitle && <p className="text-[11px] text-[#D4AF37]">{m.nepaliTitle}</p>}
                          <p className="text-[11px] text-slate-400 line-clamp-1">{m.hallType}</p>
                        </td>

                        {/* Genre */}
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {m.genre.map((g) => (
                              <span key={g} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 border border-white/10">
                                {g}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="p-4 font-semibold text-white">{m.duration}</td>

                        {/* Language */}
                        <td className="p-4 font-medium text-slate-300">{m.languages.join(', ')}</td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              m.status === 'NOW_SHOWING'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : m.status === 'COMING_SOON'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : m.status === 'HIDDEN'
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : m.status === 'ARCHIVED'
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                          >
                            {m.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Release Date */}
                        <td className="p-4 text-slate-400 font-mono text-[11px]">{m.releaseDate}</td>

                        {/* Active Shows */}
                        <td className="p-4 font-bold text-amber-300">{activeShows} Shows</td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              id={`preview-movie-btn-${m.id}`}
                              onClick={() => setPreviewMovie(m)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="Preview Movie Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              id={`edit-movie-btn-${m.id}`}
                              onClick={() => handleOpenEditMovie(m)}
                              className="p-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/40 text-[#D4AF37] transition-all"
                              title="Edit Movie Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate */}
                            <button
                              id={`duplicate-movie-btn-${m.id}`}
                              onClick={() => duplicateMovie(m.id)}
                              className="p-2 rounded-xl bg-sky-950/60 hover:bg-sky-900 border border-sky-500/40 text-sky-300"
                              title="Duplicate Movie"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Hide / Unhide Toggle */}
                            <button
                              id={`hide-movie-btn-${m.id}`}
                              onClick={() => {
                                if (m.status === 'HIDDEN') {
                                  updateMovie(m.id, { status: 'NOW_SHOWING' });
                                } else {
                                  hideMovie(m.id);
                                }
                              }}
                              className={`p-2 rounded-xl border transition-all ${
                                m.status === 'HIDDEN'
                                  ? 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-500/40 text-emerald-300'
                                  : 'bg-amber-950/60 hover:bg-amber-900 border-amber-500/40 text-amber-300'
                              }`}
                              title={m.status === 'HIDDEN' ? 'Unhide from Website' : 'Hide from Website'}
                            >
                              {m.status === 'HIDDEN' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            {/* Archive */}
                            <button
                              id={`archive-movie-btn-${m.id}`}
                              onClick={() => archiveMovie(m.id)}
                              className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300"
                              title="Archive Movie"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Permanently (Danger modal trigger) */}
                            <button
                              id={`delete-permanently-movie-btn-${m.id}`}
                              onClick={() => setDeleteDangerMovie(m)}
                              className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SHOWTIMES & SCHEDULING MANAGEMENT */}
      {/* ========================================================= */}
      {adminTab === 'showtimes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold font-serif text-white">Showtimes & Scheduling Manager</h3>
              <p className="text-xs text-slate-400">Configure showtimes, format types, ticket prices per hall, and bulk weekly schedules.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                id="bulk-schedule-open-btn"
                onClick={() => setShowBulkScheduleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#161722] hover:bg-[#202230] border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Layers className="w-4 h-4" />
                <span>Bulk Weekly Schedule</span>
              </button>

              <button
                id="add-showtime-open-btn"
                onClick={() => setShowAddShowtimeModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Showtime</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showtimes.map((s) => {
              const movie = movies.find((m) => m.id === s.movieId);
              return (
                <div key={s.id} className="bg-[#0F1018] p-5 rounded-3xl border border-white/10 flex flex-col justify-between gap-4 relative group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold">
                        {s.format} • {s.time}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Date: {s.date}</span>
                    </div>

                    <h4 className="text-lg font-bold text-white font-serif">{movie?.title || 'Unknown Movie'}</h4>
                    <p className="text-xs text-slate-400">{s.hallName} ({s.screenName || 'Main Screen'})</p>

                    <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px]">Regular: </span>
                        <strong className="text-white">NPR {s.prices.regular}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">VIP/Executive: </span>
                        <strong className="text-[#D4AF37]">NPR {s.prices.vip}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-emerald-400 font-semibold">
                      {s.bookedSeatIds.length} Booked / {s.blockedSeatIds.length} Blocked
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        id={`duplicate-showtime-btn-${s.id}`}
                        onClick={() => {
                          const nextDay = new Date();
                          nextDay.setDate(nextDay.getDate() + 1);
                          duplicateShowtime(s.id, nextDay.toISOString().slice(0, 10));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-500/30 text-[10px] font-bold"
                        title="Duplicate for tomorrow"
                      >
                        Duplicate Tomorrow
                      </button>

                      <button
                        id={`delete-showtime-btn-${s.id}`}
                        onClick={() => deleteShowtime(s.id)}
                        className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/30"
                        title="Delete Showtime"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ANALYTICS & FINANCIAL BREAKDOWN */}
      {/* ========================================================= */}
      {adminTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold font-serif text-white">Nepal Payment Method Distribution</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-[#60BB46]/10 p-4 rounded-2xl border border-[#60BB46]/30">
                  <p className="text-lg font-bold text-[#60BB46]">eSewa Wallet</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {bookings.filter((b) => b.paymentMethod === 'eSewa').length}
                  </p>
                  <p className="text-[10px] text-slate-400">Digital Mobile Payment</p>
                </div>

                <div className="bg-[#5C2D91]/10 p-4 rounded-2xl border border-[#5C2D91]/30">
                  <p className="text-lg font-bold text-[#5C2D91]">Khalti Pay</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {bookings.filter((b) => b.paymentMethod === 'Khalti').length}
                  </p>
                  <p className="text-[10px] text-slate-400">Khalti App</p>
                </div>

                <div className="bg-[#ED1C24]/10 p-4 rounded-2xl border border-[#ED1C24]/30">
                  <p className="text-lg font-bold text-[#ED1C24]">IME Pay</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {bookings.filter((b) => b.paymentMethod === 'IME Pay').length}
                  </p>
                  <p className="text-[10px] text-slate-400">IME Wallet</p>
                </div>

                <div className="bg-[#D4AF37]/10 p-4 rounded-2xl border border-[#D4AF37]/30">
                  <p className="text-lg font-bold text-[#D4AF37]">Box Office Counter</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {bookings.filter((b) => b.paymentMethod === 'Counter' || b.paymentMethod === 'Card').length}
                  </p>
                  <p className="text-[10px] text-slate-400">Cash / Card Counter</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold font-serif text-white">Occupancy & Hall Stats</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#161722] rounded-2xl flex items-center justify-between border border-white/5">
                  <div>
                    <p className="font-bold text-white">Hall 1 - IMAX 3D Laser</p>
                    <p className="text-slate-400 text-[11px]">Capacity: 120 Recliner & VIP seats</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-xl border border-emerald-500/40">
                    84.2% Occupancy
                  </span>
                </div>

                <div className="p-3 bg-[#161722] rounded-2xl flex items-center justify-between border border-white/5">
                  <div>
                    <p className="font-bold text-white">Hall 2 - Gajuri Dolby Atmos</p>
                    <p className="text-slate-400 text-[11px]">Capacity: 120 Premium seats</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-bold rounded-xl border border-sky-500/40">
                    72.8% Occupancy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: INTERACTIVE SEAT BLOCKER */}
      {/* ========================================================= */}
      {adminTab === 'blocker' && (
        <div className="bg-[#0F1018] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-white">Interactive Seat Blocker</h3>
              <p className="text-xs text-slate-400">Click any seat to lock/block it for VIP guests or maintenance.</p>
            </div>

            <select
              id="blocker-showtime-select"
              value={blockerShowtimeId}
              onChange={(e) => setBlockerShowtimeId(e.target.value)}
              className="bg-[#161722] border border-[#D4AF37]/40 text-white text-xs rounded-xl px-4 py-2 focus:outline-none"
            >
              {showtimes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.time} - {s.hallName} ({s.date})
                </option>
              ))}
            </select>
          </div>

          {selectedBlockerShowtime && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <p className="text-xs text-[#D4AF37] font-semibold">
                Editing Blocked Seats for Showtime: {selectedBlockerShowtime.time} ({selectedBlockerShowtime.date})
              </p>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 max-w-2xl mx-auto py-4">
                {hall1Seats.slice(0, 48).map((seat) => {
                  const isBlocked = selectedBlockerShowtime.blockedSeatIds.includes(seat.id);
                  const isBooked = selectedBlockerShowtime.bookedSeatIds.includes(seat.id);

                  return (
                    <button
                      key={seat.id}
                      id={`blocker-seat-btn-${seat.id}`}
                      disabled={isBooked}
                      onClick={() => toggleBlockSeat(selectedBlockerShowtime.id, seat.id)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isBooked
                          ? 'bg-slate-900 text-slate-700 opacity-40 cursor-not-allowed'
                          : isBlocked
                          ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-[#D4AF37] hover:text-black'
                      }`}
                    >
                      {seat.id}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-800 rounded" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-600 rounded" /> Blocked (Click to unblock)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-900 rounded opacity-40" /> Booked by User</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: GATE TICKET CHECK-IN QR SCANNER */}
      {/* ========================================================= */}
      {adminTab === 'qr-scanner' && (
        <div className="bg-[#0F1018] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="text-center space-y-2">
            <QrCode className="w-10 h-10 text-[#D4AF37] mx-auto" />
            <h3 className="text-2xl font-bold font-serif text-white">Gajuri Gate QR Ticket Scanner</h3>
            <p className="text-xs text-slate-400">Enter or paste ticket QR payload to authorize customer entrance.</p>
          </div>

          <div className="flex gap-2">
            <input
              id="qr-scan-input"
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Paste GAJURI-TICKET-... or Booking ID"
              className="flex-1 bg-[#161722] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              id="qr-scan-verify-btn"
              onClick={handleQRScanVerify}
              className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Verify Ticket
            </button>
          </div>

          {scanResult && (
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${
              scanResult.valid ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}>
              <p className="text-lg font-bold">{scanResult.message}</p>
              {scanResult.booking && (
                <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-white/10 text-left">
                  <p>Customer: <strong className="text-white">{scanResult.booking.customerName}</strong></p>
                  <p>Movie: <strong className="text-white">{scanResult.booking.movieTitle}</strong></p>
                  <p>Seats: <strong className="text-[#D4AF37]">{scanResult.booking.seatIds.join(', ')}</strong></p>
                  <p>Showtime: {scanResult.booking.date} @ {scanResult.booking.time}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT MOVIE FORM */}
      {/* ========================================================= */}
      {showMovieFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleSaveMovieSubmit} className="relative w-full max-w-3xl bg-[#0F1018] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingMovieId ? 'Edit Movie Details' : 'Add New Movie to Cinema Catalog'}
              </h3>
              <button
                id="close-movie-form-modal"
                type="button"
                onClick={() => setShowMovieFormModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">1. Basic Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Movie Title *</label>
                    <input
                      id="form-title-input"
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      placeholder="e.g. Pashupati Prasad 2"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Subtitle / Tagline</label>
                    <input
                      id="form-subtitle-input"
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="e.g. The Bhasme Don Chapter"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Nepali Title</label>
                    <input
                      id="form-nepali-title-input"
                      type="text"
                      value={formNepaliTitle}
                      onChange={(e) => setFormNepaliTitle(e.target.value)}
                      placeholder="पशुपति प्रसाद २"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Duration (Hours & Mins)</label>
                    <input
                      id="form-duration-input"
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="2h 15m"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Synopsis / Storyline</label>
                  <textarea
                    id="form-synopsis-input"
                    rows={3}
                    value={formSynopsis}
                    onChange={(e) => setFormSynopsis(e.target.value)}
                    placeholder="Describe the main plot, themes, and backstory..."
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Release Date</label>
                    <input
                      id="form-release-date-input"
                      type="date"
                      value={formReleaseDate}
                      onChange={(e) => setFormReleaseDate(e.target.value)}
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">End Date</label>
                    <input
                      id="form-end-date-input"
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Age Rating</label>
                    <select
                      id="form-age-rating-select"
                      value={formAgeRating}
                      onChange={(e) => setFormAgeRating(e.target.value as any)}
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="U">U (Universal)</option>
                      <option value="U/A">U/A (Parental Guidance)</option>
                      <option value="16+">16+ (16 and older)</option>
                      <option value="18+">18+ (Adults only)</option>
                      <option value="PG-13">PG-13</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Status</label>
                    <select
                      id="form-status-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-[#161722] border border-[#D4AF37]/50 text-[#D4AF37] font-bold rounded-xl px-3 py-2"
                    >
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="ADVANCE_BOOKING">Advance Booking</option>
                      <option value="SPECIAL_SCREENING">Special Screening</option>
                      <option value="FESTIVAL_SCREENING">Festival Screening</option>
                      <option value="ARCHIVED">Archived</option>
                      <option value="HIDDEN">Hidden from Website</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Genres & Languages */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">2. Movie Genres & Languages</h4>
                
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Select Movie Genres (Checkboxes):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-3 bg-[#161722] rounded-2xl border border-white/5">
                    {GENRE_LIST.map((g) => {
                      const checked = formSelectedGenres.includes(g);
                      return (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedGenres([...formSelectedGenres, g]);
                              } else {
                                setFormSelectedGenres(formSelectedGenres.filter((item) => item !== g));
                              }
                            }}
                            className="rounded border-white/20 text-[#D4AF37]"
                          />
                          <span>{g}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Languages:</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_LIST.map((lang) => {
                      const checked = formSelectedLangs.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            if (checked) {
                              setFormSelectedLangs(formSelectedLangs.filter((l) => l !== lang));
                            } else {
                              setFormSelectedLangs([...formSelectedLangs, lang]);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            checked ? 'bg-[#D4AF37] text-black' : 'bg-[#161722] text-slate-400 border border-white/10'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Media Uploads & Links */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">3. Media & Uploads</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Poster Upload */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-semibold">Main Poster URL / Upload</label>
                    <input
                      type="text"
                      value={formPoster}
                      onChange={(e) => setFormPoster(e.target.value)}
                      placeholder="Poster Image URL"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterFileUpload}
                        className="hidden"
                        id="poster-file-input"
                      />
                      <label
                        htmlFor="poster-file-input"
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Poster File (Supabase Storage)</span>
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-semibold">Background Banner URL / Upload</label>
                    <input
                      type="text"
                      value={formBackdrop}
                      onChange={(e) => setFormBackdrop(e.target.value)}
                      placeholder="Backdrop Banner Image URL"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackdropFileUpload}
                        className="hidden"
                        id="backdrop-file-input"
                      />
                      <label
                        htmlFor="backdrop-file-input"
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Banner File</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">YouTube Trailer Embed Link</label>
                  <input
                    type="text"
                    value={formYoutubeTrailer}
                    onChange={(e) => setFormYoutubeTrailer(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Section 4: Cast & Crew */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">4. Cast & Crew</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Director</label>
                    <input
                      type="text"
                      value={formDirector}
                      onChange={(e) => setFormDirector(e.target.value)}
                      placeholder="e.g. Nischal Basnet"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Producer</label>
                    <input
                      type="text"
                      value={formProducer}
                      onChange={(e) => setFormProducer(e.target.value)}
                      placeholder="e.g. Princess Movies"
                      className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Main Cast Members (comma separated)</label>
                  <input
                    type="text"
                    value={formMainCastText}
                    onChange={(e) => setFormMainCastText(e.target.value)}
                    placeholder="e.g. Dayahang Rai, Saugat Malla, Swastima Khadka"
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              id="submit-save-movie-btn"
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-black font-extrabold text-sm rounded-2xl hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(212,175,55,0.4)] cursor-pointer"
            >
              SAVE MOVIE TO SYSTEM
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DANGER REMOVAL CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteDangerMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0F1018] border border-rose-500/50 rounded-3xl p-6 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold font-serif text-white">Permanently Delete Movie?</h3>
              <p className="text-xs text-slate-400">
                You are about to delete <strong className="text-white">{deleteDangerMovie.title}</strong>. This will permanently remove poster images, movie database records, and future showtimes!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="confirm-delete-permanently-btn"
                onClick={async () => {
                  await deleteMoviePermanently(deleteDangerMovie.id);
                  setDeleteDangerMovie(null);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                PERMANENTLY DELETE RECORD
              </button>

              <button
                id="cancel-delete-permanently-btn"
                onClick={() => setDeleteDangerMovie(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancel Keep Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PREVIEW MOVIE DETAILS */}
      {/* ========================================================= */}
      {previewMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0F1018] border border-[#D4AF37]/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <button
              onClick={() => setPreviewMovie(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4">
              <img src={previewMovie.poster} alt={previewMovie.title} className="w-24 h-36 object-cover rounded-2xl shrink-0 shadow" />
              <div className="space-y-1 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px]">
                  {previewMovie.status}
                </span>
                <h3 className="text-xl font-bold text-white font-serif">{previewMovie.title}</h3>
                <p className="text-slate-400">{previewMovie.hallType} • {previewMovie.duration}</p>
                <p className="text-[#D4AF37] font-semibold">{previewMovie.genre.join(', ')}</p>
                <p className="text-slate-300 pt-1 line-clamp-3">{previewMovie.synopsis}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD SHOWTIME MODAL */}
      {/* ========================================================= */}
      {showAddShowtimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form onSubmit={handleAddShowtimeSubmit} className="relative w-full max-w-md bg-[#0F1018] border border-[#D4AF37] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold font-serif text-white">Schedule New Showtime</h3>
              <button type="button" onClick={() => setShowAddShowtimeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Movie</label>
                <select
                  value={stMovieId}
                  onChange={(e) => setStMovieId(e.target.value)}
                  className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Hall / Screen</label>
                  <select
                    value={stHallId}
                    onChange={(e) => setStHallId(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="hall-1">Hall 1 - IMAX 3D Laser</option>
                    <option value="hall-2">Hall 2 - Gajuri Dolby Atmos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Format</label>
                  <select
                    value={stFormat}
                    onChange={(e) => setStFormat(e.target.value as any)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="3D">3D</option>
                    <option value="2D">2D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={stDate}
                    onChange={(e) => setStDate(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={stStartTime}
                    onChange={(e) => setStStartTime(e.target.value)}
                    placeholder="03:30 PM"
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Regular Price (NPR)</label>
                  <input
                    type="number"
                    value={stPriceRegular}
                    onChange={(e) => setStPriceRegular(Number(e.target.value))}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">VIP Price (NPR)</label>
                  <input
                    type="number"
                    value={stPriceVip}
                    onChange={(e) => setStPriceVip(Number(e.target.value))}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#D4AF37] text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 shadow cursor-pointer"
            >
              PUBLISH SHOWTIME
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: BULK WEEKLY SCHEDULE GENERATOR */}
      {/* ========================================================= */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0F1018] border border-[#D4AF37] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold font-serif text-white">Bulk Weekly Schedule Generator</h3>
              <button type="button" onClick={() => setShowBulkScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Movie</label>
                <select
                  value={bulkMovieId}
                  onChange={(e) => setBulkMovieId(e.target.value)}
                  className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full bg-[#161722] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 bg-[#161722] rounded-2xl border border-white/5 space-y-1">
                <p className="font-bold text-white">Daily Time Slots:</p>
                <p className="text-slate-400 text-[11px]">{bulkTimeSlots.join(', ')}</p>
                <p className="text-[#D4AF37] text-[10px] pt-1">Will automatically generate 28 showtime slots for 7 consecutive days.</p>
              </div>
            </div>

            <button
              onClick={() => {
                bulkAddWeeklySchedule(bulkMovieId, bulkHallId, bulkTimeSlots, bulkStartDate, 7);
                setShowBulkScheduleModal(false);
              }}
              className="w-full py-3 bg-[#D4AF37] text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 shadow cursor-pointer"
            >
              GENERATE 7-DAY SCHEDULE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
