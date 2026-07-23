import React from 'react';
import { Booking } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Film, Calendar, Clock, MapPin, User, Ticket } from 'lucide-react';

interface ReprintTicketModalProps {
  booking: Booking | null;
  onClose: () => void;
  staffName?: string;
  staffId?: string;
}

export const ReprintTicketModal: React.FC<ReprintTicketModalProps> = ({
  booking,
  onClose,
  staffName = 'Gate Staff',
  staffId = 'STF-001'
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0E0F17] border border-[#D4AF37]/40 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden text-white my-auto">
        
        {/* Top Action Bar (hidden during browser print) */}
        <div className="print:hidden bg-[#161824] px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Printer className="w-4 h-4" />
            <span>Staff Ticket Reprint Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE TICKET BODY */}
        <div id="printable-ticket" className="p-6 bg-gradient-to-b from-[#12131C] to-[#0A0B10] relative">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none font-serif font-black text-6xl text-[#D4AF37] rotate-[-25deg]">
            REPRINTED
          </div>

          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.5)]">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-amber-100 tracking-wide">
                  GAJURI CINEMAS IMAX
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>Prithvi Highway, Gajuri, Dhading</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                OFFICIAL REPRINT
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Ref: {booking.id}
              </p>
            </div>
          </div>

          {/* Movie Details */}
          <div className="py-4 border-b border-dashed border-white/15 flex gap-4 items-center">
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle}
              className="w-16 h-22 object-cover rounded-lg border border-white/10 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                {booking.format} • {booking.hallName}
              </span>
              <h2 className="text-lg font-black text-white truncate font-serif">
                {booking.movieTitle}
              </h2>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Date</span>
                  </span>
                  <span className="font-bold text-white text-xs">{booking.date}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Time</span>
                  </span>
                  <span className="font-bold text-white text-xs">{booking.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seating & Customer Info */}
          <div className="py-4 border-b border-dashed border-white/15 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1A1C2A] p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Assigned Seats</span>
              <p className="text-base font-black text-[#D4AF37] font-mono tracking-wider">
                {booking.seatIds.join(', ')}
              </p>
            </div>

            <div className="bg-[#1A1C2A] p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Total Paid</span>
              <p className="text-base font-black text-emerald-400 font-mono">
                NPR {booking.grandTotal.toLocaleString()}
              </p>
            </div>

            <div className="col-span-2 bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Customer Name</span>
                <span className="font-bold text-slate-200">{booking.customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Phone</span>
                <span className="font-mono text-slate-300">{booking.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* QR Code & Barcode */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-300 shrink-0">
              <QRCodeSVG
                value={booking.qrCodeData}
                size={96}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="flex-1 text-right text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED BY STAFF</span>
              </div>
              <p className="font-mono text-[10px]">
                Issuer Staff: <span className="text-white">{staffName} ({staffId})</span>
              </p>
              <p className="font-mono text-[9px] text-slate-500">
                Printed: {new Date().toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-500 italic mt-1">
                Keep this physical ticket handy for gate entrance & food counter collection.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
