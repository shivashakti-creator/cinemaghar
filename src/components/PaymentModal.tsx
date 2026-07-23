import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { PaymentMethod } from '../types';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { generateHall1Seats } from '../data/mockData';

export const PaymentModal: React.FC = () => {
  const {
    bookingMovie,
    bookingShowtime,
    selectedSeats,
    selectedSnacks,
    completePayment,
    user,
    cancelBookingFlow
  } = useCinema();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('eSewa');
  const [customerName, setCustomerName] = useState(user.name);
  const [customerEmail, setCustomerEmail] = useState(user.email);
  const [customerPhone, setCustomerPhone] = useState(user.phone);
  const [esewaMobile, setEsewaMobile] = useState(user.phone);
  const [pinInput, setPinInput] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);

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
  const vatAmount = Math.round(subtotal * 0.13); // 13% VAT
  const grandTotal = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate gateway delay
      await new Promise((resolve) => setTimeout(resolve, 1800));
      await completePayment(paymentMethod, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#090A0E] border border-[#D4AF37]/40 rounded-3xl p-4 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.2)] my-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <button
          id="payment-back-btn"
          onClick={cancelBookingFlow}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Nepal Direct Gateway SSL Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        
        {/* Left Column: Customer Details & Payment Gateways */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-xl font-bold font-serif text-white">Contact & Ticket Details</h3>
            <p className="text-xs text-slate-400 mt-1">E-Ticket QR code will be sent to this email & mobile.</p>
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

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Select Payment Method (Nepal)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* eSewa */}
              <button
                type="button"
                id="pay-method-esewa"
                onClick={() => setPaymentMethod('eSewa')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'eSewa'
                    ? 'bg-[#60BB46]/20 border-[#60BB46] shadow-[0_0_15px_rgba(96,187,70,0.4)]'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#60BB46] text-white font-black text-xs flex items-center justify-center shadow">
                  eS
                </div>
                <span className="text-xs font-bold text-white">eSewa</span>
              </button>

              {/* Khalti */}
              <button
                type="button"
                id="pay-method-khalti"
                onClick={() => setPaymentMethod('Khalti')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'Khalti'
                    ? 'bg-[#5C2D91]/20 border-[#5C2D91] shadow-[0_0_15px_rgba(92,45,145,0.4)]'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#5C2D91] text-white font-black text-xs flex items-center justify-center shadow">
                  K
                </div>
                <span className="text-xs font-bold text-white">Khalti</span>
              </button>

              {/* IME Pay */}
              <button
                type="button"
                id="pay-method-imepay"
                onClick={() => setPaymentMethod('IME Pay')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'IME Pay'
                    ? 'bg-[#ED1C24]/20 border-[#ED1C24] shadow-[0_0_15px_rgba(237,28,36,0.4)]'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#ED1C24] text-white font-black text-xs flex items-center justify-center shadow">
                  IME
                </div>
                <span className="text-xs font-bold text-white">IME Pay</span>
              </button>

              {/* Counter / Card */}
              <button
                type="button"
                id="pay-method-card"
                onClick={() => setPaymentMethod('Counter')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'Counter'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#12131C] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-black font-black text-xs flex items-center justify-center shadow">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Counter / Card</span>
              </button>

            </div>
          </div>

          {/* Wallet Verification Input Mock */}
          <form onSubmit={handleSubmit} className="bg-[#12131C] p-4 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37]">
              <span>{paymentMethod} Gateway Authentication</span>
              <Lock className="w-3.5 h-3.5" />
            </div>

            {paymentMethod !== 'Counter' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {paymentMethod} Mobile Number
                  </label>
                  <input
                    id="wallet-mobile-input"
                    type="text"
                    value={esewaMobile}
                    onChange={(e) => setEsewaMobile(e.target.value)}
                    required
                    placeholder="98XXXXXXXX"
                    className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{paymentMethod} MPIN</label>
                  <input
                    id="wallet-mpin-input"
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full bg-[#1A1B28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                You will receive a reserved ticket pass. Please present this QR code at Gajuri Cinemas ticket booth to pay cash/card before showtime.
              </p>
            )}

            <button
              id="confirm-pay-btn"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                paymentMethod === 'eSewa'
                  ? 'bg-[#60BB46] hover:bg-emerald-500 text-white'
                  : paymentMethod === 'Khalti'
                  ? 'bg-[#5C2D91] hover:bg-purple-700 text-white'
                  : paymentMethod === 'IME Pay'
                  ? 'bg-[#ED1C24] hover:bg-red-600 text-white'
                  : 'bg-[#D4AF37] hover:bg-amber-400 text-black'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>COMMUNICATING WITH {paymentMethod.toUpperCase()}...</span>
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
              Booking Summary
            </h3>

            <div className="flex gap-4 my-4">
              <img
                src={bookingMovie.poster}
                alt={bookingMovie.title}
                className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-white font-serif">{bookingMovie.title}</h4>
                <p className="text-xs text-amber-200 mt-0.5">{bookingShowtime.hallName}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {bookingShowtime.date} @ <span className="text-[#D4AF37] font-semibold">{bookingShowtime.time}</span>
                </p>
                <div className="mt-2 text-xs text-slate-300 font-bold bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded inline-block">
                  Seats: {selectedSeats.join(', ')}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length} seats)</span>
                <span>NPR {ticketTotal.toLocaleString()}</span>
              </div>

              {selectedSnacks.length > 0 && (
                <div className="flex justify-between text-amber-200">
                  <span>Concession Snacks ({selectedSnacks.length} items)</span>
                  <span>NPR {snackTotal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>13% Cinema VAT & Local Govt Tax</span>
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
            <p className="text-[11px] text-slate-500">Includes all taxes. Instant QR ticket will be issued upon authorization.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
