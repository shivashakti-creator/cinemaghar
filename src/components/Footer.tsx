import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { Film, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useCinema();

  return (
    <footer className="bg-[#06070A] border-t border-[#D4AF37]/20 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Col 1: Brand & Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold">
              <Film className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-serif text-white tracking-wider">
              GAJURI <span className="text-[#D4AF37]">CINEMAS</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-light">
            The premier luxury cinema destination in Dhading, Nepal. Equipped with 4K IMAX Laser, 3D Surround Sound, VIP Recliners, and fresh concession dining.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Prithvi Highway, Gajuri Bazar, Dhading, Nepal</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Hotline: +977 10-400123 / +977 9851100000</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>tickets@gajuricinemas.com.np</span>
            </div>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm font-serif mb-4 text-[#D4AF37]">Quick Navigation</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">
                Home Banner & Hits
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('movies')} className="hover:text-white transition-colors">
                Now Showing Movies
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('movies')} className="hover:text-white transition-colors">
                Coming Soon Trailers
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('showtimes')} className="hover:text-white transition-colors">
                Daily Showtimes Schedule
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('account')} className="hover:text-white transition-colors">
                My Booking History & QR Tickets
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Gajuri Hall Facilities */}
        <div>
          <h4 className="text-white font-bold text-sm font-serif mb-4 text-[#D4AF37]">Gajuri Experiences</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Hall 2: Gajuri Club Dolby Atmos 7.1 with high contrast and sharp 2D/3D imagery.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Playground for Kids, greenery surrounding</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Fresh Butter Popcorn & Momos Basket</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Ample Highway Parking for Bikes & Cars</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Nepal Payments */}
        <div>
          <h4 className="text-white font-bold text-sm font-serif mb-4 text-[#D4AF37]">Nepal Official Payments</h4>
          <p className="text-xs text-slate-400 mb-3">Instant booking authorization supported via:</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg bg-[#60BB46] text-white font-bold text-xs shadow">
              eSewa
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#5C2D91] text-white font-bold text-xs shadow">
              Khalti
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#ED1C24] text-white font-bold text-xs shadow">
              IME Pay
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#D4AF37] text-black font-bold text-xs shadow">
              Counter Pay
            </span>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-[#12131C] border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Guaranteed Official Tickets at Gajuri Gate</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 Gajuri Cinemas, Gajuri Bazar, Dhading, Nepal. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for Cinema Lovers in Nepal</span>
        </p>
      </div>
    </footer>
  );
};
