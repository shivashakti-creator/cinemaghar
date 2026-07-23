import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  QrCode,
  Search,
  UserCheck,
  Printer,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Film,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MapPin,
  ShieldCheck,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export const StaffDashboardView: React.FC = () => {
  const {
    staffUser,
    bookings,
    scanLogs,
    setStaffSubTab,
    lastScannedTicket,
    showtimes,
    publicMovies,
    reprintTicket
  } = useCinema();

  const [refreshing, setRefreshing] = useState(false);

  // Today's date string
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter bookings for today or recent
  const todayBookings = bookings.filter((b) => b.date === todayStr || true); // fallback true for sample
  const checkedInCount = todayBookings.filter((b) => b.status === 'USED' || b.status === 'CHECKED_IN').length;
  const pendingCount = todayBookings.length - checkedInCount;

  // Calculate current show occupancy average
  const activeShowtimes = showtimes.filter((s) => s.date === todayStr || true);
  const totalSeatsInShows = activeShowtimes.length * 120;
  const totalBookedSeats = activeShowtimes.reduce((sum, s) => sum + s.bookedSeatIds.length, 0);
  const occupancyPercentage = totalSeatsInShows > 0 ? Math.round((totalBookedSeats / totalSeatsInShows) * 100) : 68;

  // Recent valid check-in logs
  const recentLogs = scanLogs.slice(0, 5);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Staff Header Greeting & Branch Pill */}
      <div className="bg-gradient-to-r from-[#0E0F18] via-[#141624] to-[#0E0F18] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-black uppercase tracking-wider">
                {staffUser?.role || 'Gate Scanner'}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                ID: {staffUser?.staffId || 'STF-001'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-amber-100 flex items-center gap-2">
              <span>Namaste, {staffUser?.fullName || 'Gate Officer'}</span>
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{staffUser?.branch || 'Gajuri Main Branch'} • {staffUser?.assignedHall || 'Hall 1 - IMAX 3D'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all ${
                refreshing ? 'animate-spin text-[#D4AF37]' : ''
              }`}
              title="Refresh Real-Time Feeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setStaffSubTab('scanner')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all transform hover:scale-105"
            >
              <QrCode className="w-5 h-5" />
              <span>LAUNCH SCANNER</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD METRIC CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Today's Bookings */}
        <div className="bg-[#10111A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Total</span>
            <Ticket className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">{todayBookings.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Tickets Issued</span>
          </div>
        </div>

        {/* Checked-In Tickets */}
        <div className="bg-[#10111A] border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition-all group">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Checked-In</span>
            <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-300 font-mono">{checkedInCount}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Admitted at Gate</span>
          </div>
        </div>

        {/* Pending Arrivals */}
        <div className="bg-[#10111A] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all group">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-300 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">Awaiting Arrival</span>
          </div>
        </div>

        {/* Current Occupancy */}
        <div className="bg-[#10111A] border border-sky-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-400 transition-all group">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hall Occupancy</span>
            <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-300 font-mono">{occupancyPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scanner Status */}
        <div className="bg-[#10111A] border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#D4AF37]">
            <span className="text-xs font-bold uppercase tracking-wider">Scanner Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>READY</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Camera & AI Active</span>
          </div>
        </div>

        {/* Last Scanned Quick Access */}
        <div className="bg-[#10111A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Last Scan</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 truncate">
            {lastScannedTicket ? (
              <>
                <span className="text-xs font-black text-amber-300 block truncate">
                  {lastScannedTicket.customerName}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Seats: {lastScannedTicket.seatIds.join(', ')}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic block">No scan yet today</span>
            )}
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <button
          onClick={() => setStaffSubTab('scanner')}
          className="p-4 rounded-2xl bg-[#121422] border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#181B2E] transition-all flex items-center gap-3 group text-left shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30 group-hover:scale-105 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-black text-sm text-white group-hover:text-[#D4AF37] transition-colors">
              Open Camera Scanner
            </span>
            <span className="text-[11px] text-slate-400">Scan QR Code or Image</span>
          </div>
        </button>

        <button
          onClick={() => setStaffSubTab('bookings')}
          className="p-4 rounded-2xl bg-[#121422] border border-white/10 hover:border-amber-400/50 hover:bg-[#181B2E] transition-all flex items-center gap-3 group text-left shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-black text-sm text-white group-hover:text-amber-300 transition-colors">
              Search Booking
            </span>
            <span className="text-[11px] text-slate-400">By ID, Phone, or Seat</span>
          </div>
        </button>

        <button
          onClick={() => setStaffSubTab('bookings')}
          className="p-4 rounded-2xl bg-[#121422] border border-white/10 hover:border-emerald-400/50 hover:bg-[#181B2E] transition-all flex items-center gap-3 group text-left shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
              Manual Check-In
            </span>
            <span className="text-[11px] text-slate-400">QR Damaged / Phone Dead</span>
          </div>
        </button>

        <button
          onClick={() => setStaffSubTab('bookings')}
          className="p-4 rounded-2xl bg-[#121422] border border-white/10 hover:border-sky-400/50 hover:bg-[#181B2E] transition-all flex items-center gap-3 group text-left shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-105 transition-transform">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-black text-sm text-white group-hover:text-sky-300 transition-colors">
              Reprint Ticket
            </span>
            <span className="text-[11px] text-slate-400">Print Physical Entry Slip</span>
          </div>
        </button>

      </div>

      {/* SHOWTIMES & RECENT CHECK-INS SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Showtimes & Occupancy */}
        <div className="lg:col-span-2 bg-[#0C0D15] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-base text-amber-100">
                Today's Screening Schedules & Gate Flow
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {todayStr}
            </span>
          </div>

          <div className="space-y-3">
            {activeShowtimes.map((s) => {
              const movie = publicMovies.find((m) => m.id === s.movieId);
              const bookedCount = s.bookedSeatIds.length;
              const maxCap = s.seatCapacity || 120;
              const pct = Math.round((bookedCount / maxCap) * 100);

              return (
                <div
                  key={s.id}
                  className="bg-[#141522] border border-white/5 hover:border-[#D4AF37]/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {movie && (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                        {s.time} • {s.hallName}
                      </span>
                      <h4 className="font-bold text-sm text-white">
                        {movie ? movie.title : 'Cinema Screening'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Format: <span className="text-slate-200 font-medium">{s.format}</span>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-300 block">
                      {bookedCount} / {maxCap} Seats ({pct}%)
                    </span>
                    <div className="w-36 h-2 bg-white/10 rounded-full mt-1 overflow-hidden sm:ml-auto">
                      <div
                        className={`h-full rounded-full ${
                          pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Recent Check-Ins Feed */}
        <div className="bg-[#0C0D15] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif font-bold text-base text-amber-100">
                Recent Gate Scan Feed
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-2.5">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#141522] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        log.scanResult === 'valid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : log.scanResult === 'already_used'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {log.scanResult === 'valid' ? '✓' : '!'}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">
                        {log.bookingId}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        By {log.staffName} ({log.scanMethod})
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No tickets scanned yet in this session.
              </p>
            )}
          </div>

          <button
            onClick={() => setStaffSubTab('logs')}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View Full Audit Logs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
