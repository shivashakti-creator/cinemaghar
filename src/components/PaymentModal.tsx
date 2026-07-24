import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { PaymentGateway } from '../types/payment';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader2, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { generateHall1Seats } from '../data/mockData';
import { SeatReservationTimer } from './SeatReservationTimer';

export const PaymentModal: React.FC = () => {
  const {
    bookingMovie,
    bookingShowtime,
    selectedSeats,
    selectedSnacks,
    user,
    cancelBookingFlow,
    showToast,
    setBookingStep
  } = useCinema();

  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('esewa');
  const [customerName, setCustomerName] = useState(user.name);
  const [customerEmail, setCustomerEmail] = useState(user.email);
  const [customerPhone, setCustomerPhone] = useState(user.phone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!bookingMovie || !bookingShowtime) return null;

  // Calculate breakdown
  const hallSeats = generateHall1Seats();
  let ticketTotal = 0;
  selectedSeats.forEach((seatId) => {
    const match = hallSeats.find((s) => s.id === seatId);
    ticketTotal += match ? (bookingShowtime.prices[match.type] || 400) : 400;
  });

  const snackTotal = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = ticketTotal + snackTotal;
  const vatAmount = Math.round(subtotal * 0.13); // 13% Cinema Tax & VAT
  const grandTotal = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const payload = {
        movieId: bookingMovie.id,
        movieTitle: bookingMovie.title,
        moviePoster: bookingMovie.poster,
        showId: bookingShowtime.id,
        hallName: bookingShowtime.hallName,
        showDate: bookingShowtime.date,
        showTime: bookingShowtime.time,
        format: bookingShowtime.format || '2D',
        selectedSeats,
        selectedSnacks,
        ticketTotal,
        snackTotal,
        totalAmount: grandTotal,
        paymentMethod,
        customerName,
        customerEmail,
        customerPhone
      };

      // Call Backend Server Initiate API
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'Failed to initiate payment.');
        setIsProcessing(false);
        return;
      }

      // If Payment Method is Khalti with redirect URL
      if (paymentMethod === 'khalti' && data.paymentUrl) {
        showToast('Redirecting to Khalti Secure Checkout...', 'info');
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1000);
        return;
      }

      // If Payment Method is eSewa or Fonepay with HTML Form Payload
      if ((paymentMethod === 'esewa' || paymentMethod === 'fonepay') && data.gatewayData) {
        showToast(`Redirecting to ${paymentMethod.toUpperCase()} Gateway...`, 'info');
        
        // Dynamically create and submit HTML form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.gatewayData.action;

        Object.entries(data.gatewayData).forEach(([key, value]) => {
          if (key !== 'action') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        setTimeout(() => {
          form.submit();
        }, 1200);
        return;
      }

      // If Counter / Direct Confirmation
      if (paymentMethod === 'counter') {
        showToast('Ticket reserved for cinema counter payment!', 'success');
        window.location.href = `/booking/success?ref=${data.bookingReference}`;
        return;
      }

      // Fallback
      window.location.href = `/booking/success?ref=${data.bookingReference}`;

    } catch (err: any) {
      console.error('Payment submit error:', err);
      setErrorMessage(err?.message || 'Server connection error during payment initiation.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#090A0E] border border-[#D4AF37]/40 rounded-3xl p-4 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.2)] my-6">
      
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-3">
        <button
          id="payment-back-btn"
          onClick={cancelBookingFlow}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </button>

        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Nepal Payment Gateway SSL Encrypted</span>
        </div>
      </div>

      {/* 10-Minute Seat Reservation Countdown Banner */}
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
        
        {/* Left Column: Customer Details & Gateway Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-xl font-bold font-serif text-white">Contact & E-Ticket Details</h3>
            <p className="text-xs text-slate-400 mt-1">E-Ticket QR code & invoice will be issued to this contact.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                id="pay-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-[#12131C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number (Nepal)</label>
              <input
                id="pay-customer-phone"
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full bg-[#12131C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                id="pay-customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full bg-[#12131C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Gateway Selector Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">Select Official Payment Gateway</h4>
              <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Modular API Integration</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* eSewa */}
              <button
                type="button"
                id="pay-method-esewa"
                onClick={() => setPaymentMethod('esewa')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'esewa'
                    ? 'bg-[#60BB46]/20 border-[#60BB46] shadow-[0_0_20px_rgba(96,187,70,0.4)] scale-105'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#60BB46] text-white font-black text-sm flex items-center justify-center shadow-lg">
                  eS
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">eSewa</span>
                  <span className="text-[9px] text-emerald-400 font-mono">ePay v2 HMAC</span>
                </div>
              </button>

              {/* Khalti */}
              <button
                type="button"
                id="pay-method-khalti"
                onClick={() => setPaymentMethod('khalti')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'khalti'
                    ? 'bg-[#5C2D91]/20 border-[#5C2D91] shadow-[0_0_20px_rgba(92,45,145,0.4)] scale-105'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#5C2D91] text-white font-black text-sm flex items-center justify-center shadow-lg">
                  K
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">Khalti</span>
                  <span className="text-[9px] text-purple-400 font-mono">ePayment v2</span>
                </div>
              </button>

              {/* Fonepay */}
              <button
                type="button"
                id="pay-method-fonepay"
                onClick={() => setPaymentMethod('fonepay')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'fonepay'
                    ? 'bg-[#ED1C24]/20 border-[#ED1C24] shadow-[0_0_20px_rgba(237,28,36,0.4)] scale-105'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#ED1C24] text-white font-black text-sm flex items-center justify-center shadow-lg">
                  FP
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">Fonepay</span>
                  <span className="text-[9px] text-rose-400 font-mono">QR / Web Pay</span>
                </div>
              </button>

              {/* Counter / Cash */}
              <button
                type="button"
                id="pay-method-counter"
                onClick={() => setPaymentMethod('counter')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'counter'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black font-black text-sm flex items-center justify-center shadow-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">Counter</span>
                  <span className="text-[9px] text-amber-300 font-mono">Pay at Cinema</span>
                </div>
              </button>

            </div>
          </div>

          {/* Gateway Action Box */}
          <form onSubmit={handleSubmit} className="bg-[#12131C] p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37]">
              <span className="uppercase">{paymentMethod} Merchant Verification</span>
              <Lock className="w-3.5 h-3.5" />
            </div>

            <div className="p-3.5 bg-[#1A1B28] rounded-xl border border-white/5 text-xs text-slate-300 space-y-1.5">
              {paymentMethod === 'esewa' && (
                <p>
                  You will be securely redirected to official <strong className="text-emerald-400">eSewa ePay Portal</strong>.
                  Upon completing payment on eSewa, you will be redirected back and your booking will be verified server-side.
                </p>
              )}
              {paymentMethod === 'khalti' && (
                <p>
                  You will be redirected to official <strong className="text-purple-400">Khalti Gateway</strong>.
                  Our server will perform cryptographic lookup verification using Khalti Secret Key before issuing your ticket.
                </p>
              )}
              {paymentMethod === 'fonepay' && (
                <p>
                  You will be redirected to official <strong className="text-rose-400">Fonepay Gateway</strong>.
                  Transactions are signed using SHA512 Data Verification (DV) algorithm.
                </p>
              )}
              {paymentMethod === 'counter' && (
                <p>
                  Your seats will be reserved for counter pickup. Please present your booking code at Gajuri Cinema ticket box 20 minutes before showtime to pay via Cash/Card.
                </p>
              )}
            </div>

            <button
              id="confirm-pay-btn"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                paymentMethod === 'esewa'
                  ? 'bg-[#60BB46] hover:bg-emerald-500 text-white'
                  : paymentMethod === 'khalti'
                  ? 'bg-[#5C2D91] hover:bg-purple-700 text-white'
                  : paymentMethod === 'fonepay'
                  ? 'bg-[#ED1C24] hover:bg-red-600 text-white'
                  : 'bg-[#D4AF37] hover:bg-amber-400 text-black'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>COMMUNICATING WITH {paymentMethod.toUpperCase()} GATEWAY...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PAY NPR {grandTotal.toLocaleString()} VIA {paymentMethod.toUpperCase()}</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Order Breakdown */}
        <div className="lg:col-span-5 bg-[#12131C] p-6 rounded-3xl border border-[#D4AF37]/30 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold font-serif text-white border-b border-white/10 pb-3">
              Order Breakdown
            </h3>

            <div className="flex gap-4 my-4">
              <img
                src={bookingMovie.poster}
                alt={bookingMovie.title}
                className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-white font-serif">{bookingMovie.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {bookingShowtime.date} @ <span className="text-[#D4AF37] font-semibold">{bookingShowtime.time}</span>
                </p>
                <div className="mt-2 text-xs text-slate-300 font-bold bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded inline-block">
                  Seats: {selectedSeats.join(', ')}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length} seats)</span>
                <span className="font-semibold text-white">NPR {ticketTotal.toLocaleString()}</span>
              </div>

              {selectedSnacks.length > 0 && (
                <div className="flex justify-between text-amber-200">
                  <span>Concession Snacks ({selectedSnacks.length} items)</span>
                  <span className="font-semibold">NPR {snackTotal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>13% Cinema VAT & Govt Tax</span>
                <span>NPR {vatAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D4AF37]/40">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-bold text-slate-300">Total Payable Amount</span>
              <span className="text-2xl font-bold font-serif text-[#D4AF37]">
                NPR {grandTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Booking confirmed ONLY after server signature verification.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
