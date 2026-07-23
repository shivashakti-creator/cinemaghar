import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { Booking } from '../../types';
import { ReprintTicketModal } from '../../components/staff/ReprintTicketModal';
import {
  Search,
  UserCheck,
  Printer,
  Ticket,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertCircle,
  X,
  Sparkles,
  ChevronDown,
  Filter,
  Eye
} from 'lucide-react';

export const StaffBookingsView: React.FC = () => {
  const { bookings, admitCustomer, reprintTicket, staffUser, showToast } = useCinema();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'USED' | 'CANCELLED'>('ALL');

  // Modal States
  const [reprintModalBooking, setReprintModalBooking] = useState<Booking | null>(null);
  const [manualCheckInBooking, setManualCheckInBooking] = useState<Booking | null>(null);
  const [manualReason, setManualReason] = useState<string>('QR Damaged on Phone');
  const [customReason, setCustomReason] = useState<string>('');
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [viewDetailBooking, setViewDetailBooking] = useState<Booking | null>(null);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      b.id.toLowerCase().includes(query) ||
      b.customerName.toLowerCase().includes(query) ||
      b.customerPhone.includes(query) ||
      b.movieTitle.toLowerCase().includes(query) ||
      b.seatIds.some((s) => s.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (statusFilter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (statusFilter === 'USED') return b.status === 'USED' || b.status === 'CHECKED_IN';
    if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED';

    return true;
  });

  const handleExecuteManualCheckIn = async () => {
    if (!manualCheckInBooking) return;
    setProcessingCheckIn(true);
    const finalReason = manualReason === 'Other' ? customReason : manualReason;

    try {
      await admitCustomer(manualCheckInBooking.id, 'manual', finalReason);
      setManualCheckInBooking(null);
    } catch (e) {
      showToast('Manual check-in failed', 'error');
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleSendWhatsApp = (b: Booking) => {
    const cleanPhone = b.customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${b.customerName}, here is your official Gajuri Cinema e-Ticket for ${b.movieTitle}.\nShowtime: ${b.date} at ${b.time}\nSeats: ${b.seatIds.join(', ')}\nTicket ID: ${b.id}\nThank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-[#0C0D15] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold font-serif text-amber-100 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#D4AF37]" />
              <span>Cinema Bookings & Manual Gate Admission</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant search, customer manual verification, and ticket reprints
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30 self-start sm:self-auto">
            {filteredBookings.length} Bookings Listed
          </span>
        </div>

        {/* Search Input & Status Tabs */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Booking ID, Customer Name, Phone, Movie, or Seat (e.g. A5)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#141522] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#141522] p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('CONFIRMED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'CONFIRMED'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              Pending Entry
            </button>
            <button
              onClick={() => setStatusFilter('USED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'USED'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              Checked-In
            </button>
          </div>

        </div>
      </div>

      {/* BOOKINGS TABLE LIST */}
      <div className="bg-[#0C0D15] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#12131D] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Movie & Hall</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isCheckedIn = b.status === 'USED' || b.status === 'CHECKED_IN';

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Booking ID */}
                      <td className="py-4 px-4 font-mono font-bold text-amber-300">
                        {b.id}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">{b.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#D4AF37]" />
                          <span>{b.customerPhone}</span>
                        </span>
                      </td>

                      {/* Movie & Hall */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-amber-100 block">{b.movieTitle}</span>
                        <span className="text-[10px] text-slate-400 block">{b.hallName} ({b.format})</span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <span className="text-slate-200 block">{b.date}</span>
                        <span className="text-[10px] font-bold text-[#D4AF37] block">{b.time}</span>
                      </td>

                      {/* Seats */}
                      <td className="py-4 px-4 font-mono font-bold text-amber-200">
                        {b.seatIds.join(', ')}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ADMITTED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>CONFIRMED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Detail */}
                          <button
                            onClick={() => setViewDetailBooking(b)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                            title="View Ticket Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Manual Check-in */}
                          {!isCheckedIn && (
                            <button
                              onClick={() => {
                                setManualCheckInBooking(b);
                                setManualReason('QR Damaged on Phone');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-[11px] flex items-center gap-1 transition-all"
                              title="Manual Check-In"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Check-In</span>
                            </button>
                          )}

                          {/* Reprint Ticket */}
                          <button
                            onClick={() => {
                              reprintTicket(b.id);
                              setReprintModalBooking(b);
                            }}
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-all"
                            title="Reprint Official Ticket"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Ticket */}
                          <button
                            onClick={() => handleSendWhatsApp(b)}
                            className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-400 transition-all"
                            title="Send Ticket via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No bookings found matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL CHECK-IN OVERLAY MODAL */}
      {manualCheckInBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131D] border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <UserCheck className="w-5 h-5" />
                <span>Manual Staff Check-In</span>
              </div>
              <button
                onClick={() => setManualCheckInBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-xl space-y-1 text-xs">
              <p><span className="text-slate-400">Customer:</span> <strong className="text-white">{manualCheckInBooking.customerName}</strong></p>
              <p><span className="text-slate-400">Booking Ref:</span> <strong className="text-amber-300 font-mono">{manualCheckInBooking.id}</strong></p>
              <p><span className="text-slate-400">Movie & Seats:</span> <strong className="text-emerald-300">{manualCheckInBooking.movieTitle} (Seats: {manualCheckInBooking.seatIds.join(', ')})</strong></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Reason for Manual Overriding
              </label>
              <select
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full bg-[#181926] border border-white/10 rounded-xl p-3 text-white text-xs focus:border-emerald-400"
              >
                <option value="QR Damaged on Phone">QR Damaged / Cracked Phone Screen</option>
                <option value="Phone Battery Dead">Phone Battery Dead</option>
                <option value="Printed Ticket Torn">Printed Ticket Paper Torn / Smudged</option>
                <option value="Customer Name Verified via ID">Customer Name Verified via Photo ID</option>
                <option value="Other">Other Custom Reason</option>
              </select>

              {manualReason === 'Other' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Specify reason..."
                  className="w-full mt-2 bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white text-xs"
                />
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setManualCheckInBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteManualCheckIn}
                disabled={processingCheckIn}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                {processingCheckIn ? 'Admitting...' : 'Confirm Admission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAIL MODAL */}
      {viewDetailBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131D] border border-[#D4AF37]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-base text-amber-100">
                Ticket Information Details
              </h3>
              <button onClick={() => setViewDetailBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Movie Title</span>
                <span className="font-bold text-sm text-white">{viewDetailBooking.movieTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Hall</span>
                  <span className="font-bold text-amber-300">{viewDetailBooking.hallName}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Showtime</span>
                  <span className="font-bold text-amber-300">{viewDetailBooking.date} • {viewDetailBooking.time}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Seats</span>
                <span className="font-mono font-black text-lg text-[#D4AF37]">{viewDetailBooking.seatIds.join(', ')}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl space-y-1 font-mono text-[11px]">
                <p>Customer: <strong className="text-white">{viewDetailBooking.customerName}</strong></p>
                <p>Phone: <strong className="text-slate-300">{viewDetailBooking.customerPhone}</strong></p>
                <p>Total Paid: <strong className="text-emerald-400">NPR {viewDetailBooking.grandTotal.toLocaleString()}</strong></p>
                {viewDetailBooking.scannedBy && (
                  <p className="text-amber-300">Checked In By: {viewDetailBooking.scannedByName || viewDetailBooking.scannedBy} at {viewDetailBooking.scannedAt ? new Date(viewDetailBooking.scannedAt).toLocaleTimeString() : ''}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewDetailBooking(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* REPRINT TICKET MODAL */}
      <ReprintTicketModal
        booking={reprintModalBooking}
        onClose={() => setReprintModalBooking(null)}
        staffName={staffUser?.fullName}
        staffId={staffUser?.staffId}
      />

    </div>
  );
};
