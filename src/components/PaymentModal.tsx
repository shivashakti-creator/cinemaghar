import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { PaymentGateway } from '../types/payment';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  QrCode,
  Building2,
  Wallet,
  Check,
  Ticket,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { generateHall1Seats } from '../data/mockData';
import { SeatReservationTimer } from './SeatReservationTimer';

interface PaymentOption {
  id: PaymentGateway;
  name: string;
  category: string;
  description: string;
  badge: string;
  brandColor: string;
  borderColor: string;
  glowShadow: string;
  iconBg: string;
  textColor: string;
  logo: React.ReactNode;
}

export const PaymentModal: React.FC = () => {
  const {
    bookingMovie,
    bookingShowtime,
    selectedSeats,
    selectedSnacks,
    user,
    cancelBookingFlow,
    showToast,
    setBookingStep,
    completePayment
  } = useCinema();

  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('esewa');
  const [customerName, setCustomerName] = useState(user.name || 'Gajuri Moviegoer');
  const [customerEmail, setCustomerEmail] = useState(user.email || 'customer@gajuri.com');
  const [customerPhone, setCustomerPhone] = useState(user.phone || '9800000000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!bookingMovie || !bookingShowtime) return null;

  // Calculate price breakdown
  const hallSeats = generateHall1Seats();
  let ticketTotal = 0;
  selectedSeats.forEach((seatId) => {
    const match = hallSeats.find((s) => s.id === seatId);
    ticketTotal += match ? (bookingShowtime.prices[match.type] || 400) : 400;
  });

  const snackTotal = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = ticketTotal + snackTotal;
  const vatAmount = Math.round(subtotal * 0.13); // 13% VAT & Govt Tax
  const grandTotal = subtotal + vatAmount;

  // 8 Demo Payment Options
  const paymentOptions: PaymentOption[] = [
    {
      id: 'esewa',
      name: 'eSewa',
      category: 'Digital Wallet',
      description: 'Instant payment via eSewa App or Web ePay v2',
      badge: 'POPULAR',
      brandColor: '#60BB46',
      borderColor: 'border-[#60BB46]',
      glowShadow: 'shadow-[0_0_25px_rgba(96,187,70,0.45)]',
      iconBg: 'bg-[#60BB46]',
      textColor: 'text-emerald-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#60BB46] text-white font-black text-sm flex items-center justify-center shadow-lg tracking-tighter">
          eS
        </div>
      )
    },
    {
      id: 'khalti',
      name: 'Khalti',
      category: 'Digital Wallet',
      description: 'Instant Wallet & mBanking checkout',
      badge: 'FAST',
      brandColor: '#5C2D91',
      borderColor: 'border-[#5C2D91]',
      glowShadow: 'shadow-[0_0_25px_rgba(92,45,145,0.45)]',
      iconBg: 'bg-[#5C2D91]',
      textColor: 'text-purple-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#5C2D91] text-white font-black text-base flex items-center justify-center shadow-lg">
          K
        </div>
      )
    },
    {
      id: 'fonepay',
      name: 'Fonepay QR',
      category: 'Scan & Pay',
      description: 'Scan QR with any Mobile Banking App',
      badge: 'QR PAY',
      brandColor: '#ED1C24',
      borderColor: 'border-[#ED1C24]',
      glowShadow: 'shadow-[0_0_25px_rgba(237,28,36,0.45)]',
      iconBg: 'bg-[#ED1C24]',
      textColor: 'text-rose-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#ED1C24] text-white font-black text-sm flex items-center justify-center shadow-lg">
          <QrCode className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 'connectips',
      name: 'ConnectIPS',
      category: 'e-Banking',
      description: 'Direct Bank Account transfer from 50+ Banks',
      badge: 'NCHL',
      brandColor: '#0056B3',
      borderColor: 'border-[#0056B3]',
      glowShadow: 'shadow-[0_0_25px_rgba(0,86,179,0.45)]',
      iconBg: 'bg-[#0056B3]',
      textColor: 'text-sky-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#0056B3] text-white font-black text-sm flex items-center justify-center shadow-lg">
          <Building2 className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 'imepay',
      name: 'IME Pay',
      category: 'Digital Wallet',
      description: 'Pay via IME Pay Wallet balance & rewards',
      badge: 'IME',
      brandColor: '#E31E24',
      borderColor: 'border-[#E31E24]',
      glowShadow: 'shadow-[0_0_25px_rgba(227,30,36,0.45)]',
      iconBg: 'bg-[#E31E24]',
      textColor: 'text-red-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#E31E24] text-white font-black text-xs flex items-center justify-center shadow-lg">
          IME
        </div>
      )
    },
    {
      id: 'visa',
      name: 'Visa Card',
      category: 'Credit / Debit',
      description: 'All 3D-Secure Visa Debit & Credit Cards',
      badge: 'CARD',
      brandColor: '#1A1F71',
      borderColor: 'border-[#3B82F6]',
      glowShadow: 'shadow-[0_0_25px_rgba(59,130,246,0.45)]',
      iconBg: 'bg-[#1A1F71]',
      textColor: 'text-blue-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1A1F71] to-blue-900 text-yellow-400 font-extrabold text-xs flex items-center justify-center shadow-lg border border-yellow-400/30">
          VISA
        </div>
      )
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      category: 'Credit / Debit',
      description: 'Global & Local Mastercard Payments',
      badge: 'CARD',
      brandColor: '#FF5F00',
      borderColor: 'border-[#FF5F00]',
      glowShadow: 'shadow-[0_0_25px_rgba(255,95,0,0.45)]',
      iconBg: 'bg-zinc-900',
      textColor: 'text-orange-400',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg relative overflow-hidden border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#EB001B] -mr-1 opacity-90"></div>
          <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-1 opacity-90"></div>
        </div>
      )
    },
    {
      id: 'counter',
      name: 'Cash Counter',
      category: 'Pay at Cinema',
      description: 'Reserve seats now & pay cash at Gajuri Box Office',
      badge: 'BOX OFFICE',
      brandColor: '#D4AF37',
      borderColor: 'border-[#D4AF37]',
      glowShadow: 'shadow-[0_0_25px_rgba(212,175,55,0.45)]',
      iconBg: 'bg-[#D4AF37]',
      textColor: 'text-amber-300',
      logo: (
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black font-black text-sm flex items-center justify-center shadow-lg">
          <Ticket className="w-5 h-5 text-black" />
        </div>
      )
    }
  ];

  const selectedOption = paymentOptions.find((o) => o.id === paymentMethod) || paymentOptions[0];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMessage('Please fill in your name, mobile number, and email address.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStatusText(`Connecting to ${selectedOption.name} Gateway...`);

    // Step 1: Processing delay 1
    setTimeout(() => {
      setProcessingStatusText(`Simulating Payment via ${selectedOption.name}...`);
    }, 900);

    // Step 2: Processing delay 2
    setTimeout(() => {
      setProcessingStatusText(`Verifying Transaction Security Signature...`);
    }, 1800);

    // Step 3: Complete payment after 2.5 seconds
    setTimeout(async () => {
      try {
        await completePayment(paymentMethod, {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        });
        showToast(`Payment Successful! NPR ${grandTotal.toLocaleString()} verified via ${selectedOption.name}.`, 'success');
      } catch (err: any) {
        console.error('Demo payment error:', err);
        setErrorMessage('An unexpected error occurred during payment simulation.');
        setIsProcessing(false);
      }
    }, 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#090A0E] border border-[#D4AF37]/40 rounded-3xl p-4 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.2)] my-6">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-3">
        <button
          id="payment-back-btn"
          onClick={() => setBookingStep('snacks')}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Concessions</span>
        </button>

        <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full shadow-inner">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Demo Payment System • Simulation Mode Active</span>
        </div>
      </div>

      {/* 10-Minute Reservation Timer */}
      <div className="my-6">
        <SeatReservationTimer onExpire={() => {
          showToast('10-minute seat reservation expired. Please re-select your seats.', 'error');
          setBookingStep('seats');
        }} />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        
        {/* Left Column: Details & Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Details Form */}
          <div className="bg-[#12131C] p-5 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>Customer Contact & Ticket Recipient</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Full Name</span>
                </label>
                <input
                  id="pay-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Mobile Number (Nepal)</span>
                </label>
                <input
                  id="pay-customer-phone"
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  required
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Email Address (for E-Ticket PDF)</span>
                </label>
                <input
                  id="pay-customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-serif">Select Payment Method</h4>
                <p className="text-[11px] text-slate-400">Choose your preferred gateway for demo checkout</p>
              </div>
              <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                8 Options Available
              </span>
            </div>

            {/* 2x4 Grid of Payment Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    id={`pay-method-${opt.id}`}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`relative p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between gap-2.5 cursor-pointer text-left ${
                      isSelected
                        ? `bg-[#181A26] ${opt.borderColor} ${opt.glowShadow} scale-105 z-10 font-bold border-2`
                        : 'bg-[#12131C] border-white/10 hover:border-white/30 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Top Badge / Selected Check Indicator */}
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {opt.badge}
                      </span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                      )}
                    </div>

                    {/* Logo & Name */}
                    <div className="flex flex-col items-center text-center space-y-1.5 my-1">
                      {opt.logo}
                      <div>
                        <span className="text-xs font-bold text-white block tracking-tight">
                          {opt.name}
                        </span>
                        <span className={`text-[10px] font-mono ${opt.textColor}`}>
                          {opt.category}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gateway Info Banner */}
          <div className="bg-[#12131C] p-4 rounded-2xl border border-white/10 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">{selectedOption.name} Selected</p>
              <p className="text-slate-400 text-[11px]">{selectedOption.description}</p>
              <p className="text-[10px] text-amber-300/80 font-mono italic">
                * Client Demo Mode: No real funds will be charged. Click "Confirm Booking" to simulate instant payment verification.
              </p>
            </div>
          </div>

          {/* Confirm Booking CTA Button */}
          <form onSubmit={handleSubmitBooking}>
            <button
              id="confirm-booking-btn"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl cursor-pointer ${
                isProcessing
                  ? 'bg-amber-600 text-white cursor-wait opacity-90'
                  : 'bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] transform hover:scale-101'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="uppercase font-mono">{processingStatusText || 'PROCESSING PAYMENT...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <span>CONFIRM BOOKING (PAY NPR {grandTotal.toLocaleString()} VIA {selectedOption.name.toUpperCase()})</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-[#12131C] p-6 rounded-3xl border border-[#D4AF37]/30 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold font-serif text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span>Booking Breakdown</span>
            </h3>

            {/* Movie Header Card */}
            <div className="flex gap-4 my-4 p-3 bg-[#1A1B28] rounded-2xl border border-white/5">
              <img
                src={bookingMovie.poster}
                alt={bookingMovie.title}
                className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0 shadow"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white font-serif truncate">{bookingMovie.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {bookingShowtime.date} @ <span className="text-[#D4AF37] font-semibold">{bookingShowtime.time}</span>
                </p>
                <p className="text-[11px] text-slate-400">Hall: {bookingShowtime.hallName}</p>
                
                <div className="mt-2 text-[11px] text-amber-300 font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-lg inline-block">
                  Seats: {selectedSeats.join(', ')} ({selectedSeats.length})
                </div>
              </div>
            </div>

            {/* Line items calculation */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length} x Seat Price)</span>
                <span className="font-semibold text-white">NPR {ticketTotal.toLocaleString()}</span>
              </div>

              {selectedSnacks.length > 0 && (
                <div className="flex justify-between text-amber-200">
                  <span>Concession Snacks ({selectedSnacks.length} items)</span>
                  <span className="font-semibold">NPR {snackTotal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>13% Cinema VAT & Govt Tax</span>
                <span>NPR {vatAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total Payable Box */}
          <div className="pt-4 border-t border-[#D4AF37]/40 bg-[#181A26] p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Payable</span>
              <span className="text-2xl font-black font-serif text-[#D4AF37]">
                NPR {grandTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Demo Gateway • Instant E-Ticket Issuance</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
