import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Film, Search, Ticket, ShieldAlert, Menu, X, MapPin, Home, Clapperboard, Calendar, Bell, User, Sparkles, Sliders } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, isAdmin, setIsAdmin, bookings, cancelBookingFlow } = useCinema();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  const handleNavigate = (tab: 'home' | 'movies' | 'showtimes' | 'account' | 'admin' | 'staff') => {
    cancelBookingFlow();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

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
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <MapPin className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>Gajuri, Dhading</span>
              </div>
            </div>
          </div>

          {/* Integrated Search Input Pill */}
          <div className="relative ml-1 sm:ml-2">
            <div className="flex items-center bg-[#12131A] hover:bg-[#1A1B26] border border-white/10 focus-within:border-[#D4AF37] rounded-full px-3 py-1.5 transition-all w-36 sm:w-56 md:w-64 lg:w-72 shadow-inner">
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
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Full-Width Nav Tabs */}
        <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 flex-1 max-w-2xl mx-auto">
          <button
            id="nav-home"
            onClick={() => handleNavigate('home')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'home'
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Home"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden lg:inline">Home</span>
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
          </button>

          <button
            id="nav-movies"
            onClick={() => handleNavigate('movies')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'movies'
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Now Showing"
          >
            <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden lg:inline">Movies</span>
            {activeTab === 'movies' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
          </button>

          <button
            id="nav-showtimes"
            onClick={() => handleNavigate('showtimes')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'showtimes'
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Showtimes & Calendar"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden lg:inline">Showtimes</span>
            {activeTab === 'showtimes' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
          </button>

          <button
            id="nav-account"
            onClick={() => handleNavigate('account')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'account'
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="My E-Tickets"
          >
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            <span className="hidden lg:inline">My Tickets</span>
            {confirmedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-black font-black text-[10px] shadow-[0_0_10px_#D4AF37]">
                {confirmedCount}
              </span>
            )}
            {activeTab === 'account' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
          </button>

          <button
            id="nav-admin"
            onClick={() => handleNavigate('admin')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'admin'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
            }`}
            title="Admin Management"
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="hidden lg:inline">Admin</span>
            {activeTab === 'admin' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
            )}
          </button>

          <button
            id="nav-staff"
            onClick={() => handleNavigate('staff')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
              activeTab === 'staff'
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
            }`}
            title="Staff Gate Scanner & Portal"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            <span className="hidden lg:inline">Staff</span>
            {activeTab === 'staff' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
          </button>
        </nav>

        {/* Right Section: Quick Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* User Mode Display Box */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#12131A] border border-white/10 rounded-full p-1">
            <button
              id="user-mode-badge"
              onClick={() => handleNavigate('account')}
              className="text-[10px] font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 bg-[#D4AF37] text-black shadow-[0_0_12px_rgba(212,175,55,0.6)] cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>USER</span>
            </button>
          </div>

          {/* Ticket Notification Bell Icon */}
          <button
            id="header-notification-bell"
            onClick={() => handleNavigate('account')}
            className="relative p-2.5 rounded-full bg-[#12131A] hover:bg-[#1A1B26] border border-white/10 text-slate-300 hover:text-[#D4AF37] transition-all"
            title="Active Bookings"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {confirmedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse border-2 border-[#050508]">
                {confirmedCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            id="user-avatar-btn"
            onClick={() => handleNavigate('account')}
            className="p-0.5 rounded-full border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            title="User Profile & Tickets"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-950 via-[#1A1B26] to-black flex items-center justify-center text-[#D4AF37] font-bold text-xs sm:text-sm overflow-hidden">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            </div>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-[#12131A] border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050508] border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 flex flex-col gap-2.5 animate-fade-in shadow-2xl">
          <button
            id="mobile-nav-home"
            onClick={() => handleNavigate('home')}
            className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center justify-between ${
              activeTab === 'home' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-slate-300'
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
            className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center gap-2 ${
              activeTab === 'movies' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-slate-300'
            }`}
          >
            <Clapperboard className="w-4 h-4 text-[#D4AF37]" />
            <span>Now Showing Movies</span>
          </button>

          <button
            id="mobile-nav-showtimes"
            onClick={() => handleNavigate('showtimes')}
            className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center gap-2 ${
              activeTab === 'showtimes' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Showtimes & Schedule</span>
          </button>

          <button
            id="mobile-nav-account"
            onClick={() => handleNavigate('account')}
            className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center justify-between ${
              activeTab === 'account' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span>My E-Tickets</span>
            </div>
            {confirmedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[10px] flex items-center justify-center">
                {confirmedCount}
              </span>
            )}
          </button>

          <button
            id="mobile-nav-admin"
            onClick={() => handleNavigate('admin')}
            className={`py-3 px-4 rounded-xl text-left font-semibold text-xs flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Admin Control Panel</span>
          </button>
        </div>
      )}
    </header>
  );
};
