import React, { useState, useRef, useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import {
  Film,
  Search,
  Ticket,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  Home,
  Clapperboard,
  Calendar,
  Bell,
  User,
  Sparkles,
  ChevronDown,
  Award,
  Crown,
  LogOut,
  History,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setAccountSubTab,
    searchQuery,
    setSearchQuery,
    isAdmin,
    setIsAdmin,
    logoutAdmin,
    staffUser,
    logoutStaff,
    user,
    bookings,
    cancelBookingFlow,
    showToast
  } = useCinema();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (
    tab: 'home' | 'movies' | 'showtimes' | 'account' | 'admin' | 'staff',
    subTab?: 'profile' | 'tickets' | 'notifications' | 'appearance' | 'security'
  ) => {
    cancelBookingFlow();
    if (subTab) setAccountSubTab(subTab);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    if (isAdmin) {
      logoutAdmin();
    }
    if (staffUser) {
      logoutStaff();
    }
    showToast('Logged out successfully.', 'info');
    handleNavigate('home');
  };

  // Determine active view mode label
  const isAdminView = activeTab === 'admin' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
  const isDashboardView = isAdminView || activeTab === 'staff';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050508]/90 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="w-full px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Brand Logo & Integrated Search Bar Pill */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            id="brand-logo"
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#0A0A0A] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center text-[#D4AF37]">
                <Film className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-[#D4AF37] to-amber-400 font-serif">
                  GAJURI
                </span>
                {activeTab === 'admin' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ADMIN
                  </span>
                )}
                {activeTab === 'staff' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    STAFF
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <MapPin className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>Gajuri, Dhading</span>
              </div>
            </div>
          </div>

          {/* Integrated Search Input Pill (Shown on public view or admin view) */}
          {!isDashboardView && (
            <div className="relative ml-1 sm:ml-2">
              <div className="flex items-center bg-[#12131A] hover:bg-[#1A1B26] border border-white/10 focus-within:border-[#D4AF37] rounded-full px-3 py-1.5 transition-all w-32 xs:w-40 sm:w-56 md:w-64 lg:w-72 shadow-inner">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search movies, showtimes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'movies') setActiveTab('movies');
                  }}
                  className="bg-transparent text-white focus:outline-none w-full text-xs font-sans placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    id="header-search-clear"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center Section: Navigation Links */}
        {/*
          IN ADMIN DASHBOARD: Remove Home, Movies, Showtimes, My Tickets! Show Admin Portal Title/Badge
          IN STAFF DASHBOARD: Remove Home, Movies, Showtimes, My Tickets! Show Staff Portal Title/Badge
          IN GENERAL CUSTOMER MODE: Show Home, Movies, Showtimes, My Tickets with Animated Underline (Admin & Staff links hidden!)
        */}
        {isAdminView ? (
          <div className="hidden md:flex items-center justify-center gap-2 flex-1 max-w-xl mx-auto">
            <div className="px-5 py-2 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase">Gajuri Admin Command Center</span>
            </div>
          </div>
        ) : activeTab === 'staff' ? (
          <div className="hidden md:flex items-center justify-center gap-2 flex-1 max-w-xl mx-auto">
            <div className="px-5 py-2 rounded-2xl bg-[#1A1B28] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-black tracking-wider uppercase">Staff Gate & Counter Portal</span>
            </div>
          </div>
        ) : (
          <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 flex-1 max-w-2xl mx-auto">
            {/* Nav: HOME */}
            <button
              id="nav-home"
              onClick={() => handleNavigate('home')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Home Page"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">Home</span>
              {activeTab === 'home' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-200 rounded-full shadow-[0_0_12px_#D4AF37]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Nav: MOVIES */}
            <button
              id="nav-movies"
              onClick={() => handleNavigate('movies')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer ${
                activeTab === 'movies'
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Now Showing Movies"
            >
              <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">Movies</span>
              {activeTab === 'movies' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-200 rounded-full shadow-[0_0_12px_#D4AF37]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Nav: SHOWTIMES */}
            <button
              id="nav-showtimes"
              onClick={() => handleNavigate('showtimes')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer ${
                activeTab === 'showtimes'
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Movie Showtimes & Schedule"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">Showtimes</span>
              {activeTab === 'showtimes' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-200 rounded-full shadow-[0_0_12px_#D4AF37]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Nav: MY TICKETS */}
            <button
              id="nav-account"
              onClick={() => handleNavigate('account', 'tickets')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer ${
                activeTab === 'account'
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="My E-Tickets & Booking History"
            >
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">My Tickets</span>
              {confirmedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-black font-black text-[10px] shadow-[0_0_10px_#D4AF37]">
                  {confirmedCount}
                </span>
              )}
              {activeTab === 'account' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-200 rounded-full shadow-[0_0_12px_#D4AF37]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </nav>
        )}

        {/* Right Section: Quick Action Icons & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Ticket Notification Bell Icon */}
          <button
            id="header-notification-bell"
            onClick={() => handleNavigate('account', 'tickets')}
            className="relative p-2.5 rounded-full bg-[#12131A] hover:bg-[#1A1B26] border border-white/10 text-slate-300 hover:text-[#D4AF37] transition-all cursor-pointer"
            title="Active E-Ticket Bookings"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {confirmedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse border-2 border-[#050508]">
                {confirmedCount}
              </span>
            )}
          </button>

          {/* User CTA & Interactive Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            
            {/*
              CTA Button naming requirement:
              - In Admin dashboard: CTA element renamed with "Admin"
              - In Staff dashboard: CTA element renamed with "Staff"
              - In Customer view: CTA element with "Customer" / User Avatar
            */}
            <button
              id="user-profile-dropdown-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 ${
                isAdminView
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 hover:border-amber-400'
                  : activeTab === 'staff'
                  ? 'bg-[#1A1B28] border-[#D4AF37]/70 text-[#D4AF37] hover:border-[#D4AF37]'
                  : 'bg-[#12131A] border-[#D4AF37]/40 hover:border-[#D4AF37] text-slate-200'
              }`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-black p-0.5 overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-black" />
                )}
              </div>

              {/* Renamed Badge Label based on Dashboard Context */}
              <span className="text-xs font-extrabold tracking-wide uppercase">
                {isAdminView
                  ? 'Admin'
                  : activeTab === 'staff'
                  ? 'Staff'
                  : 'Customer'}
              </span>

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-[#D4AF37]' : 'text-slate-400'}`} />
            </button>

            {/* Interactive Profile Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-72 sm:w-80 rounded-3xl bg-[#090A0E]/95 backdrop-blur-2xl border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 text-slate-100 z-50 divide-y divide-white/10"
                >
                  {/* 1. User Information Header */}
                  <div className="pb-3.5 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#D4AF37] shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold font-serif text-white truncate">
                            {user.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            activeTab === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : activeTab === 'staff'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                          }`}>
                            {activeTab === 'admin' ? 'ADMIN' : activeTab === 'staff' ? 'STAFF' : 'CUSTOMER'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Customer Account Menu Items */}
                  <div className="py-2 space-y-1 text-xs font-semibold">
                    
                    {/* My Bookings & History */}
                    <button
                      id="dropdown-menu-tickets"
                      onClick={() => handleNavigate('account', 'tickets')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Ticket className="w-4 h-4 text-[#D4AF37]" />
                        <span>My Bookings & Tickets</span>
                      </div>
                      {confirmedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[10px]">
                          {confirmedCount}
                        </span>
                      )}
                    </button>

                    {/* Profile & Account */}
                    <button
                      id="dropdown-menu-profile"
                      onClick={() => handleNavigate('account', 'profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#D4AF37]" />
                      <span>Profile & Account</span>
                    </button>

                    {/* Rewards & Points */}
                    <button
                      id="dropdown-menu-rewards"
                      onClick={() => handleNavigate('account', 'profile')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        <span>Rewards & Loyalty</span>
                      </div>
                      <span className="font-mono font-extrabold text-amber-300 text-[11px]">
                        {user.loyaltyPoints} PTS
                      </span>
                    </button>

                    {/* Membership Pass */}
                    <button
                      id="dropdown-menu-pass"
                      onClick={() => handleNavigate('account', 'profile')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                        <span>Gajuri VIP Pass</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {user.memberTier}
                      </span>
                    </button>
                  </div>

                  {/* 3. Logout Action */}
                  <div className="pt-2">
                    <button
                      id="dropdown-menu-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-[#12131A] border border-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050508] border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 flex flex-col gap-2 shadow-2xl overflow-hidden"
          >
            {/* Standard Links shown in Customer view on mobile */}
            {!isDashboardView && (
              <>
                <button
                  id="mobile-nav-home"
                  onClick={() => handleNavigate('home')}
                  className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center justify-between cursor-pointer ${
                    activeTab === 'home' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#D4AF37]" />
                    <span>Home</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>

                <button
                  id="mobile-nav-movies"
                  onClick={() => handleNavigate('movies')}
                  className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center gap-2 cursor-pointer ${
                    activeTab === 'movies' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold' : 'text-slate-300'
                  }`}
                >
                  <Clapperboard className="w-4 h-4 text-[#D4AF37]" />
                  <span>Now Showing Movies</span>
                </button>

                <button
                  id="mobile-nav-showtimes"
                  onClick={() => handleNavigate('showtimes')}
                  className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center gap-2 cursor-pointer ${
                    activeTab === 'showtimes' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold' : 'text-slate-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>Showtimes & Schedule</span>
                </button>

                <button
                  id="mobile-nav-account"
                  onClick={() => handleNavigate('account', 'tickets')}
                  className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center justify-between cursor-pointer ${
                    activeTab === 'account' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#D4AF37]" />
                    <span>My E-Tickets & History</span>
                  </div>
                  {confirmedCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[10px] flex items-center justify-center">
                      {confirmedCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* In Admin or Staff View, mobile drawer options */}
            {activeTab === 'admin' && (
              <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-amber-300 text-xs font-bold space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Mode Active</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  You are viewing the Gajuri Cinema Admin Command Center.
                </p>
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full py-2 bg-amber-500 text-black rounded-xl text-xs font-black cursor-pointer"
                >
                  Return to Customer View
                </button>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="p-3 bg-[#1A1B28] rounded-2xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Staff Portal Active</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  Staff QR Gate Scanner & Counter Booking active.
                </p>
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full py-2 bg-[#D4AF37] text-black rounded-xl text-xs font-black cursor-pointer"
                >
                  Return to Customer View
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
