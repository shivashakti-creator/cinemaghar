import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface PaymentProcessingViewProps {
  onSuccess: (bookingRef: string) => void;
  onFailed: (errorMsg: string) => void;
}

export const PaymentProcessingView: React.FC<PaymentProcessingViewProps> = ({ onSuccess, onFailed }) => {
  const [statusText, setStatusText] = useState('Communicating with payment gateway...');

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref') || urlParams.get('purchase_order_id') || urlParams.get('PRN')?.replace('GAJ-', '') || '';
        const gateway = urlParams.get('gateway') || 'esewa';
        const data = urlParams.get('data') || '';
        const pidx = urlParams.get('pidx') || '';
        const PRN = urlParams.get('PRN') || '';
        const transactionId = urlParams.get('transaction_id') || '';

        setStatusText(`Verifying ${gateway.toUpperCase()} signature server-side...`);

        const queryStr = new URLSearchParams({
          ref,
          gateway,
          data,
          pidx,
          PRN,
          transaction_id: transactionId
        }).toString();

        const res = await fetch(`/api/payments/verify?${queryStr}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        const verifyData = await res.json();

        if (verifyData.success) {
          setStatusText('Payment Verified! Locking seats & generating E-Ticket...');
          setTimeout(() => {
            onSuccess(verifyData.bookingReference || ref);
          }, 1000);
        } else {
          onFailed(verifyData.error || 'Server payment verification failed.');
        }

      } catch (err: any) {
        console.error('Payment verification error:', err);
        onFailed(err?.message || 'Failed to verify transaction with payment server.');
      }
    };

    verifyTransaction();
  }, [onSuccess, onFailed]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-[#12131C] border-2 border-[#D4AF37]/50 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 animate-ping" />
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold font-serif text-white">Verifying Your Payment</h2>
          <p className="text-xs text-amber-200 font-medium">{statusText}</p>
        </div>

        <div className="p-3 bg-[#1A1B28] rounded-xl border border-white/10 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Server-side HMAC Cryptographic Signature Check</span>
        </div>

      </div>
    </div>
  );
};
