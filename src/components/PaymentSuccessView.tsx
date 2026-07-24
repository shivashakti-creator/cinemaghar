import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CheckCircle2, Download, Printer, Home, Sparkles, ShieldCheck, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessViewProps {
  bookingRef: string;
  movieTitle?: string;
  moviePoster?: string;
  hallName?: string;
  showDate?: string;
  showTime?: string;
  seats?: string[];
  amountPaid?: number;
  paymentGateway?: string;
  transactionId?: string;
  onReturnHome: () => void;
}

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  bookingRef,
  movieTitle = 'Purna Bahadur Ko Sarangi',
  moviePoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
  hallName = 'Hall 1 - Screen 1',
  showDate = '2026-07-23',
  showTime = '11:00 AM',
  seats = ['E5', 'E6'],
  amountPaid = 791,
  paymentGateway = 'eSewa',
  transactionId = `TXN_${Date.now().toString().slice(-8)}`,
  onReturnHome
}) => {

  React.useEffect(() => {
    // Fire celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const qrData = JSON.stringify({
    ref: bookingRef,
    title: movieTitle,
    hall: hallName,
    time: `${showDate} ${showTime}`,
    seats,
    status: 'VERIFIED_PAID'
  });

  const handleDownload = () => {
    alert('E-Ticket PNG generated and saved to downloads!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#12131C] to-emerald-950/80 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
        <div className="w-16 h-16 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest">
          Payment Verified & Booking Confirmed
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-white">Your E-Ticket is Ready!</h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Transaction verified via <strong className="text-emerald-400 uppercase">{paymentGateway}</strong>. Confirmation email & SMS have been dispatched.
        </p>
      </div>

      {/* Ticket Card */}
      <div className="bg-[#12131C] border-2 border-[#D4AF37] rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-[#1A1B28] px-6 py-4 border-b border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Ticket className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wider font-mono">BOOKING REF: {bookingRef}</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTHENTIC TICKET</span>
          </span>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Movie Details */}
          <div className="md:col-span-7 flex gap-4">
            <img
              src={moviePoster}
              alt={movieTitle}
              className="w-24 h-36 object-cover rounded-2xl border-2 border-[#D4AF37]/40 shrink-0 shadow-lg"
            />
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-white">{movieTitle}</h2>
              
              <div className="pt-2 text-xs text-slate-300 space-y-1">
                <p>Date & Time: <strong className="text-white">{showDate} @ {showTime}</strong></p>
                <p>Selected Seats: <strong className="text-[#D4AF37] font-bold text-sm">{seats.join(', ')}</strong></p>
                <p>Amount Paid: <strong className="text-white">NPR {amountPaid.toLocaleString()}</strong></p>
                <p className="text-[11px] text-slate-400">Transaction ID: <span className="font-mono text-slate-300">{transactionId}</span></p>
              </div>
            </div>
          </div>

          {/* QR Pass */}
          <div className="md:col-span-5 bg-white p-5 rounded-2xl border-4 border-[#D4AF37] text-center shadow-xl space-y-2">
            <QRCodeCanvas value={qrData} size={160} className="mx-auto" />
            <p className="text-[11px] font-bold text-black uppercase tracking-wider">
              Scan at Gajuri Cinema Gate
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="bg-[#090A0E] px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReturnHome}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download E-Ticket</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
