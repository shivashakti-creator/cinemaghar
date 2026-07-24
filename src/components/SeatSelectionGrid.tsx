import React, { useState, useEffect, useRef } from 'react';
import { useCinema } from '../context/CinemaContext';
import { generateHall1Seats } from '../data/mockData';
import { supabase } from '../lib/supabase';
import {
  Armchair,
  Sparkles,
  ArrowRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Map,
  Clock,
  Lock,
  ChevronUp,
  ChevronDown,
  Popcorn,
  Receipt,
  Eye,
  Info,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SeatSelectionGrid: React.FC = () => {
  const {
    bookingMovie,
    bookingShowtime,
    selectedSeats,
    selectedSnacks,
    toggleSeatSelection,
    proceedToSnacks,
    cancelBookingFlow,
    showToast
  } = useCinema();

  // Zoom & Pan State
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState<boolean>(false);

  // Countdown Timer State (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Realtime Live Remote Locked Seats
  const [remoteLockedSeats, setRemoteLockedSeats] = useState<string[]>([]);

  const seats = generateHall1Seats();
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Start / manage 5:00 countdown timer when seats are selected
  useEffect(() => {
    if (selectedSeats.length > 0) {
      if (!timerActive) {
        setTimerActive(true);
        setTimeLeft(300); // 5 minutes lock
      }
    } else {
      setTimerActive(false);
      setTimeLeft(300);
    }
  }, [selectedSeats.length]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      showToast('Your seat reservation has expired (5:00 limit). Please select seats again.', 'warning');
      cancelBookingFlow();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Supabase Realtime Listener for Live Seat Locks across clients
  useEffect(() => {
    if (!bookingShowtime?.id) return;

    const channelName = `showtime-seats-${bookingShowtime.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'seat-lock' }, (payload) => {
        if (payload.payload?.seatId) {
          setRemoteLockedSeats((prev) => Array.from(new Set([...prev, payload.payload.seatId])));
        }
      })
      .on('broadcast', { event: 'seat-unlock' }, (payload) => {
        if (payload.payload?.seatId) {
          setRemoteLockedSeats((prev) => prev.filter((id) => id !== payload.payload.seatId));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingShowtime?.id]);

  if (!bookingMovie || !bookingShowtime) return null;

  // Pricing calculations
  let ticketSubtotal = 0;
  selectedSeats.forEach((seatId) => {
    const match = seats.find((s) => s.id === seatId);
    if (match) {
      ticketSubtotal += bookingShowtime.prices[match.type] || match.price || 350;
    }
  });

  const snackSubtotal = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalBeforeTax = ticketSubtotal + snackSubtotal;
  const taxAmount = Math.round(subtotalBeforeTax * 0.13); // 13% VAT
  const discountAmount = 0;
  const grandTotal = subtotalBeforeTax + taxAmount - discountAmount;

  const handleSeatClick = (seatId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }

    const isCurrentlySelected = selectedSeats.includes(seatId);
    toggleSeatSelection(seatId);

    // Broadcast realtime event
    if (bookingShowtime?.id) {
      const channel = supabase.channel(`showtime-seats-${bookingShowtime.id}`);
      channel.send({
        type: 'broadcast',
        event: isCurrentlySelected ? 'seat-unlock' : 'seat-lock',
        payload: { seatId }
      });
    }
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.75));
  const handleZoomReset = () => setZoomScale(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-6xl mx-auto rounded-3xl my-4 sm:my-6 overflow-hidden shadow-[0_0_90px_rgba(212,175,55,0.25)] border border-[#D4AF37]/40 bg-[#090A0E] text-white"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#090A0E] to-[#090A0E] pointer-events-none" />

      {/* Main Seat Selection Area */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Top Header Bar with Live Reservation Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                {bookingShowtime.format || 'IMAX 3D'}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-300 text-xs font-medium">{bookingShowtime.hallName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight mt-1">
              {bookingMovie.title}
            </h2>
            <p className="text-xs text-amber-200/90 mt-0.5 font-medium flex items-center gap-2">
              <span>{bookingShowtime.date}</span>
              <span>at</span>
              <span className="font-bold text-[#D4AF37]">{bookingShowtime.time}</span>
            </p>
          </div>

          {/* Right Controls: Reservation Timer & Change Showtime */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedSeats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-4 py-2 rounded-2xl flex items-center gap-2.5 border shadow-lg ${
                  timeLeft < 60
                    ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
                    : 'bg-[#1A1B28] border-[#D4AF37]/50 text-[#D4AF37]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#D4AF37] animate-spin-slow" />
                <div className="text-xs">
                  <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider leading-none">
                    Reserved for
                  </span>
                  <span className="font-mono font-black text-sm text-[#D4AF37]">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </motion.div>
            )}

            <button
              id="cancel-seat-selection-btn"
              onClick={cancelBookingFlow}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Change Showtime</span>
            </button>
          </div>
        </div>

        {/* Viewport Control Bar (Zoom + / Zoom - / Mini Map Toggle) */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#12131C] rounded-2xl border border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">
              Realtime Seat Lock Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-[#D4AF37] px-1">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              title="Reset Zoom"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showMiniMap
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/15'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mini Map</span>
            </button>
          </div>
        </div>

        {/* 3D Curved Screen & Ray Reflection Area */}
        <div className="relative pt-2 pb-6 text-center overflow-hidden">
          {/* Top Projection Beam Light Arc */}
          <div className="w-3/4 max-w-xl mx-auto h-2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-[0_0_35px_rgba(212,175,55,1)] opacity-90 animate-pulse" />
          <div className="w-2/3 max-w-lg mx-auto h-12 bg-gradient-to-b from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent blur-xl pointer-events-none -mt-1" />

          {/* Curved Metallic 3D Screen Surface */}
          <div className="relative max-w-lg mx-auto py-2.5 px-6 rounded-2xl bg-gradient-to-b from-[#1E202E] to-[#12131C] border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transform -perspective-500 rotateX-12">
            <p className="text-[10px] sm:text-[12px] font-black tracking-[0.3em] text-[#D4AF37] uppercase drop-shadow-[0_2px_8px_rgba(212,175,55,0.8)]">
              ★ CURVED IMAX 3D SCREEN ★
            </p>
          </div>
          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">
            All Eyes This Way
          </p>
        </div>

        {/* Interactive Canvas Viewport (Supports Drag & Zoom) */}
        <div className="relative overflow-auto max-h-[520px] min-h-[380px] p-4 bg-[#0F1018]/90 rounded-2xl border border-white/10 custom-scrollbar flex items-center justify-center">
          <motion.div
            style={{ scale: zoomScale }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="inline-block transition-transform duration-200 origin-center py-2 px-4"
          >
            {/* Large Column Labels Row at Top */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-3 pl-8 pr-12">
              <div className="w-8" />
              {columns.map((col) => (
                <div
                  key={col}
                  className="w-7 sm:w-8 text-center font-mono font-bold text-[11px] text-amber-300/80"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* 3D Seating Matrix Rows */}
            <div className="space-y-3.5">
              {rows.map((row, rowIdx) => {
                const rowSeats = seats.filter((s) => s.row === row);
                const price = 350;

                return (
                  <div key={row} className="flex items-center justify-center gap-2 sm:gap-2.5">
                    
                    {/* Large Row Label Left */}
                    <div className="w-8 text-right font-black text-sm text-[#D4AF37] font-mono tracking-wider drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                      {row}
                    </div>

                    {/* Seats Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {rowSeats.map((seat, seatIdx) => {
                        const isBooked = bookingShowtime.bookedSeatIds.includes(seat.id);
                        const isBlocked = bookingShowtime.blockedSeatIds.includes(seat.id);
                        const isRemoteLocked = remoteLockedSeats.includes(seat.id);
                        const isSelected = selectedSeats.includes(seat.id);

                        const isDisabled = isBooked || isBlocked || isRemoteLocked;

                        return (
                          <motion.button
                            key={seat.id}
                            id={`seat-btn-${seat.id}`}
                            disabled={isDisabled}
                            onClick={() => handleSeatClick(seat.id)}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: isSelected ? 1.18 : 1 }}
                            transition={{
                              delay: rowIdx * 0.03 + seatIdx * 0.01,
                              type: 'spring',
                              stiffness: 400,
                              damping: 22
                            }}
                            whileHover={
                              !isDisabled
                                ? { scale: isSelected ? 1.22 : 1.14, y: -4 }
                                : {}
                            }
                            whileTap={!isDisabled ? { scale: 0.92 } : {}}
                            title={
                              isBooked
                                ? `Seat ${seat.id} (Booked)`
                                : isRemoteLocked
                                ? `Seat ${seat.id} (Reserved by another user)`
                                : `Seat ${seat.id} - NPR ${price}`
                            }
                            className={`relative w-7 h-8 sm:w-8 sm:h-9.5 rounded-t-xl flex flex-col items-center justify-center text-[10px] font-black cursor-pointer transition-all ${
                              isBooked
                                ? 'bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed opacity-40 shadow-none'
                                : isRemoteLocked
                                ? 'bg-amber-950/80 text-amber-300/60 border border-amber-600/50 cursor-not-allowed shadow-none'
                                : isSelected
                                ? 'bg-gradient-to-t from-[#D4AF37] via-amber-300 to-yellow-100 text-black border-2 border-white shadow-[0_0_25px_rgba(212,175,55,1)] z-20 font-black'
                                : 'bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 hover:from-[#D4AF37]/40 hover:to-amber-300/50 text-slate-200 hover:text-white border border-slate-600/80 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
                            }`}
                          >
                            {/* 3D Armrest / Headrest Accents */}
                            <div
                              className={`absolute top-0 inset-x-1 h-1 rounded-t-sm ${
                                isSelected ? 'bg-white/80' : 'bg-white/10'
                              }`}
                            />

                            <span className="leading-none mt-1 font-mono">{seat.number}</span>

                            {/* Status Icons or Rings */}
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0.6, opacity: 1 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.3 }}
                                className="absolute inset-0 rounded-t-xl border-2 border-[#D4AF37] pointer-events-none"
                              />
                            )}

                            {isRemoteLocked && (
                              <Lock className="w-3 h-3 text-amber-400 absolute inset-0 m-auto" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Large Row Label Right */}
                    <div className="w-8 text-left font-black text-sm text-[#D4AF37] font-mono tracking-wider drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] pl-1">
                      {row}
                    </div>

                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Seat Legend Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-4 bg-[#12131C] rounded-2xl border border-white/10 text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-gradient-to-t from-slate-900 to-slate-700 border border-slate-500 flex items-center justify-center">
              <Armchair className="w-3 h-3 text-slate-300" />
            </div>
            <span>Available (NPR 350)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-gradient-to-t from-[#D4AF37] to-amber-300 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(212,175,55,0.8)]">
              <Sparkles className="w-3 h-3 text-black fill-black" />
            </div>
            <span className="text-[#D4AF37] font-bold">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-amber-950/80 border border-amber-500 flex items-center justify-center text-amber-400">
              <Lock className="w-3 h-3" />
            </div>
            <span className="text-amber-300 font-medium">Reserved / Live Lock</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-slate-950 opacity-40 border border-slate-900 flex items-center justify-center text-slate-700">
              <X className="w-3 h-3" />
            </div>
            <span className="text-slate-500">Booked</span>
          </div>
        </div>

      </div>

      {/* Mini Map Widget Overlay */}
      <AnimatePresence>
        {showMiniMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            className="absolute top-20 right-6 z-30 hidden lg:block p-3 rounded-2xl bg-[#090A0E]/95 backdrop-blur-xl border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] w-44"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] font-bold text-[#D4AF37]">
              <span>HALL MINI MAP</span>
              <button
                onClick={() => setShowMiniMap(false)}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Screen Line Mini */}
            <div className="w-full h-1 bg-[#D4AF37] rounded-full mb-2 opacity-80" />

            {/* Micro seat grid */}
            <div className="space-y-1">
              {rows.map((r) => (
                <div key={r} className="flex items-center justify-center gap-0.5">
                  {columns.map((c) => {
                    const seatId = `${r}${c}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const isBooked = bookingShowtime.bookedSeatIds.includes(seatId);
                    const isRemote = remoteLockedSeats.includes(seatId);

                    return (
                      <div
                        key={c}
                        className={`w-2 h-2 rounded-[1px] ${
                          isSelected
                            ? 'bg-[#D4AF37] shadow-[0_0_4px_rgba(212,175,55,1)]'
                            : isBooked
                            ? 'bg-slate-800'
                            : isRemote
                            ? 'bg-amber-500'
                            : 'bg-slate-600/60'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating / Docked Booking Summary Bar with Expandable Drawer */}
      <div className="relative z-20 border-t border-[#D4AF37]/30 bg-gradient-to-r from-[#12131C] via-[#090A0E] to-[#12131C] p-4 sm:p-6 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        
        {/* Toggle Drawer Button for Detailed Itemized Summary */}
        <div className="flex justify-center -mt-8 mb-2">
          <button
            onClick={() => setShowSummaryDrawer(!showSummaryDrawer)}
            className="px-4 py-1 rounded-full bg-[#1A1B28] text-amber-200 text-xs font-bold border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-lg hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{showSummaryDrawer ? 'Hide Price Breakdown' : 'View Price Breakdown'}</span>
            {showSummaryDrawer ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Expandable Itemized Price Drawer */}
        <AnimatePresence>
          {showSummaryDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pb-4 border-b border-white/10 mb-4 text-xs space-y-2 text-slate-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1A1B28] p-4 rounded-xl border border-white/10">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Movie:</span>
                    <span className="font-bold text-white">{bookingMovie.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Showtime:</span>
                    <span className="text-amber-200">{bookingShowtime.date} @ {bookingShowtime.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Seats:</span>
                    <span className="font-mono font-bold text-[#D4AF37]">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="flex justify-between">
                    <span>Ticket Subtotal ({selectedSeats.length} Seats):</span>
                    <span className="font-mono text-white">NPR {ticketSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food & Snacks:</span>
                    <span className="font-mono text-white">NPR {snackSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (13% VAT Included):</span>
                    <span className="font-mono">NPR {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Promo Discount:</span>
                    <span className="font-mono">NPR {discountAmount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bar Summary & Main Checkout CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={bookingMovie.poster}
              alt={bookingMovie.title}
              className="w-12 h-16 object-cover rounded-lg border border-[#D4AF37]/40 shadow-md hidden xs:block"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Selected Seats:</span>
                <span className="text-sm font-extrabold text-[#D4AF37]">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-serif text-white mt-0.5 flex items-baseline gap-2">
                <span>NPR {grandTotal.toLocaleString()}</span>
                <span className="text-xs font-medium text-slate-400">
                  (Includes {selectedSeats.length} seats + Tax)
                </span>
              </div>
            </div>
          </div>

          <button
            id="proceed-to-snacks-btn"
            disabled={selectedSeats.length === 0}
            onClick={proceedToSnacks}
            className={`px-8 py-4 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${
              selectedSeats.length > 0
                ? 'bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#997A15] hover:from-amber-300 hover:to-amber-500 text-black shadow-[0_0_30px_rgba(212,175,55,0.7)] cursor-pointer transform hover:scale-102 active:scale-98'
                : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            <span>PROCEED TO SNACKS & PAYMENT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
