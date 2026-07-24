import React from 'react';
import { XCircle, RefreshCw, CreditCard, Headphones, Home } from 'lucide-react';

interface PaymentFailedViewProps {
  bookingRef?: string;
  errorMessage?: string;
  onRetry: () => void;
  onChangeGateway: () => void;
  onReturnHome: () => void;
}

export const PaymentFailedView: React.FC<PaymentFailedViewProps> = ({
  bookingRef,
  errorMessage = 'The payment transaction could not be verified by the gateway server or was cancelled by the user.',
  onRetry,
  onChangeGateway,
  onReturnHome
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="bg-[#12131C] border-2 border-rose-500/50 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
        
        <div className="w-20 h-20 bg-rose-500/20 text-rose-500 border-2 border-rose-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <XCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest">
            Payment Unverified
          </span>
          <h1 className="text-2xl font-bold font-serif text-white">Payment Could Not Be Confirmed</h1>
          {bookingRef && (
            <p className="text-xs text-slate-400 font-mono">Reference: {bookingRef}</p>
          )}
        </div>

        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-200 text-left space-y-1">
          <strong className="block text-rose-400 font-bold">Failure Cause:</strong>
          <p>{errorMessage}</p>
        </div>

        <p className="text-xs text-slate-400">
          No charges were finalized. Your seats are held temporarily for a few moments so you can retry safely.
        </p>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETRY PAYMENT NOW</span>
          </button>

          <button
            onClick={onChangeGateway}
            className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
            <span>CHOOSE ANOTHER PAYMENT GATEWAY</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onReturnHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </button>

            <a
              href="tel:+977010480123"
              className="text-xs text-amber-200 hover:underline flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Gajuri Support: +977-010-480123</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
