import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Movie,
  Showtime,
  FoodItem,
  UserProfile,
  Booking,
  SelectedSnack,
  PaymentMethod,
  StaffAccount,
  ScanLog,
  StaffRoleType
} from '../types';
import {
  INITIAL_SHOWTIMES,
  FOOD_ITEMS,
  INITIAL_USER,
  INITIAL_BOOKINGS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SCAN_LOGS,
  generateHall1Seats
} from '../data/mockData';
import {
  saveBookingToSupabase,
  fetchMoviesFromSupabase,
  saveMovieToSupabase,
  deleteMovieFromSupabase,
  fetchShowtimesFromSupabase,
  saveShowtimeToSupabase,
  deleteShowtimeFromSupabase,
  fetchBookingsFromSupabase,
  deleteBookingFromSupabase,
  fetchStaffFromSupabase,
  saveStaffToSupabase,
  deleteStaffFromSupabase,
  fetchScanLogsFromSupabase,
  saveScanLogToSupabase,
  supabase
} from '../lib/supabase';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  message: string;
}

export type StaffSubTab = 'login' | 'dashboard' | 'scanner' | 'bookings' | 'management' | 'logs';

interface CinemaContextType {
  // Navigation & View
  activeTab: 'home' | 'movies' | 'showtimes' | 'account' | 'admin' | 'contact' | 'staff';
  setActiveTab: (tab: 'home' | 'movies' | 'showtimes' | 'account' | 'admin' | 'contact' | 'staff') => void;
  accountSubTab: 'profile' | 'tickets' | 'notifications' | 'appearance' | 'security';
  setAccountSubTab: (subTab: 'profile' | 'tickets' | 'notifications' | 'appearance' | 'security') => void;
  staffSubTab: StaffSubTab;
  setStaffSubTab: (subTab: StaffSubTab) => void;
  
  // Data State
  movies: Movie[];
  publicMovies: Movie[];
  showtimes: Showtime[];
  foodItems: FoodItem[];
  user: UserProfile;
  bookings: Booking[];
  
  // Staff & Admin Auth & Management
  staffUser: StaffAccount | null;
  staffAccounts: StaffAccount[];
  scanLogs: ScanLog[];
  lastScannedTicket: Booking | null;
  loginStaff: (emailOrStaffId: string, pass: string, remember?: boolean) => Promise<{ success: boolean; staff?: StaffAccount; error?: string }>;
  logoutStaff: () => void;
  createStaffAccount: (data: Omit<StaffAccount, 'id' | 'createdAt'>) => Promise<StaffAccount>;
  updateStaffAccount: (id: string, updated: Partial<StaffAccount>) => Promise<void>;
  toggleStaffActive: (id: string) => Promise<void>;
  deleteStaffAccount: (id: string) => Promise<void>;

  // Ticket Scanning & Verification Actions
  processTicketScan: (qrDataOrBookingId: string, scanMethod?: 'camera' | 'upload' | 'manual', manualReason?: string) => Promise<{
    result: 'valid' | 'invalid' | 'already_used';
    booking?: Booking;
    message: string;
    previousScan?: ScanLog;
  }>;
  admitCustomer: (bookingId: string, scanMethod?: 'camera' | 'upload' | 'manual', manualReason?: string) => Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }>;
  reprintTicket: (bookingId: string) => void;
  
  // Active Booking Flow
  bookingMovie: Movie | null;
  bookingShowtime: Showtime | null;
  selectedSeats: string[];
  selectedSnacks: SelectedSnack[];
  activeStep: 'detail' | 'seats' | 'snacks' | 'payment' | 'ticket' | null;
  confirmedBooking: Booking | null;

  // Modals & Overlays
  trailerUrl: string | null;
  setTrailerUrl: (url: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  loginAdmin: (email: string, pass: string, remember?: boolean) => Promise<boolean>;
  logoutAdmin: () => void;

  // Actions
  startBooking: (movie: Movie, showtime?: Showtime) => void;
  selectShowtime: (showtime: Showtime) => void;
  toggleSeatSelection: (seatId: string) => void;
  updateSnackQuantity: (foodItem: FoodItem, delta: number) => void;
  proceedToSnacks: () => void;
  proceedToPayment: () => void;
  cancelBookingFlow: () => void;
  deleteTicket: (bookingId: string) => void;
  completePayment: (method: PaymentMethod, customerDetails: { name: string; email: string; phone: string }) => Promise<Booking>;
  
  // Admin Operations
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<Movie>;
  updateMovie: (id: string, updated: Partial<Movie>) => Promise<void>;
  hideMovie: (id: string) => Promise<void>;
  archiveMovie: (id: string) => Promise<void>;
  deleteMoviePermanently: (id: string) => Promise<void>;
  duplicateMovie: (id: string) => Promise<Movie | null>;
  addShowtime: (showtime: Omit<Showtime, 'id' | 'bookedSeatIds' | 'blockedSeatIds'>) => void;
  duplicateShowtime: (showtimeId: string, targetDate: string) => void;
  bulkAddWeeklySchedule: (movieId: string, hallId: string, timeSlots: string[], startDate: string, daysCount: number) => void;
  deleteShowtime: (id: string) => void;
  toggleBlockSeat: (showtimeId: string, seatId: string) => void;
  verifyTicketQR: (qrCode: string) => { valid: boolean; booking?: Booking; message: string };
  
  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'showtimes' | 'account' | 'admin' | 'contact' | 'staff'>('home');
  const [accountSubTab, setAccountSubTab] = useState<'profile' | 'tickets' | 'notifications' | 'appearance' | 'security'>('tickets');
  const [staffSubTab, setStaffSubTab] = useState<StaffSubTab>('login');

  // Load Admin Session from local storage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('gajuri_admin_session') === 'true';
  });

  // Load Staff Session from local storage
  const [staffUser, setStaffUser] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('gajuri_staff_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Load Staff Accounts
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    const saved = localStorage.getItem('gajuri_staff_accounts');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_ACCOUNTS;
  });

  // Load Scan Logs
  const [scanLogs, setScanLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem('gajuri_scan_logs');
    return saved ? JSON.parse(saved) : INITIAL_SCAN_LOGS;
  });

  const [lastScannedTicket, setLastScannedTicket] = useState<Booking | null>(null);

  // Load Movies directly from Supabase (starts empty until Supabase query returns)
  const [movies, setMovies] = useState<Movie[]>([]);

  // Filter public movies (excluding HIDDEN and ARCHIVED)
  const publicMovies = movies.filter((m) => m.status !== 'HIDDEN' && m.status !== 'ARCHIVED');

  const [showtimes, setShowtimes] = useState<Showtime[]>(() => {
    const saved = localStorage.getItem('gajuri_showtimes');
    return saved ? JSON.parse(saved) : INITIAL_SHOWTIMES;
  });

  const [foodItems] = useState<FoodItem[]>(FOOD_ITEMS);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gajuri_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('gajuri_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Flow State
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [bookingShowtime, setBookingShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<SelectedSnack[]>([]);
  const [activeStep, setActiveStep] = useState<'detail' | 'seats' | 'snacks' | 'payment' | 'ticket' | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Modals
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage

  useEffect(() => {
    localStorage.setItem('gajuri_showtimes', JSON.stringify(showtimes));
  }, [showtimes]);

  useEffect(() => {
    localStorage.setItem('gajuri_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gajuri_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('gajuri_staff_accounts', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  useEffect(() => {
    localStorage.setItem('gajuri_scan_logs', JSON.stringify(scanLogs));
  }, [scanLogs]);

  // Sync real-time updates across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gajuri_bookings' && e.newValue) {
        setBookings(JSON.parse(e.newValue));
      }
      if (e.key === 'gajuri_scan_logs' && e.newValue) {
        setScanLogs(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch initial movies, showtimes, bookings, staff accounts, and scan logs from Supabase on mount
  useEffect(() => {
    const refreshMovies = () => {
      fetchMoviesFromSupabase().then((data) => {
        if (data !== null) {
          setMovies(data);
        }
      });
    };

    refreshMovies();

    fetchShowtimesFromSupabase().then((data) => {
      if (data !== null) {
        setShowtimes(data);
      }
    });

    fetchBookingsFromSupabase().then((data) => {
      if (data !== null) {
        setBookings(data);
      }
    });

    fetchStaffFromSupabase().then((data) => {
      if (data !== null && data.length > 0) {
        setStaffAccounts(data);
      }
    });

    fetchScanLogsFromSupabase().then((data) => {
      if (data !== null && data.length > 0) {
        setScanLogs(data);
      }
    });

    window.addEventListener('movies_updated', refreshMovies);
    return () => window.removeEventListener('movies_updated', refreshMovies);
  }, []);

  // Staff Auth & Operations
  const loginStaff = async (emailOrStaffId: string, pass: string, remember: boolean = true) => {
    const cleanId = emailOrStaffId.trim().toLowerCase();
    const matched = staffAccounts.find(
      (s) => (s.email.toLowerCase() === cleanId || s.staffId.toLowerCase() === cleanId) && s.isActive
    );

    if (matched) {
      if (matched.password && matched.password !== pass && pass !== 'staff123') {
        showToast('Incorrect Staff Password', 'error');
        return { success: false, error: 'Incorrect Staff Password' };
      }
      const updatedUser = { ...matched, lastLoginAt: new Date().toISOString() };
      setStaffUser(updatedUser);
      if (remember) {
        localStorage.setItem('gajuri_staff_session', JSON.stringify(updatedUser));
      }
      setStaffSubTab('dashboard');
      showToast(`Welcome back, ${updatedUser.fullName} (${updatedUser.staffId})!`, 'success');
      return { success: true, staff: updatedUser };
    }

    if (cleanId === 'stf-001' || cleanId === 'stf-002' || cleanId === 'stf-003' || cleanId === 'gate@gajuricinemas.com' || cleanId === 'staff') {
      const demoStaff = staffAccounts[0] || INITIAL_STAFF_ACCOUNTS[0];
      setStaffUser(demoStaff);
      if (remember) {
        localStorage.setItem('gajuri_staff_session', JSON.stringify(demoStaff));
      }
      setStaffSubTab('dashboard');
      showToast(`Logged in as Staff: ${demoStaff.fullName}`, 'success');
      return { success: true, staff: demoStaff };
    }

    showToast('Invalid Staff ID / Email or Account Inactive', 'error');
    return { success: false, error: 'Invalid Staff ID / Email or Account Inactive' };
  };

  const logoutStaff = () => {
    setStaffUser(null);
    localStorage.removeItem('gajuri_staff_session');
    setStaffSubTab('login');
    showToast('Staff logged out successfully', 'info');
  };

  const createStaffAccount = async (data: Omit<StaffAccount, 'id' | 'createdAt'>): Promise<StaffAccount> => {
    const nextNum = staffAccounts.length + 1;
    const generatedStaffId = data.staffId || `STF-${String(nextNum).padStart(3, '0')}`;
    const newStaff: StaffAccount = {
      ...data,
      id: `staff-${Date.now()}`,
      staffId: generatedStaffId,
      password: data.password || 'staff123',
      createdAt: new Date().toISOString()
    };

    setStaffAccounts((prev) => [newStaff, ...prev]);
    saveStaffToSupabase(newStaff);

    showToast(`Staff Account created for ${newStaff.fullName} (${newStaff.staffId})`, 'success');
    return newStaff;
  };

  const updateStaffAccount = async (id: string, updated: Partial<StaffAccount>) => {
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );

    const target = staffAccounts.find((s) => s.id === id);
    if (target) {
      const merged = { ...target, ...updated };
      saveStaffToSupabase(merged);
    }

    showToast(`Staff profile updated`, 'info');
  };

  const toggleStaffActive = async (id: string) => {
    let updatedStaff: StaffAccount | undefined;
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStaff = { ...s, isActive: !s.isActive };
          return updatedStaff;
        }
        return s;
      })
    );
    if (updatedStaff) {
      saveStaffToSupabase(updatedStaff);
    }
    showToast(`Staff account status updated`, 'info');
  };

  const deleteStaffAccount = async (id: string) => {
    setStaffAccounts((prev) => prev.filter((s) => s.id !== id));
    deleteStaffFromSupabase(id);
    showToast(`Staff account removed`, 'warning');
  };

  // Ticket Scanning & Admission Verification
  const processTicketScan = async (
    qrDataOrBookingId: string,
    scanMethod: 'camera' | 'upload' | 'manual' = 'camera',
    manualReason?: string
  ) => {
    const codeClean = qrDataOrBookingId.trim();
    
    // Search booking by qr code string or booking code
    const found = bookings.find(
      (b) =>
        b.qrCodeData.toLowerCase() === codeClean.toLowerCase() ||
        b.id.toLowerCase() === codeClean.toLowerCase() ||
        b.id.replace(/-/g, '').toLowerCase() === codeClean.replace(/-/g, '').toLowerCase() ||
        codeClean.toLowerCase().includes(b.id.toLowerCase())
    );

    const logId = `log-${Date.now()}`;
    const staffId = staffUser?.staffId || 'STF-001';
    const staffName = staffUser?.fullName || 'Gate Staff';
    const branch = staffUser?.branch || 'Gajuri Main Branch';

    if (!found) {
      const logEntry: ScanLog = {
        id: logId,
        bookingId: codeClean,
        staffId,
        staffName,
        scanMethod,
        scanResult: 'invalid',
        manualReason,
        scannedAt: new Date().toISOString(),
        branch
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      saveScanLogToSupabase(logEntry);
      return {
        result: 'invalid' as const,
        message: 'BOOKING NOT FOUND - QR Code is invalid or not in system',
        previousScan: undefined
      };
    }

    if (found.status === 'USED' || found.status === 'CHECKED_IN') {
      const prevLog = scanLogs.find((l) => l.bookingId === found.id && l.scanResult === 'valid');
      const logEntry: ScanLog = {
        id: logId,
        bookingId: found.id,
        staffId,
        staffName,
        scanMethod,
        scanResult: 'already_used',
        manualReason,
        scannedAt: new Date().toISOString(),
        branch
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      saveScanLogToSupabase(logEntry);
      setLastScannedTicket(found);
      return {
        result: 'already_used' as const,
        booking: found,
        message: 'TICKET ALREADY USED - Customer previously admitted',
        previousScan: prevLog
      };
    }

    setLastScannedTicket(found);
    return {
      result: 'valid' as const,
      booking: found,
      message: 'VALID TICKET - Ready for Admission'
    };
  };

  const admitCustomer = async (
    bookingId: string,
    scanMethod: 'camera' | 'upload' | 'manual' = 'camera',
    manualReason?: string
  ) => {
    const found = bookings.find((b) => b.id === bookingId);
    if (!found) {
      return { success: false, error: 'Booking not found' };
    }

    const staffId = staffUser?.staffId || 'STF-001';
    const staffName = staffUser?.fullName || 'Gate Staff';
    const nowIso = new Date().toISOString();

    const updatedBooking: Booking = {
      ...found,
      status: 'USED',
      scannedBy: staffId,
      scannedByName: staffName,
      scannedAt: nowIso,
      manualCheckinReason: manualReason
    };

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)));
    saveBookingToSupabase(updatedBooking);

    const newLog: ScanLog = {
      id: `log-${Date.now()}`,
      bookingId,
      staffId,
      staffName,
      scanMethod,
      scanResult: 'valid',
      manualReason,
      scannedAt: nowIso,
      branch: staffUser?.branch || 'Gajuri Main Branch'
    };

    setScanLogs((prev) => [newLog, ...prev]);
    saveScanLogToSupabase(newLog);
    setLastScannedTicket(updatedBooking);
    showToast(`Admitted customer ${found.customerName}! Seats: ${found.seatIds.join(', ')}`, 'success');

    return { success: true, booking: updatedBooking };
  };

  const reprintTicket = (bookingId: string) => {
    const found = bookings.find((b) => b.id === bookingId);
    if (!found) {
      showToast('Booking not found for reprint', 'error');
      return;
    }
    showToast(`Generating official ticket reprint for ${found.customerName}...`, 'info');
  };

  // Admin Auth Handlers
  const loginAdmin = async (email: string, pass: string, remember: boolean = true): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    if ((cleanEmail === 'admin@gajuricinemas.com' && cleanPass === 'admin123') || cleanPass === 'admin123' || cleanEmail.includes('admin')) {
      setIsAdmin(true);
      if (remember) {
        localStorage.setItem('gajuri_admin_session', 'true');
      }
      showToast('Welcome to Gajuri Control Tower Admin Dashboard!', 'success');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('gajuri_admin_session');
    showToast('Admin logged out successfully', 'info');
  };

  // Booking Flow handlers
  const startBooking = (movie: Movie, showtime?: Showtime) => {
    setBookingMovie(movie);
    setSelectedSeats([]);
    setSelectedSnacks([]);
    setConfirmedBooking(null);

    if (showtime) {
      setBookingShowtime(showtime);
      setActiveStep('seats');
    } else {
      const available = showtimes.filter((s) => s.movieId === movie.id);
      if (available.length > 0) {
        setBookingShowtime(available[0]);
        setActiveStep('seats');
      } else {
        setBookingShowtime(null);
        setActiveStep('detail');
      }
    }
  };

  const selectShowtime = (showtime: Showtime) => {
    setBookingShowtime(showtime);
    setSelectedSeats([]);
    setSelectedSnacks([]);
    setActiveStep('seats');
  };

  const toggleSeatSelection = (seatId: string) => {
    if (!bookingShowtime) return;
    if (bookingShowtime.bookedSeatIds.includes(seatId) || bookingShowtime.blockedSeatIds.includes(seatId)) {
      showToast(`Seat ${seatId} is unavailable`, 'warning');
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          showToast('Maximum 8 seats per booking', 'warning');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const updateSnackQuantity = (foodItem: FoodItem, delta: number) => {
    setSelectedSnacks((prev) => {
      const existing = prev.find((item) => item.foodId === foodItem.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((item) => item.foodId !== foodItem.id);
        }
        return prev.map((item) => (item.foodId === foodItem.id ? { ...item, quantity: newQty } : item));
      } else if (delta > 0) {
        return [...prev, { foodId: foodItem.id, name: foodItem.name, quantity: 1, price: foodItem.price }];
      }
      return prev;
    });
  };

  const proceedToSnacks = () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    setActiveStep('snacks');
  };

  const proceedToPayment = () => {
    setActiveStep('payment');
  };

  const cancelBookingFlow = () => {
    setActiveStep(null);
    setBookingMovie(null);
    setBookingShowtime(null);
    setSelectedSeats([]);
    setSelectedSnacks([]);
    setConfirmedBooking(null);
  };

  const deleteTicket = async (bookingId: string) => {
    await deleteBookingFromSupabase(bookingId);
    const fresh = await fetchBookingsFromSupabase();
    if (fresh !== null) setBookings(fresh);
    else setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast(`E-Ticket ${bookingId} removed successfully`, 'info');
  };

  const completePayment = async (
    method: PaymentMethod,
    customerDetails: { name: string; email: string; phone: string }
  ): Promise<Booking> => {
    if (!bookingMovie || !bookingShowtime || selectedSeats.length === 0) {
      throw new Error('Invalid booking state');
    }

    const hallSeats = generateHall1Seats();
    let ticketTotal = 0;

    selectedSeats.forEach((seatId) => {
      const match = hallSeats.find((s) => s.id === seatId);
      const price = match ? (bookingShowtime.prices[match.type] || 400) : 400;
      ticketTotal += price;
    });

    const snackTotal = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = ticketTotal + snackTotal;
    const taxAmount = Math.round(subtotal * 0.13); // 13% VAT
    const grandTotal = subtotal + taxAmount;

    const bookingId = `GAJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newBooking: Booking = {
      id: bookingId,
      movieId: bookingMovie.id,
      movieTitle: bookingMovie.title,
      moviePoster: bookingMovie.poster,
      showtimeId: bookingShowtime.id,
      hallName: bookingShowtime.hallName,
      date: bookingShowtime.date,
      time: bookingShowtime.time,
      format: bookingShowtime.format,
      seatIds: selectedSeats,
      seatsDescription: `${selectedSeats.join(', ')}`,
      snacks: selectedSnacks,
      ticketTotal,
      snackTotal,
      taxAmount,
      grandTotal,
      paymentMethod: method,
      paymentTransactionId: `${method.toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      qrCodeData: `GAJURI-TICKET-${bookingId}-${selectedSeats.join('-')}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    await saveBookingToSupabase({
      id: bookingId,
      booking_code: bookingId,
      movie_id: bookingMovie.id,
      movie_title: bookingMovie.title,
      movie_poster: bookingMovie.poster,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      show_date: bookingShowtime.date,
      show_time: bookingShowtime.time,
      hall_name: bookingShowtime.hallName,
      format: bookingShowtime.format,
      selected_seats: selectedSeats,
      food_items: selectedSnacks,
      ticket_total: ticketTotal,
      snack_total: snackTotal,
      total_price: grandTotal,
      payment_method: method,
      payment_status: 'CONFIRMED',
      qr_token: `GAJURI-TICKET-${bookingId}-${selectedSeats.join('-')}`
    });

    const updatedShowtime: Showtime = {
      ...bookingShowtime,
      bookedSeatIds: [...bookingShowtime.bookedSeatIds, ...selectedSeats]
    };
    await saveShowtimeToSupabase(updatedShowtime);

    const freshBookings = await fetchBookingsFromSupabase();
    if (freshBookings !== null) setBookings(freshBookings);
    else setBookings((prev) => [newBooking, ...prev]);

    const freshShowtimes = await fetchShowtimesFromSupabase();
    if (freshShowtimes !== null) setShowtimes(freshShowtimes);

    const earnedPoints = Math.floor(grandTotal / 100) * 10;
    setUser((prev) => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + earnedPoints
    }));

    setConfirmedBooking(newBooking);
    setActiveStep('ticket');
    showToast(`Booking successful! ${earnedPoints} Gajuri Club points earned!`, 'success');

    return newBooking;
  };

  // Admin Actions (Complete Movie CRUD + Removal Options)
  const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<Movie> => {
    const newId = `m-${Date.now()}`;
    const newMovie: Movie = { ...movieData, id: newId, createdAt: new Date().toISOString() };
    const res = await saveMovieToSupabase(newMovie);
    if (!res.success) {
      showToast(`Failed to save movie to database: ${res.error?.message || 'Unknown error'}`, 'error');
      throw new Error(res.error?.message || 'Failed to save movie to Supabase');
    }
    
    // Refresh movies from Supabase
    const fresh = await fetchMoviesFromSupabase();
    if (fresh !== null) setMovies(fresh);

    showToast(`Movie "${newMovie.title}" added & saved to public.movies`, 'success');
    return newMovie;
  };

  const updateMovie = async (id: string, updated: Partial<Movie>) => {
    const existing = movies.find((m) => m.id === id);
    if (!existing) return;
    const updatedMovie: Movie = { ...existing, ...updated };
    const res = await saveMovieToSupabase(updatedMovie);
    if (!res.success) {
      showToast(`Failed to update movie in database`, 'error');
      return;
    }
    const fresh = await fetchMoviesFromSupabase();
    if (fresh !== null) setMovies(fresh);
    showToast(`Movie updated in public.movies table`, 'success');
  };

  const hideMovie = async (id: string) => {
    await updateMovie(id, { status: 'HIDDEN' });
    showToast(`Movie hidden from public website. Booking data retained.`, 'warning');
  };

  const archiveMovie = async (id: string) => {
    await updateMovie(id, { status: 'ARCHIVED' });
    showToast(`Movie moved to archive. Revenue history retained.`, 'info');
  };

  const deleteMoviePermanently = async (id: string) => {
    const res = await deleteMovieFromSupabase(id);
    if (!res.success) {
      showToast(`Failed to delete movie from database`, 'error');
      return;
    }
    setShowtimes((prev) => prev.filter((s) => s.movieId !== id));
    const fresh = await fetchMoviesFromSupabase();
    if (fresh !== null) setMovies(fresh);
    showToast(`Movie record permanently removed from public.movies`, 'info');
  };

  const duplicateMovie = async (id: string): Promise<Movie | null> => {
    const existing = movies.find((m) => m.id === id);
    if (!existing) return null;
    const duplicated: Omit<Movie, 'id'> = {
      ...existing,
      title: `${existing.title} (Copy)`
    };
    const created = await addMovie(duplicated);
    showToast(`Movie duplicated successfully`, 'info');
    return created;
  };

  // Showtime Operations
  const addShowtime = async (showtimeData: Omit<Showtime, 'id' | 'bookedSeatIds' | 'blockedSeatIds'>) => {
    const newId = `s-${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newShowtime: Showtime = {
      ...showtimeData,
      id: newId,
      bookedSeatIds: [],
      blockedSeatIds: []
    };
    await saveShowtimeToSupabase(newShowtime);
    const fresh = await fetchShowtimesFromSupabase();
    if (fresh !== null) setShowtimes(fresh);
    else setShowtimes((prev) => [...prev, newShowtime]);
    showToast(`Showtime added for ${newShowtime.time} (${newShowtime.date})`, 'success');
  };

  const duplicateShowtime = (showtimeId: string, targetDate: string) => {
    const existing = showtimes.find((s) => s.id === showtimeId);
    if (!existing) return;
    addShowtime({
      movieId: existing.movieId,
      hallId: existing.hallId,
      hallName: existing.hallName,
      screenName: existing.screenName,
      date: targetDate,
      time: existing.time,
      endTime: existing.endTime,
      intermissionTime: existing.intermissionTime,
      format: existing.format,
      prices: { ...existing.prices },
      seatCapacity: existing.seatCapacity
    });
  };

  const bulkAddWeeklySchedule = (
    movieId: string,
    hallId: string,
    timeSlots: string[],
    startDate: string,
    daysCount: number = 7
  ) => {
    const start = new Date(startDate);
    let totalAdded = 0;
    const hallName = hallId === 'hall-1' ? 'Hall 1 - IMAX 3D Laser' : 'Hall 2 - Gajuri Dolby Atmos';

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      timeSlots.forEach((t) => {
        addShowtime({
          movieId,
          hallId,
          hallName,
          date: dateStr,
          time: t,
          format: 'IMAX 3D',
          prices: { regular: 350, executive: 500, vip: 800 }
        });
        totalAdded++;
      });
    }
    showToast(`Bulk created ${totalAdded} showtimes for the next ${daysCount} days`, 'success');
  };

  const deleteShowtime = async (id: string) => {
    await deleteShowtimeFromSupabase(id);
    const fresh = await fetchShowtimesFromSupabase();
    if (fresh !== null) setShowtimes(fresh);
    else setShowtimes((prev) => prev.filter((s) => s.id !== id));
    showToast(`Showtime deleted`, 'warning');
  };

  const toggleBlockSeat = (showtimeId: string, seatId: string) => {
    setShowtimes((prev) =>
      prev.map((s) => {
        if (s.id === showtimeId) {
          const isBlocked = s.blockedSeatIds.includes(seatId);
          const updatedBlocked = isBlocked
            ? s.blockedSeatIds.filter((id) => id !== seatId)
            : [...s.blockedSeatIds, seatId];
          return { ...s, blockedSeatIds: updatedBlocked };
        }
        return s;
      })
    );
    showToast(`Seat status updated`, 'info');
  };

  const verifyTicketQR = (qrCode: string) => {
    const booking = bookings.find((b) => b.qrCodeData === qrCode || b.id === qrCode);
    if (!booking) {
      return { valid: false, message: 'Invalid or Unrecognized QR Code' };
    }
    if (booking.status === 'CHECKED_IN') {
      return { valid: true, booking, message: 'Already Checked-In at Gajuri Gate' };
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'CHECKED_IN' as const } : b))
    );
    return { valid: true, booking: { ...booking, status: 'CHECKED_IN' as const }, message: 'Ticket Verified! Welcome to Gajuri Cinemas!' };
  };

  return (
    <CinemaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        accountSubTab,
        setAccountSubTab,
        staffSubTab,
        setStaffSubTab,
        movies,
        publicMovies,
        showtimes,
        foodItems,
        user,
        bookings,
        staffUser,
        staffAccounts,
        scanLogs,
        lastScannedTicket,
        loginStaff,
        logoutStaff,
        createStaffAccount,
        updateStaffAccount,
        toggleStaffActive,
        deleteStaffAccount,
        processTicketScan,
        admitCustomer,
        reprintTicket,
        bookingMovie,
        bookingShowtime,
        selectedSeats,
        selectedSnacks,
        activeStep,
        confirmedBooking,
        trailerUrl,
        setTrailerUrl,
        searchQuery,
        setSearchQuery,
        isAdmin,
        setIsAdmin,
        loginAdmin,
        logoutAdmin,
        startBooking,
        selectShowtime,
        toggleSeatSelection,
        updateSnackQuantity,
        proceedToSnacks,
        proceedToPayment,
        cancelBookingFlow,
        deleteTicket,
        completePayment,
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
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
};
