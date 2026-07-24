import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SeatReservationTimerProps {
  expiresAt?: string;
  onExpire?: () => void;
}

export const SeatReservationTimer: React.FC<SeatReservationTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes (600s) default

  useEffect(() => {
    const targetTime = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 10 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 120; // Under 2 minutes

  const percentage = Math.min(100, Math.max(0, (timeLeft / 600) * 100));

  return (
    <div className={`p-3.5 rounded-2xl border transition-all ${
      isWarning
        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
        : 'bg-[#12131C] border-[#D4AF37]/30 text-slate-200'
    }`}>
      <div className="flex items-center justify-between gap-3 text-xs font-bold">
        <div className="flex items-center gap-2">
          {isWarning ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          )}
          <span>{isWarning ? 'Reservation Expiring Soon!' : 'Seats Reserved For'}</span>
        </div>

        <div className="font-mono text-sm tracking-wider font-extrabold text-[#D4AF37]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isWarning ? 'bg-rose-500' : 'bg-[#D4AF37]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
