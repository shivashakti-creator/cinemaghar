import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { generateHall1Seats } from '../data/mockData';
import { Armchair, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SeatSelectionGrid: React.FC = () => {
  const {
    bookingMovie,
    bookingShowtime,
    selectedSeats,
    toggleSeatSelection,
    proceedToSnacks,
    cancelBookingFlow
  } = useCinema();

  if (!bookingMovie || !bookingShowtime) return null;

  const seats = generateHall1Seats();
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Calculate live price
  let subtotal = 0;
  selectedSeats.forEach((seatId) => {
    const match = seats.find((s) => s.id === seatId);
    if (match) {
      subtotal += bookingShowtime.prices[match.type] || match.price;
    }
  });

  const handleSeatClick = (seatId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }
    toggleSeatSelection(seatId);
  };

  // Extract video ID for background blurred trailer
  let videoId = '';
  if (bookingMovie.youtubeTrailerUrl) {
    if (bookingMovie.youtubeTrailerUrl.includes('watch?v=')) {
      videoId = bookingMovie.youtubeTrailerUrl.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (bookingMovie.youtubeTrailerUrl.includes('embed/')) {
      videoId = bookingMovie.youtubeTrailerUrl.split('embed/')[1]?.split('?')[0] || '';
    } else if (bookingMovie.youtubeTrailerUrl.includes('youtu.be/')) {
      videoId = bookingMovie.youtubeTrailerUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-5xl mx-auto rounded-3xl my-6 overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.3)] border border-[#D4AF37]/50"
    >
      
      {/* Background Blurred Movie Trailer */}
      {videoId && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&disablekb=1&modestbranding=1&enablejsapi=1`}
            className="w-[200%] h-[200%] absolute -top-[50%] -left-[50%] object-cover blur-2xl opacity-45 scale-125 pointer-events-none"
            allow="autoplay; encrypted-media"
            title={`${bookingMovie.title} Background Trailer`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090A0E]/90 via-[#090A0E]/80 to-[#090A0E]/95" />
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 p-4 sm:p-8 bg-[#090A0E]/85 backdrop-blur-xl">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
              {bookingMovie.title}
            </h2>
            <p className="text-xs text-amber-200 mt-0.5 font-medium">
              {bookingShowtime.date} at <span className="font-extrabold text-[#D4AF37]">{bookingShowtime.time}</span>
            </p>
          </div>

          <button
            id="cancel-seat-selection-btn"
            onClick={cancelBookingFlow}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Change Showtime</span>
          </button>
        </div>

        {/* Screen Area */}
        <div className="my-8 text-center relative">
          {/* Screen Curved Line */}
          <div className="w-3/4 mx-auto h-3.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-[0_0_30px_rgba(212,175,55,1)] opacity-95 animate-pulse" />
          <p className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-[#D4AF37] uppercase mt-2.5">
            CURVED IMAX 3D SCREEN THIS WAY
          </p>
          <div className="w-2/3 mx-auto h-14 bg-gradient-to-b from-[#D4AF37]/25 to-transparent blur-xl pointer-events-none -mt-2" />
        </div>

        {/* Seat Map Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 mb-8 bg-[#12131C]/90 rounded-2xl border border-white/10 text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-slate-800 border border-slate-600 flex items-center justify-center">
              <Armchair className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span>Available (NPR 350)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)] flex items-center justify-center text-black font-bold">
              <Armchair className="w-3.5 h-3.5 fill-black" />
            </div>
            <span className="text-[#D4AF37] font-bold">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-slate-900/60 opacity-50 border border-rose-950 flex items-center justify-center text-rose-500">
              <X className="w-3 h-3" />
            </div>
            <span className="text-slate-500">Booked</span>
          </div>
        </div>

        {/* Seating Grid Rows */}
        <div className="space-y-3.5 overflow-x-auto pb-4">
          {rows.map((row, rowIdx) => {
            const rowSeats = seats.filter((s) => s.row === row);
            const rowType = rowSeats[0]?.type || 'regular';
            const price = bookingShowtime.prices[rowType] || rowSeats[0]?.price || 350;

            return (
              <div key={row} className="flex items-center justify-center gap-2 sm:gap-3 min-w-[520px]">
                
                {/* Row Label Left */}
                <div className="w-8 text-right font-black text-xs text-amber-400/80 font-mono">
                  {row}
                </div>

                {/* Seats in Row with Wave Animation */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat, seatIdx) => {
                    const isBooked = bookingShowtime.bookedSeatIds.includes(seat.id);
                    const isBlocked = bookingShowtime.blockedSeatIds.includes(seat.id);
                    const isSelected = selectedSeats.includes(seat.id);

                    return (
                      <motion.button
                        key={seat.id}
                        id={`seat-btn-${seat.id}`}
                        disabled={isBooked || isBlocked}
                        onClick={() => handleSeatClick(seat.id)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: isSelected ? 1.15 : 1 }}
                        transition={{
                          delay: rowIdx * 0.05 + seatIdx * 0.015,
                          type: 'spring',
                          stiffness: 400,
                          damping: 20,
                        }}
                        whileHover={
                          !isBooked && !isBlocked
                            ? { scale: isSelected ? 1.2 : 1.12, y: -3 }
                            : {}
                        }
                        whileTap={!isBooked && !isBlocked ? { scale: 0.95 } : {}}
                        title={`Seat ${seat.id} - NPR ${price}`}
                        className={`relative w-7 h-8 sm:w-8 sm:h-9 rounded-t-lg transition-all flex flex-col items-center justify-center text-[10px] font-extrabold cursor-pointer ${
                          isBooked || isBlocked
                            ? 'bg-slate-950/80 text-slate-700 border border-slate-900 cursor-not-allowed opacity-35'
                            : isSelected
                            ? 'bg-gradient-to-t from-[#D4AF37] to-amber-300 text-black border-2 border-white shadow-[0_0_20px_rgba(212,175,55,1)] z-20'
                            : 'bg-slate-800/90 hover:bg-[#D4AF37]/30 text-slate-300 hover:text-white border border-slate-700/80'
                        }`}
                      >
                        <span className="leading-none">{seat.number}</span>

                        {/* Selected Golden Ripple Ring */}
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0.5, opacity: 1 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="absolute inset-0 rounded-t-lg border-2 border-[#D4AF37] pointer-events-none"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Row Label Right & Tier Badge */}
                <div className="w-16 text-left text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-2">
                  <span>NPR {price}</span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Selected Seats Summary & Checkout Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12131C] p-4 sm:p-6 rounded-2xl border border-[#D4AF37]/40 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Selected Seats:</span>
              <span className="text-sm font-extrabold text-[#D4AF37]">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-serif text-white mt-1">
              NPR {subtotal.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-2">(NPR 0 booking fee)</span>
            </div>
          </div>

          <button
            id="proceed-to-snacks-btn"
            disabled={selectedSeats.length === 0}
            onClick={proceedToSnacks}
            className={`px-8 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider transition-all flex items-center gap-3 ${
              selectedSeats.length > 0
                ? 'bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#997A15] hover:from-amber-300 hover:to-amber-500 text-black shadow-[0_0_25px_rgba(212,175,55,0.6)] cursor-pointer transform hover:scale-102'
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
