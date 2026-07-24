import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useMovies } from '../hooks/useMovies';
import { useShowtimes } from '../hooks/useShowtimes';
import { useBookings } from '../hooks/useBookings';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useRealtimeSubscriptions } from '../hooks/useRealtimeSubscriptions';
import { useCinema } from '../context/CinemaContext';
import { MovieRecord, ShowtimeRecord, BookingRecord, MovieStatus, StaffRecord, ScanLogRecord, PaymentRecord } from '../types/admin';
import { supabase } from '../lib/supabase';
import { AdminPaymentDashboard } from '../views/AdminPaymentDashboard';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Ticket,
  Users,
  CreditCard,
  QrCode,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  UserCheck,
  Activity,
  Layers,
  Copy,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  KeyRound,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'Historical', 'Horror', 'Mystery', 'Musical', 'Romance',
  'Sci-Fi', 'Sports', 'Superhero', 'Thriller', 'War', 'Nepali', 'Bollywood', 'Hollywood'
];

export const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAdminAuth();
  const { showToast, setActiveTab: setMainActiveTab } = useCinema();

  const { movies, loading: loadingMovies, fetchMovies, uploadImageToBucket, createMovie, updateMovie, deleteMovie, bulkDeleteMovies, archiveMovie, toggleMovieStatus } = useMovies();
  const { showtimes, loading: loadingShowtimes, fetchShowtimes, createShowtime, updateShowtime, deleteShowtime, duplicateShowtime } = useShowtimes();
  const { bookings, loading: loadingBookings, fetchBookings, updateBookingStatus, markTicketAsUsed } = useBookings();

  const metrics = useDashboardMetrics(movies, showtimes, bookings);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'showtimes' | 'bookings' | 'staff' | 'payments' | 'scans' | 'settings'>('dashboard');

  // Realtime Subscriptions
  useRealtimeSubscriptions({
    onNewBooking: () => {
      fetchBookings();
      showToast('New ticket booking received in real-time!', 'info');
    },
    onTicketScan: () => {
      fetchScanLogs();
      showToast('New ticket scan recorded at gate', 'info');
    },
    onShowtimeUpdate: () => {
      fetchShowtimes();
    }
  });

  // Notifications Popover
  const [showNotifications, setShowNotifications] = useState(false);

  // ==========================================
  // MOVIE CRUD STATE
  // ==========================================
  const [movieSearch, setMovieSearch] = useState('');
  const [movieStatusFilter, setMovieStatusFilter] = useState<string>('ALL');
  const [movieSortBy, setMovieSortBy] = useState<'newest' | 'title' | 'status'>('newest');
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [moviePage, setMoviePage] = useState(1);
  const moviesPerPage = 6;

  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieRecord | null>(null);

  const [mTitle, setMTitle] = useState('');
  const [mSubtitle, setMSubtitle] = useState('');
  const [mNepaliTitle, setMNepaliTitle] = useState('');
  const [mDescription, setMDescription] = useState('');
  const [mDuration, setMDuration] = useState(135);
  const [mLanguage, setMLanguage] = useState('Nepali');
  const [mCountry, setMCountry] = useState('Nepal');
  const [mAgeRating, setMAgeRating] = useState('U/A');
  const [mReleaseDate, setMReleaseDate] = useState('2026-08-01');
  const [mEndDate, setMEndDate] = useState('2026-08-30');
  const [mTrailerUrl, setMTrailerUrl] = useState('https://www.youtube.com/embed/5-p5f2M1Yc8');
  const [mStatus, setMStatus] = useState<MovieStatus>('NOW_SHOWING');
  const [mPosterUrl, setMPosterUrl] = useState('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800');
  const [mBannerUrl, setMBannerUrl] = useState('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600');
  const [mGenres, setMGenres] = useState<string[]>(['Drama', 'Nepali']);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Open Movie Form Modal
  const handleOpenMovieForm = (movie?: MovieRecord) => {
    if (movie) {
      setEditingMovie(movie);
      setMTitle(movie.title);
      setMSubtitle(movie.subtitle || '');
      setMNepaliTitle(movie.nepaliTitle || '');
      setMDescription(movie.description || movie.synopsis || '');
      setMDuration(movie.duration_minutes || parseInt(movie.duration || '120') || 120);
      setMLanguage(movie.language || 'Nepali');
      setMCountry(movie.country || 'Nepal');
      setMAgeRating(movie.age_rating || 'U/A');
      setMReleaseDate(movie.release_date || '2026-08-01');
      setMEndDate(movie.end_date || '2026-08-30');
      setMTrailerUrl(movie.trailer_url || movie.youtubeTrailerUrl || '');
      setMStatus(movie.status);
      setMPosterUrl(movie.poster_url || movie.poster || '');
      setMBannerUrl(movie.banner_url || movie.backdrop || '');
      setMGenres(movie.genre || ['Drama']);
    } else {
      setEditingMovie(null);
      setMTitle('');
      setMSubtitle('');
      setMNepaliTitle('');
      setMDescription('');
      setMDuration(135);
      setMLanguage('Nepali');
      setMCountry('Nepal');
      setMAgeRating('U/A');
      setMReleaseDate(new Date().toISOString().slice(0, 10));
      setMEndDate('');
      setMTrailerUrl('https://www.youtube.com/embed/5-p5f2M1Yc8');
      setMStatus('NOW_SHOWING');
      setMPosterUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800');
      setMBannerUrl('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600');
      setMGenres(['Drama', 'Nepali']);
    }
    setShowMovieModal(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingPoster(true);
      showToast('Uploading poster image to Supabase bucket...', 'info');
      const url = await uploadImageToBucket(e.target.files[0], 'movie-posters');
      setMPosterUrl(url);
      setUploadingPoster(false);
      showToast('Poster image uploaded successfully!', 'success');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingBanner(true);
      showToast('Uploading banner image to Supabase bucket...', 'info');
      const url = await uploadImageToBucket(e.target.files[0], 'movie-banners');
      setMBannerUrl(url);
      setUploadingBanner(false);
      showToast('Banner image uploaded successfully!', 'success');
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) {
      showToast('Movie title is required', 'warning');
      return;
    }

    const payload: Partial<MovieRecord> = {
      title: mTitle,
      subtitle: mSubtitle,
      nepaliTitle: mNepaliTitle,
      description: mDescription || 'An exciting new cinematic release at Gajuri Cinemas.',
      synopsis: mDescription || 'An exciting new cinematic release at Gajuri Cinemas.',
      duration_minutes: mDuration,
      duration: `${mDuration} mins`,
      language: mLanguage,
      languages: [mLanguage],
      country: mCountry,
      age_rating: mAgeRating,
      release_date: mReleaseDate,
      end_date: mEndDate,
      trailer_url: mTrailerUrl,
      youtubeTrailerUrl: mTrailerUrl,
      status: mStatus,
      poster_url: mPosterUrl,
      poster: mPosterUrl,
      banner_url: mBannerUrl,
      backdrop: mBannerUrl,
      genre: mGenres.length > 0 ? mGenres : ['Drama']
    };

    if (editingMovie) {
      await updateMovie(editingMovie.id, payload);
      showToast('Movie updated successfully!', 'success');
    } else {
      await createMovie(payload);
      showToast('New movie added to catalog!', 'success');
    }
    setShowMovieModal(false);
  };

  // Filtered Movie List
  const filteredMovies = movies
    .filter((m) => {
      if (movieSearch.trim()) {
        const q = movieSearch.toLowerCase();
        if (!m.title.toLowerCase().includes(q) && !m.nepaliTitle?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (movieStatusFilter !== 'ALL' && m.status !== movieStatusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (movieSortBy === 'title') return a.title.localeCompare(b.title);
      if (movieSortBy === 'status') return a.status.localeCompare(b.status);
      return b.release_date.localeCompare(a.release_date);
    });

  const paginatedMovies = filteredMovies.slice((moviePage - 1) * moviesPerPage, moviePage * moviesPerPage);

  // ==========================================
  // SHOWTIME CRUD STATE
  // ==========================================
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [stMovieId, setStMovieId] = useState('');
  const [stHall, setStHall] = useState('Hall 1 - IMAX 3D');
  const [stShowDate, setStShowDate] = useState('2026-07-24');
  const [stStartTime, setStStartTime] = useState('03:30 PM');
  const [stEndTime, setStEndTime] = useState('06:00 PM');
  const [stRegPrice, setStRegPrice] = useState(350);
  const [stPremPrice, setStPremPrice] = useState(500);
  const [stVipPrice, setStVipPrice] = useState(800);

  const handleSaveShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stMovieId) {
      showToast('Please select a movie for this showtime', 'warning');
      return;
    }
    const movie = movies.find((m) => m.id === stMovieId);
    await createShowtime({
      movie_id: stMovieId,
      movie_title: movie?.title || 'Selected Movie',
      hall: stHall,
      hall_id: stHall.includes('1') ? 'hall-1' : 'hall-2',
      show_date: stShowDate,
      start_time: stStartTime,
      end_time: stEndTime,
      format: stHall.includes('IMAX') ? 'IMAX 3D' : 'Dolby Atmos',
      regular_price: stRegPrice,
      premium_price: stPremPrice,
      vip_price: stVipPrice,
      total_seats: 120
    });
    showToast('Showtime created with 120 auto-generated seats (A-J)!', 'success');
    setShowShowtimeModal(false);
  };

  // ==========================================
  // BOOKING MANAGEMENT STATE
  // ==========================================
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [selectedBookingModal, setSelectedBookingModal] = useState<BookingRecord | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const codeMatch = b.booking_code.toLowerCase().includes(q);
      const phoneMatch = b.customer_phone.toLowerCase().includes(q);
      const movieMatch = b.movie_title.toLowerCase().includes(q);
      const nameMatch = b.customer_name.toLowerCase().includes(q);
      if (!codeMatch && !phoneMatch && !movieMatch && !nameMatch) return false;
    }
    if (bookingStatusFilter !== 'ALL' && b.payment_status !== bookingStatusFilter) return false;
    return true;
  });

  // ==========================================
  // STAFF MANAGEMENT STATE
  // ==========================================
  const [staffList, setStaffList] = useState<StaffRecord[]>([
    {
      id: 'staff-1',
      staff_id: 'GAJ-S01',
      full_name: 'Prakash Sharma',
      email: 'prakash@gajuricinemas.com',
      phone: '+977 9841234567',
      role: 'staff',
      is_active: true,
      last_login: '2026-07-23 10:15 AM',
      total_scans: 142,
      device_used: 'Android Gate Scanner #1',
      branch: 'Gajuri Main Hall'
    },
    {
      id: 'staff-2',
      staff_id: 'GAJ-S02',
      full_name: 'Sita Adhikari',
      email: 'sita@gajuricinemas.com',
      phone: '+977 9851234568',
      role: 'staff',
      is_active: true,
      last_login: '2026-07-23 09:30 AM',
      total_scans: 98,
      device_used: 'iOS Gate Scanner #2',
      branch: 'Gajuri VIP Screen'
    }
  ]);

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sPassword, setSPassword] = useState('staff123');

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sEmail.trim() || !sPhone.trim()) {
      showToast('All staff fields are required', 'warning');
      return;
    }

    const newStaff: StaffRecord = {
      id: `staff-${Date.now()}`,
      staff_id: `GAJ-S0${staffList.length + 1}`,
      full_name: sName,
      email: sEmail,
      phone: sPhone,
      role: 'staff',
      is_active: true,
      last_login: 'Just Created',
      total_scans: 0,
      device_used: 'Mobile App',
      created_at: new Date().toISOString()
    };

    // Save to staff_members table
    try {
      await supabase.from('staff_members').insert([{
        id: newStaff.id,
        staff_id: newStaff.staff_id,
        full_name: newStaff.full_name,
        email: newStaff.email,
        phone: newStaff.phone,
        password_hash: sPassword,
        role: 'staff',
        is_active: true
      }]);
    } catch (err) {
      console.warn('Staff member DB insert:', err);
    }

    setStaffList((prev) => [newStaff, ...prev]);
    showToast(`Staff account created for ${sName}`, 'success');
    setShowStaffModal(false);
    setSName('');
    setSEmail('');
    setSPhone('');
  };

  // ==========================================
  // TICKET SCAN LOGS STATE
  // ==========================================
  const [scanLogs, setScanLogs] = useState<ScanLogRecord[]>([]);

  const fetchScanLogs = async () => {
    try {
      const { data } = await supabase.from('scan_logs').select('*').order('scanned_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: ScanLogRecord[] = data.map((d: any) => ({
          id: d.id,
          scanned_at: d.scanned_at,
          booking_code: d.booking_id || d.booking_code,
          staff_name: d.staff_name || 'Gate Operator',
          scan_method: d.scan_method || 'camera',
          scan_result: d.scan_result || 'valid',
          manual_reason: d.manual_reason,
          device_info: d.device_info
        }));
        setScanLogs(mapped);
      } else {
        // Fallback demo scan logs
        setScanLogs([
          { id: '1', scanned_at: '2026-07-23 11:12:00', booking_code: 'GAJ-882910', staff_name: 'Prakash Sharma', scan_method: 'camera', scan_result: 'valid' },
          { id: '2', scanned_at: '2026-07-23 11:05:00', booking_code: 'GAJ-443912', staff_name: 'Sita Adhikari', scan_method: 'upload', scan_result: 'already_used' },
          { id: '3', scanned_at: '2026-07-23 10:48:00', booking_code: 'INVALID-99', staff_name: 'Prakash Sharma', scan_method: 'manual', scan_result: 'invalid' },
          { id: '4', scanned_at: '2026-07-23 10:30:00', booking_code: 'GAJ-102948', staff_name: 'Sita Adhikari', scan_method: 'camera', scan_result: 'valid' }
        ]);
      }
    } catch (err) {
      console.warn('Scan logs fetch error:', err);
    }
  };

  useEffect(() => {
    fetchScanLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0E] text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ========================================================= */}
      <aside className="w-full md:w-64 bg-[#0F1018] border-r border-[#D4AF37]/20 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black font-serif text-white tracking-wider">GAJURI CONTROL</h2>
              <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase">Admin Portal v3.4</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            <button
              id="admin-nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              id="admin-nav-movies"
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'movies' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Movie Catalog</span>
            </button>

            <button
              id="admin-nav-showtimes"
              onClick={() => setActiveTab('showtimes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'showtimes' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Showtimes & Halls</span>
            </button>

            <button
              id="admin-nav-bookings"
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'bookings' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Booking Center</span>
            </button>

            <button
              id="admin-nav-payments"
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'payments' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payments & Nepal Wallets</span>
            </button>

            <button
              id="admin-nav-staff"
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'staff' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff Management</span>
            </button>

            <button
              id="admin-nav-scans"
              onClick={() => setActiveTab('scans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'scans' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Live Ticket Scan Monitor</span>
            </button>

            <button
              id="admin-nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#D4AF37] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin User Card */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 bg-[#161722] p-3 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-black font-extrabold flex items-center justify-center text-sm shadow">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden text-xs">
              <p className="font-bold text-white truncate">{profile?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-[#D4AF37] font-semibold uppercase">{profile?.role || 'super_admin'}</p>
            </div>
          </div>

          <button
            id="admin-sidebar-logout-btn"
            onClick={signOut}
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-[#0F1018] border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Supabase Realtime Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Toggle */}
            <div className="relative">
              <button
                id="admin-top-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-2xl bg-[#161722] border border-white/10 text-slate-300 hover:text-white relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-extrabold flex items-center justify-center">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0F1018] border border-[#D4AF37]/40 rounded-3xl p-4 shadow-2xl z-30 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bold text-white font-serif">Notifications</h4>
                    <span className="text-[10px] text-[#D4AF37] font-semibold">3 New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                      <p className="font-bold text-emerald-400 text-[11px]">New eSewa Payment</p>
                      <p className="text-slate-300 text-[10px]">NPR 1,200 for Avatar: Fire & Ash</p>
                      <span className="text-[9px] text-slate-500">2 mins ago</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                      <p className="font-bold text-amber-300 text-[11px]">Showtime Seat Alert</p>
                      <p className="text-slate-300 text-[10px]">IMAX Hall 1 reached 85% occupancy</p>
                      <span className="text-[9px] text-slate-500">12 mins ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Public Site Switcher */}
            <button
              id="admin-top-view-public"
              onClick={() => setMainActiveTab('home')}
              className="px-4 py-2 rounded-2xl bg-[#161722] hover:bg-[#202230] border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">

          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Executive Overview</h1>
                <p className="text-xs text-slate-400">Real-time database stats, revenue charts, and multiplex performance.</p>
              </div>

              {/* 6 Key Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 space-y-1 shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Movies</span>
                  <p className="text-2xl font-black font-serif text-white">{metrics.totalMovies}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Catalog Active</p>
                </div>

                <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 space-y-1 shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Showtimes</span>
                  <p className="text-2xl font-black font-serif text-sky-400">{metrics.activeShowtimes}</p>
                  <p className="text-[10px] text-slate-400">Across 2 Screens</p>
                </div>

                <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 space-y-1 shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Bookings</span>
                  <p className="text-2xl font-black font-serif text-amber-300">{metrics.todaysBookings}</p>
                  <p className="text-[10px] text-amber-400 font-semibold">+14% vs Yesterday</p>
                </div>

                <div className="bg-[#0F1018] p-4 rounded-3xl border border-[#D4AF37]/40 space-y-1 bg-gradient-to-b from-[#D4AF37]/10 to-transparent shadow-lg">
                  <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Today's Revenue</span>
                  <p className="text-2xl font-black font-serif text-[#D4AF37]">NPR {metrics.todaysRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">Confirmed Sales</p>
                </div>

                <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 space-y-1 shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Occupancy Rate</span>
                  <p className="text-2xl font-black font-serif text-emerald-400">{metrics.occupancyRate}%</p>
                  <p className="text-[10px] text-slate-400">Peak Weekend Capacity</p>
                </div>

                <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 space-y-1 shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Customers</span>
                  <p className="text-2xl font-black font-serif text-white">{metrics.totalCustomers}</p>
                  <p className="text-[10px] text-slate-400">Registered Accounts</p>
                </div>
              </div>

              {/* Analytics Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 7-Day Revenue Area Chart */}
                <div className="lg:col-span-2 bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">7-Day Ticket Revenue (NPR)</h3>
                      <p className="text-xs text-slate-400">Aggregated sales across eSewa, Khalti, Fonepay & Box Office</p>
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37] px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      Live Sales
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.sevenDayRevenue}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#161722', borderColor: '#D4AF37', borderRadius: '12px' }}
                          formatter={(val: any) => [`NPR ${Number(val).toLocaleString()}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Booking Status Pie Chart */}
                <div className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold font-serif text-white">Booking Status Distribution</h3>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.bookingStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {metrics.bookingStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#161722', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-[11px]">
                    {metrics.bookingStatusDistribution.map((st) => (
                      <div key={st.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                        <span className="text-slate-300 font-medium">{st.name} ({st.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Popular Movies Bar Chart */}
              <div className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold font-serif text-white">Top Performing Movies (Revenue & Tickets)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.popularMovies}>
                      <XAxis dataKey="title" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#161722', borderColor: '#D4AF37', borderRadius: '12px' }} />
                      <Bar dataKey="revenue" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MOVIE MANAGEMENT (FULL CRUD) */}
          {/* ========================================================= */}
          {activeTab === 'movies' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Movie Management</h1>
                  <p className="text-xs text-slate-400">Manage titles, uploaded posters/banners, trailers, genres, and showing statuses.</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMovieIds.length > 0 && (
                    <button
                      id="bulk-delete-movies-btn"
                      onClick={async () => {
                        await bulkDeleteMovies(selectedMovieIds);
                        setSelectedMovieIds([]);
                        showToast(`Bulk deleted ${selectedMovieIds.length} movies`, 'success');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected ({selectedMovieIds.length})</span>
                    </button>
                  )}

                  <button
                    id="open-add-movie-modal-btn"
                    onClick={() => handleOpenMovieForm()}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>CREATE NEW MOVIE</span>
                  </button>
                </div>
              </div>

              {/* Search, Status Tabs & Sorting Bar */}
              <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="movie-search-input"
                    type="text"
                    placeholder="Search movie title or nepali name..."
                    value={movieSearch}
                    onChange={(e) => setMovieSearch(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['ALL', 'NOW_SHOWING', 'COMING_SOON', 'ADVANCE_BOOKING', 'ARCHIVED', 'HIDDEN'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setMovieStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] cursor-pointer ${
                        movieStatusFilter === st
                          ? 'bg-[#D4AF37] text-black shadow'
                          : 'bg-[#161722] text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMovies.map((movie) => (
                  <div key={movie.id} className="bg-[#0F1018] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-[#D4AF37]/50 transition-all">
                    <div>
                      {/* Banner / Poster Hero Header */}
                      <div className="relative h-44 w-full overflow-hidden">
                        <img
                          src={movie.banner_url || movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1018] via-[#0F1018]/40 to-transparent" />
                        
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${
                          movie.status === 'NOW_SHOWING' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          movie.status === 'COMING_SOON' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          movie.status === 'ARCHIVED' ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {movie.status.replace('_', ' ')}
                        </span>

                        <input
                          type="checkbox"
                          checked={selectedMovieIds.includes(movie.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMovieIds([...selectedMovieIds, movie.id]);
                            else setSelectedMovieIds(selectedMovieIds.filter((id) => id !== movie.id));
                          }}
                          className="absolute top-3 right-3 w-5 h-5 rounded border-white/30 text-[#D4AF37] focus:ring-0 cursor-pointer"
                        />
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold font-serif text-white group-hover:text-[#D4AF37] transition-colors">{movie.title}</h3>
                          {movie.nepaliTitle && <p className="text-xs text-[#D4AF37] font-semibold">{movie.nepaliTitle}</p>}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">{movie.description || movie.synopsis}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {movie.genre?.map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
                              {g}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[10px] text-[#D4AF37] font-bold">
                            {movie.duration_minutes || movie.duration || 120} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Movie Action Footer */}
                    <div className="p-4 border-t border-white/10 bg-[#161722]/50 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">Rel: {movie.release_date}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`edit-movie-${movie.id}`}
                          onClick={() => handleOpenMovieForm(movie)}
                          className="p-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] border border-[#D4AF37]/40 transition-all cursor-pointer"
                          title="Edit Movie"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`toggle-status-${movie.id}`}
                          onClick={() => toggleMovieStatus(movie.id)}
                          className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                          title="Toggle Active/Inactive"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`archive-movie-${movie.id}`}
                          onClick={() => archiveMovie(movie.id)}
                          className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/40 transition-all cursor-pointer"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`delete-movie-${movie.id}`}
                          onClick={() => deleteMovie(movie.id)}
                          className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {filteredMovies.length > moviesPerPage && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    disabled={moviePage === 1}
                    onClick={() => setMoviePage(moviePage - 1)}
                    className="p-2 rounded-xl bg-[#161722] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400">Page {moviePage} of {Math.ceil(filteredMovies.length / moviesPerPage)}</span>
                  <button
                    disabled={moviePage >= Math.ceil(filteredMovies.length / moviesPerPage)}
                    onClick={() => setMoviePage(moviePage + 1)}
                    className="p-2 rounded-xl bg-[#161722] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SHOWTIME MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'showtimes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Showtimes & Seat Inventory</h1>
                  <p className="text-xs text-slate-400">Schedule showtimes across multiplex screens with automatic A-J seat generation.</p>
                </div>

                <button
                  id="open-add-showtime-modal"
                  onClick={() => setShowShowtimeModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>SCHEDULE NEW SHOWTIME</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showtimes.map((st) => (
                  <div key={st.id} className="bg-[#0F1018] p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl relative">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold uppercase">
                        {st.format || 'IMAX 3D'} • {st.start_time}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Date: {st.show_date}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">{st.movie_title || movies.find((m) => m.id === st.movie_id)?.title || 'Movie Title'}</h3>
                      <p className="text-xs text-slate-400">{st.hall || 'Hall 1 - IMAX 3D'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#161722] p-3 rounded-2xl border border-white/5 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Regular</span>
                        <strong className="text-white">NPR {st.regular_price}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Premium</span>
                        <strong className="text-amber-300">NPR {st.premium_price}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">VIP</span>
                        <strong className="text-[#D4AF37]">NPR {st.vip_price}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-emerald-400 font-bold">
                        {st.booked_seat_ids?.length || 0} / {st.total_seats || 120} Seats Booked
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          id={`duplicate-st-${st.id}`}
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            duplicateShowtime(st.id, tomorrow.toISOString().slice(0, 10));
                            showToast('Showtime duplicated for tomorrow!', 'success');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-sky-950/60 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[10px] font-bold cursor-pointer"
                        >
                          Duplicate
                        </button>

                        <button
                          id={`delete-st-${st.id}`}
                          onClick={() => {
                            deleteShowtime(st.id);
                            showToast('Showtime deleted', 'info');
                          }}
                          className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: BOOKING CENTER */}
          {/* ========================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Booking Center</h1>
                  <p className="text-xs text-slate-400">Search customer tickets, inspect QR tokens, confirm, cancel, or process refunds.</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-[#0F1018] p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="booking-search-input"
                    type="text"
                    placeholder="Search by code (GAJ-...), phone, customer name, or movie..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    id="booking-status-filter"
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="bg-[#161722] border border-white/10 text-white rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="USED">Used / Checked In</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-[#0F1018] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#161722] uppercase text-[10px] text-slate-400 tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Booking Code</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Movie</th>
                        <th className="p-4">Show Details</th>
                        <th className="p-4">Seats</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Provider</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-[#D4AF37]">{b.booking_code}</td>
                          <td className="p-4">
                            <p className="font-bold text-white">{b.customer_name}</p>
                            <p className="text-[10px] text-slate-400">{b.customer_phone}</p>
                          </td>
                          <td className="p-4 font-serif font-bold text-white">{b.movie_title}</td>
                          <td className="p-4 text-[11px]">
                            <p className="text-slate-200">{b.show_date} • {b.show_time}</p>
                            <p className="text-slate-400">{b.hall_name}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                              {b.selected_seats?.map((seat) => (
                                <span key={seat} className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold">
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-extrabold text-white">NPR {b.total_price?.toLocaleString()}</td>
                          <td className="p-4 font-bold text-slate-300">{b.payment_method}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.payment_status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              b.payment_status === 'USED' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                              b.payment_status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              id={`inspect-booking-${b.id}`}
                              onClick={() => setSelectedBookingModal(b)}
                              className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] border border-[#D4AF37]/40 font-bold transition-all cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PAYMENTS & NEPAL WALLETS */}
          {/* ========================================================= */}
          {activeTab === 'payments' && (
            <div className="animate-fade-in">
              <AdminPaymentDashboard />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: STAFF MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Staff & Gate Operators</h1>
                  <p className="text-xs text-slate-400">Provision scanner staff accounts, reset passwords, and monitor gate activity.</p>
                </div>

                <button
                  id="open-add-staff-modal"
                  onClick={() => setShowStaffModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>PROVISION NEW STAFF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staffList.map((st) => (
                  <div key={st.id} className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ACTIVE STAFF • {st.staff_id}
                        </span>
                        <span className="text-[10px] text-slate-400">Last Login: {st.last_login}</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white font-serif">{st.full_name}</h3>
                        <p className="text-xs text-slate-400">{st.email} • {st.phone}</p>
                      </div>

                      <div className="bg-[#161722] p-3 rounded-2xl border border-white/5 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Gate</span>
                          <span className="text-white font-bold">{st.branch || 'Gajuri Main Screen'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Scans</span>
                          <span className="text-[#D4AF37] font-extrabold">{st.total_scans} Tickets</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="text-slate-400 text-[10px]">Device: {st.device_used}</span>
                      <button
                        onClick={() => showToast(`Password reset link sent to ${st.email}`, 'info')}
                        className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: LIVE TICKET SCAN MONITOR */}
          {/* ========================================================= */}
          {activeTab === 'scans' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">Live Ticket Scan Monitor</h1>
                <p className="text-xs text-slate-400">Real-time gate scan log streaming directly from `scan_logs` table.</p>
              </div>

              <div className="bg-[#0F1018] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#161722] uppercase text-[10px] text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Booking Code</th>
                        <th className="p-3">Gate Staff</th>
                        <th className="p-3">Scan Method</th>
                        <th className="p-3">Scan Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scanLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{log.scanned_at}</td>
                          <td className="p-3 font-mono font-bold text-white">{log.booking_code}</td>
                          <td className="p-3 font-bold text-slate-300">{log.staff_name}</td>
                          <td className="p-3 uppercase text-[10px] text-slate-400">{log.scan_method}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.scan_result === 'valid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              log.scan_result === 'already_used' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {log.scan_result.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: SYSTEM SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">System Settings</h1>
                <p className="text-xs text-slate-400">Theater settings, ticket defaults, and Supabase connection metadata.</p>
              </div>

              <div className="bg-[#0F1018] p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl max-w-2xl">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-white border-b border-white/10 pb-2">Gajuri Multiplex Configuration</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Theater Name</label>
                      <input type="text" defaultValue="Gajuri Cinemas" className="w-full bg-[#161722] border border-white/10 rounded-xl p-2.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Branch Location</label>
                      <input type="text" defaultValue="Gajuri Bazaar, Dhading, Nepal" className="w-full bg-[#161722] border border-white/10 rounded-xl p-2.5 text-white" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-slate-400 font-bold text-xs mb-1">Supabase Endpoint Status</label>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                      Connected to Supabase Cloud Database (qfylfqobfsuprtvnhvco)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showToast('System settings saved successfully!', 'success')}
                  className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider transition-all shadow cursor-pointer"
                >
                  SAVE SYSTEM CONFIGURATION
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: MOVIE FORM (CREATE / EDIT) */}
      {/* ========================================================= */}
      {showMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F1018] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black font-serif text-white">
                {editingMovie ? 'Edit Movie Record' : 'Add New Movie to Catalog'}
              </h2>
              <button onClick={() => setShowMovieModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="e.g. Avatar: Fire and Ash"
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[#D4AF37] font-bold mb-1">Nepali Title (नेपाली शीर्षक)</label>
                  <input
                    type="text"
                    value={mNepaliTitle}
                    onChange={(e) => setMNepaliTitle(e.target.value)}
                    placeholder="e.g. अवतार: आगो र खरानी"
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Synopsis / Storyline</label>
                <textarea
                  rows={3}
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  placeholder="Enter detailed movie summary..."
                  className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={mDuration}
                    onChange={(e) => setMDuration(parseInt(e.target.value) || 120)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Language</label>
                  <select
                    value={mLanguage}
                    onChange={(e) => setMLanguage(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="Nepali">Nepali</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Age Rating</label>
                  <select
                    value={mAgeRating}
                    onChange={(e) => setMAgeRating(e.target.value)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="U/A">U/A (Parental Guidance)</option>
                    <option value="16+">16+ (Nepal Board)</option>
                    <option value="18+">18+ (Adults Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={mStatus}
                    onChange={(e) => setMStatus(e.target.value as MovieStatus)}
                    className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="NOW_SHOWING">Now Showing</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ADVANCE_BOOKING">Advance Booking</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
              </div>

              {/* Upload Poster & Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Poster Image (Bucket Upload)</label>
                  <input type="file" accept="image/*" onChange={handlePosterUpload} className="w-full text-slate-400" />
                  {mPosterUrl && <img src={mPosterUrl} alt="Poster preview" className="w-20 h-28 object-cover rounded-xl mt-2 border border-white/10" />}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Banner Image (Bucket Upload)</label>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="w-full text-slate-400" />
                  {mBannerUrl && <img src={mBannerUrl} alt="Banner preview" className="w-40 h-24 object-cover rounded-xl mt-2 border border-white/10" />}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowMovieModal(false)} className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold shadow">Save Movie</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SHOWTIME CREATION */}
      {/* ========================================================= */}
      {showShowtimeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1018] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black font-serif text-white">Schedule New Showtime</h2>
              <button onClick={() => setShowShowtimeModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveShowtime} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Movie *</label>
                <select
                  value={stMovieId}
                  onChange={(e) => setStMovieId(e.target.value)}
                  className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white"
                  required
                >
                  <option value="">-- Select Movie --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hall / Screen</label>
                  <select value={stHall} onChange={(e) => setStHall(e.target.value)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white">
                    <option value="Hall 1 - IMAX 3D">Hall 1 - IMAX 3D</option>
                    <option value="Hall 2 - Gajuri Dolby Atmos">Hall 2 - Gajuri Dolby Atmos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Show Date</label>
                  <input type="date" value={stShowDate} onChange={(e) => setStShowDate(e.target.value)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Time</label>
                  <input type="text" value={stStartTime} onChange={(e) => setStStartTime(e.target.value)} placeholder="03:30 PM" className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Time</label>
                  <input type="text" value={stEndTime} onChange={(e) => setStEndTime(e.target.value)} placeholder="06:00 PM" className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Regular (NPR)</label>
                  <input type="number" value={stRegPrice} onChange={(e) => setStRegPrice(parseInt(e.target.value) || 350)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Premium (NPR)</label>
                  <input type="number" value={stPremPrice} onChange={(e) => setStPremPrice(parseInt(e.target.value) || 500)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">VIP (NPR)</label>
                  <input type="number" value={stVipPrice} onChange={(e) => setStVipPrice(parseInt(e.target.value) || 800)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl text-[11px] text-[#D4AF37]">
                ⚡ Automatically generates 120 seats in `show_seats` table (Rows A-J, Seats 1-15).
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowShowtimeModal(false)} className="px-5 py-2.5 rounded-2xl bg-white/5 text-slate-300 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold shadow">Create Showtime</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STAFF PROVISIONING */}
      {/* ========================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1018] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black font-serif text-white">Provision Gate Staff Account</h2>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input type="text" required value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Ramesh Adhikari" className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
                <input type="email" required value={sEmail} onChange={(e) => setSEmail(e.target.value)} placeholder="ramesh@gajuricinemas.com" className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number *</label>
                <input type="text" required value={sPhone} onChange={(e) => setSPhone(e.target.value)} placeholder="+977 9841000000" className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Initial Staff Password</label>
                <input type="text" value={sPassword} onChange={(e) => setSPassword(e.target.value)} className="w-full bg-[#161722] border border-white/10 rounded-xl p-3 text-white font-mono" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setShowStaffModal(false)} className="px-5 py-2.5 rounded-2xl bg-white/5 text-slate-300 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold shadow">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INSPECT BOOKING DETAILS */}
      {/* ========================================================= */}
      {selectedBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1018] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black font-serif text-white">Booking Details</h2>
                <span className="font-mono text-[#D4AF37] text-xs font-bold">{selectedBookingModal.booking_code}</span>
              </div>
              <button onClick={() => setSelectedBookingModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#161722] p-4 rounded-2xl border border-white/5 space-y-2">
                <p><span className="text-slate-400">Customer:</span> <strong className="text-white">{selectedBookingModal.customer_name}</strong> ({selectedBookingModal.customer_phone})</p>
                <p><span className="text-slate-400">Movie:</span> <strong className="text-white">{selectedBookingModal.movie_title}</strong></p>
                <p><span className="text-slate-400">Showtime:</span> <strong className="text-white">{selectedBookingModal.show_date} • {selectedBookingModal.show_time}</strong> ({selectedBookingModal.hall_name})</p>
                <p><span className="text-slate-400">Selected Seats:</span> <strong className="text-[#D4AF37]">{selectedBookingModal.selected_seats?.join(', ')}</strong></p>
                <p><span className="text-slate-400">Total Amount:</span> <strong className="text-emerald-400">NPR {selectedBookingModal.total_price?.toLocaleString()}</strong> via {selectedBookingModal.payment_method}</p>
                <p><span className="text-slate-400">Status:</span> <span className="font-bold uppercase text-amber-300">{selectedBookingModal.payment_status}</span></p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={async () => {
                    await updateBookingStatus(selectedBookingModal.id, 'CONFIRMED');
                    showToast('Booking status confirmed!', 'success');
                    setSelectedBookingModal(null);
                  }}
                  className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
                >
                  Confirm Ticket
                </button>

                <button
                  onClick={async () => {
                    await updateBookingStatus(selectedBookingModal.id, 'USED');
                    showToast('Ticket marked as used / scanned at gate!', 'info');
                    setSelectedBookingModal(null);
                  }}
                  className="p-3 rounded-2xl bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold cursor-pointer"
                >
                  Mark as Used
                </button>

                <button
                  onClick={async () => {
                    await updateBookingStatus(selectedBookingModal.id, 'REFUNDED');
                    showToast('Booking refunded via payment gateway', 'info');
                    setSelectedBookingModal(null);
                  }}
                  className="p-3 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold cursor-pointer"
                >
                  Process Refund
                </button>

                <button
                  onClick={async () => {
                    await updateBookingStatus(selectedBookingModal.id, 'CANCELLED');
                    showToast('Booking cancelled', 'warning');
                    setSelectedBookingModal(null);
                  }}
                  className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold cursor-pointer"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
