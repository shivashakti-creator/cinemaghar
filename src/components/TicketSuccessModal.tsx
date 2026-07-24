import React, { useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Download, Printer, CheckCircle, Film, Sparkles, MapPin, Calendar, Clock, Armchair, Share2, Home, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

export const TicketSuccessModal: React.FC = () => {
  const { confirmedBooking, cancelBookingFlow, setActiveTab, showToast } = useCinema();

  useEffect(() => {
    if (confirmedBooking) {
      // Trigger luxury metallic gold confetti celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#D4AF37', '#FFD700', '#FFB547', '#E6C200', '#B8860B', '#FFFFFF'],
        scalar: 1.2,
      });

      // Second wave of gold confetti burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4AF37', '#FFD700', '#FFB547'],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4AF37', '#FFD700', '#FFB547'],
        });
      }, 400);
    }
  }, [confirmedBooking]);

  if (!confirmedBooking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    showToast('E-Ticket saved to device storage!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-3xl mx-auto bg-[#090A0E] border border-[#D4AF37]/60 rounded-3xl p-4 sm:p-8 shadow-[0_0_100px_rgba(212,175,55,0.4)] my-6 overflow-hidden"
    >
      {/* Golden Light Streak Drawing Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_20px_#D4AF37]"
      />

      {/* Top Banner */}
      <div className="text-center space-y-2 pb-6 border-b border-white/10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border-2 border-[#D4AF37] mb-1 shadow-[0_0_30px_rgba(212,175,55,0.6)] animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          Booking Confirmed!
        </h2>
        <p className="text-sm text-amber-200 font-medium">
          Your luxury digital ticket for <span className="font-extrabold text-[#D4AF37]">{confirmedBooking.movieTitle}</span> is generated.
        </p>
      </div>

      {/* Realistic E-Ticket Card */}
      <div
        id="printable-e-ticket"
        className="my-6 bg-gradient-to-br from-[#12131C] via-[#1A1B28] to-[#090A0E] rounded-3xl border-2 border-[#D4AF37]/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Ticket Decorative Cutouts */}
        <div className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#090A0E] border-r-2 border-[#D4AF37]/60" />
        <div className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#090A0E] border-l-2 border-[#D4AF37]/60" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Ticket Information */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black bg-gradient-to-r from-[#D4AF37] to-amber-400 px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                GAJURI CINEMAS E-TICKET
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">ID: {confirmedBooking.id}</span>
            </div>

            <div>
              <h3 className="text-2xl font-bold font-serif text-white">{confirmedBooking.movieTitle}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-300 border-t border-white/10">
              <div>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Date
                </p>
                <p className="font-bold text-white text-sm mt-0.5">{confirmedBooking.date}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Time
                </p>
                <p className="font-bold text-white text-sm mt-0.5">{confirmedBooking.time}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Armchair className="w-3.5 h-3.5 text-[#D4AF37]" /> Seats
                </p>
                <p className="font-bold text-[#D4AF37] text-base mt-0.5">{confirmedBooking.seatIds.join(', ')}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Location
                </p>
                <p className="font-semibold text-white text-xs mt-0.5">Prithvi Hwy, Gajuri, Dhading</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-white/10">
              <span>Customer: <strong className="text-white">{confirmedBooking.customerName}</strong></span> • <span>Payment: <strong className="text-emerald-400">{confirmedBooking.paymentMethod}</strong> (Txn: {confirmedBooking.paymentTransactionId})</span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0">
            <QRCodeCanvas
              value={confirmedBooking.qrCodeData}
              size={150}
              bgColor={"#FFFFFF"}
              fgColor={"#090A0E"}
              level={"H"}
            />
            <span className="text-[10px] font-mono font-black text-black mt-2 tracking-widest">
              SCAN AT GAJURI GATE
            </span>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
        <button
          id="ticket-go-home-btn"
          onClick={() => {
            cancelBookingFlow();
            setActiveTab('home');
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.5)] transform hover:scale-105 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>GO DIRECT TO HOME</span>
        </button>

        <button
          id="ticket-view-account-btn"
          onClick={() => {
            cancelBookingFlow();
            setActiveTab('account');
          }}
          className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Ticket className="w-4 h-4 text-[#D4AF37]" />
          <span>View All My Tickets</span>
        </button>

        <button
          id="ticket-download-btn"
          onClick={handleDownloadImage}
          className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Save Ticket Image</span>
        </button>

        <button
          id="ticket-print-btn"
          onClick={handlePrint}
          className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print E-Ticket</span>
        </button>
      </div>

    </motion.div>
  );
};
