import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Booking } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { User, Ticket, Award, Phone, Mail, Sparkles, Download, CheckCircle, Clock, Gift, Shield, Trash2 } from 'lucide-react';

export const CustomerAccountView: React.FC = () => {
  const { user, bookings, deleteTicket, showToast } = useCinema();
  const [selectedTicketModal, setSelectedTicketModal] = useState<Booking | null>(null);

  const activeTickets = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
  const pastTickets = bookings.filter((b) => b.status === 'CANCELLED');

  const handleRedeemPoints = (cost: number, perk: string) => {
    if (user.loyaltyPoints < cost) {
      showToast(`You need ${cost} points to redeem ${perk}`, 'warning');
      return;
    }
    showToast(`Successfully redeemed ${perk}! Coupon saved to account.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#12131C] via-[#1A1B28] to-[#12131C] rounded-3xl border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#D4AF37] shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
              VIP
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">{user.name}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{user.memberTier} Member</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{user.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{user.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="bg-[#090A0E] p-5 rounded-2xl border border-[#D4AF37]/30 text-center sm:text-right min-w-[200px]">
          <p className="text-xs text-slate-400 font-semibold flex items-center justify-center sm:justify-end gap-1">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Gajuri Club Points</span>
          </p>
          <p className="text-3xl font-bold font-serif text-[#D4AF37] mt-1">
            {user.loyaltyPoints} <span className="text-xs font-sans text-slate-300">PTS</span>
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">+10 points for every NPR 100 spent</p>
        </div>

      </div>

      {/* Active E-Tickets */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-2xl font-bold font-serif text-white">My Active E-Tickets ({activeTickets.length})</h2>
          </div>
        </div>

        {activeTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTickets.map((ticket) => (
              <div
                key={ticket.id}
                id={`ticket-card-${ticket.id}`}
                className="bg-[#12131C] rounded-3xl border border-[#D4AF37]/40 p-6 flex flex-col justify-between space-y-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
              >
                <div className="flex gap-4">
                  <img
                    src={ticket.moviePoster}
                    alt={ticket.movieTitle}
                    className="w-20 h-28 object-cover rounded-2xl border border-white/10 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{ticket.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-white font-serif line-clamp-1">{ticket.movieTitle}</h3>
                    <p className="text-xs text-[#D4AF37] font-semibold">{ticket.hallName} • {ticket.format}</p>

                    <div className="pt-2 text-xs text-slate-300 space-y-0.5">
                      <p>Showtime: <strong className="text-white">{ticket.date} @ {ticket.time}</strong></p>
                      <p>Seats: <strong className="text-[#D4AF37]">{ticket.seatIds.join(', ')}</strong></p>
                    </div>
                  </div>
                </div>

                {/* QR Code trigger, Download & Delete */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 sm:gap-3">
                  <button
                    id={`open-qr-modal-${ticket.id}`}
                    onClick={() => setSelectedTicketModal(ticket)}
                    className="flex-1 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QRCodeCanvas value={ticket.qrCodeData} size={14} bgColor="transparent" fgColor="#000000" />
                    <span>VIEW QR PASS</span>
                  </button>

                  <button
                    id={`download-ticket-${ticket.id}`}
                    onClick={() => showToast('E-Ticket downloaded', 'success')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                    title="Download Ticket"
                  >
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                  </button>

                  <button
                    id={`delete-ticket-${ticket.id}`}
                    onClick={() => {
                      deleteTicket(ticket.id);
                      if (selectedTicketModal?.id === ticket.id) {
                        setSelectedTicketModal(null);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Remove E-Ticket"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#12131C] rounded-3xl border border-white/10 space-y-2">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-bold text-white">No active ticket bookings found</p>
            <p className="text-xs text-slate-400">Book a movie from the homepage or showtimes tab.</p>
          </div>
        )}
      </div>

      {/* Gajuri Club Rewards Catalog */}
      <div className="bg-[#12131C] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-2xl font-bold font-serif text-white">Gajuri VIP Rewards Catalog</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1A1B28] p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 bg-[#D4AF37] text-black font-bold text-[10px] rounded">150 PTS</span>
              <h4 className="text-sm font-bold text-white mt-2">Free Large Butter Popcorn</h4>
              <p className="text-xs text-slate-400 mt-1">Complimentary large butter popcorn at concession counter.</p>
            </div>
            <button
              id="redeem-popcorn-btn"
              onClick={() => handleRedeemPoints(150, 'Free Large Butter Popcorn')}
              className="w-full py-2 bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold text-slate-200 rounded-xl transition-all"
            >
              Redeem Voucher
            </button>
          </div>

          <div className="bg-[#1A1B28] p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 bg-[#D4AF37] text-black font-bold text-[10px] rounded">300 PTS</span>
              <h4 className="text-sm font-bold text-white mt-2">Free VIP Recliner Ticket Upgrade</h4>
              <p className="text-xs text-slate-400 mt-1">Upgrade any regular ticket to Row G VIP Recliner gratis.</p>
            </div>
            <button
              id="redeem-upgrade-btn"
              onClick={() => handleRedeemPoints(300, 'Free VIP Ticket Upgrade')}
              className="w-full py-2 bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold text-slate-200 rounded-xl transition-all"
            >
              Redeem Voucher
            </button>
          </div>

          <div className="bg-[#1A1B28] p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 bg-[#D4AF37] text-black font-bold text-[10px] rounded">500 PTS</span>
              <h4 className="text-sm font-bold text-white mt-2">Full Gajuri Movie Combo Free</h4>
              <p className="text-xs text-slate-400 mt-1">1 IMAX Ticket + Large Popcorn + 2 Cold Drinks + Momo Basket.</p>
            </div>
            <button
              id="redeem-combo-btn"
              onClick={() => handleRedeemPoints(500, 'Full Gajuri Movie Combo')}
              className="w-full py-2 bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold text-slate-200 rounded-xl transition-all"
            >
              Redeem Voucher
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal popup for active ticket */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#12131C] border-2 border-[#D4AF37] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <button
              id="close-ticket-qr-modal"
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold font-serif text-white">{selectedTicketModal.movieTitle}</h3>
            <p className="text-xs text-amber-200">{selectedTicketModal.hallName} • {selectedTicketModal.time}</p>

            <div className="bg-white p-6 rounded-2xl inline-block border-4 border-[#D4AF37] shadow-xl my-2">
              <QRCodeCanvas value={selectedTicketModal.qrCodeData} size={200} />
            </div>

            <p className="text-xs font-bold text-[#D4AF37]">
              SEATS: {selectedTicketModal.seatIds.join(', ')}
            </p>
            <p className="text-[11px] text-slate-400">Present this QR code to the scanner usher at Gajuri Gate.</p>

            <div className="pt-3 border-t border-white/10 flex justify-center gap-3">
              <button
                id="modal-delete-ticket-btn"
                onClick={() => {
                  deleteTicket(selectedTicketModal.id);
                  setSelectedTicketModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete E-Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
