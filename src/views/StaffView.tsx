import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { StaffLoginView } from './staff/StaffLoginView';
import { StaffDashboardView } from './staff/StaffDashboardView';
import { StaffScannerView } from './staff/StaffScannerView';
import { StaffBookingsView } from './staff/StaffBookingsView';
import { StaffManagementView } from './staff/StaffManagementView';
import { StaffLogsView } from './staff/StaffLogsView';
import {
  LayoutDashboard,
  QrCode,
  Ticket,
  Users,
  FileText,
  LogOut,
  Film,
  ShieldCheck,
  User,
  ArrowLeft
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staffUser, staffSubTab, setStaffSubTab, logoutStaff, setActiveTab } = useCinema();

  // If staff user is not logged in, force render StaffLoginView
  if (!staffUser) {
    return <StaffLoginView />;
  }

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      
      {/* STAFF TOP NAVIGATION HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0A0B12]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Brand & Main Site Back Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Return to Main Cinema Website"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Main Site</span>
            </button>

            <div className="h-5 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-black text-sm text-amber-100 tracking-wider block leading-none">
                  GAJURI STAFF
                </span>
                <span className="text-[9px] font-mono text-[#D4AF37] tracking-widest block uppercase mt-0.5">
                  TICKET GATEWAY
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#12131F] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setStaffSubTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                staffSubTab === 'dashboard'
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setStaffSubTab('scanner')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                staffSubTab === 'scanner'
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => setStaffSubTab('bookings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                staffSubTab === 'bookings'
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => setStaffSubTab('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                staffSubTab === 'management'
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Accounts</span>
            </button>

            <button
              onClick={() => setStaffSubTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                staffSubTab === 'logs'
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </nav>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-[#141522] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-left">
                <span className="font-bold text-white block leading-none">{staffUser.fullName}</span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{staffUser.staffId}</span>
              </div>
            </div>

            <button
              onClick={logoutStaff}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Logout Staff"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub Nav Bar */}
        <div className="md:hidden flex items-center justify-around bg-[#0E0F18] border-t border-white/10 px-2 py-2 overflow-x-auto text-[11px] font-bold">
          <button
            onClick={() => setStaffSubTab('dashboard')}
            className={`px-3 py-1 rounded-lg ${staffSubTab === 'dashboard' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setStaffSubTab('scanner')}
            className={`px-3 py-1 rounded-lg ${staffSubTab === 'scanner' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
          >
            Scanner
          </button>
          <button
            onClick={() => setStaffSubTab('bookings')}
            className={`px-3 py-1 rounded-lg ${staffSubTab === 'bookings' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setStaffSubTab('management')}
            className={`px-3 py-1 rounded-lg ${staffSubTab === 'management' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
          >
            Staff
          </button>
          <button
            onClick={() => setStaffSubTab('logs')}
            className={`px-3 py-1 rounded-lg ${staffSubTab === 'logs' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
          >
            Logs
          </button>
        </div>

      </header>

      {/* SUB TAB VIEW CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {staffSubTab === 'dashboard' && <StaffDashboardView />}
        {staffSubTab === 'scanner' && <StaffScannerView />}
        {staffSubTab === 'bookings' && <StaffBookingsView />}
        {staffSubTab === 'management' && <StaffManagementView />}
        {staffSubTab === 'logs' && <StaffLogsView />}
      </main>

    </div>
  );
};
