import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Ticket, Maximize2, ExternalLink, X, Building2, Hospital, ShoppingBag, ShieldCheck } from 'lucide-react';

export const GajuriMap: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const googleMapsDirectionsUrl = "https://www.google.com/maps/place/RV3G%2BQX8,+Prithivi+Hwy,+Gajuri+45112/@27.8044269,84.8772498,89m/data=!3m1!1e3!4m6!3m5!1s0x3994d5c079084ced:0xe9c07790a0bf386b!8m2!3d27.8043579!4d84.8774255!16s%2Fg%2F11g1y_szp3?entry=ttu";

  const mapEmbedUrl = "https://maps.google.com/maps?q=27.8043579,84.8774255&t=m&z=17&ie=UTF8&iwloc=&output=embed";

  return (
    <div id="gajuri-map-container" className="relative w-full bg-[#12131C] rounded-3xl border border-[#D4AF37]/30 overflow-hidden shadow-2xl my-8">
      
      {/* Top Title Bar */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#12131C] via-[#1A1B28] to-[#12131C] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider">GAJURI CINEMAS LOCATION</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Find Us on Prithvi Highway (NH03)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Coordinates: 27.8043579° N, 84.8774255° E • Gajuri Bazar, Dhading, Nepal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            id="get-directions-btn"
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-xs shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-black" />
            <span>GET DIRECTIONS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            id="fullscreen-map-btn"
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">FULLSCREEN</span>
          </button>
        </div>
      </div>

      {/* Embedded Map Area */}
      <div className="relative w-full h-[480px] sm:h-[550px] bg-slate-900 overflow-hidden">
        
        {/* Clean Google Maps Embed iframe with full interactivity */}
        <iframe
          title="Gajuri Cinemas Google Map"
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'contrast(1.05) brightness(0.9) saturate(1.1)' }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      {/* Nearby Landmarks Grid */}
      <div className="p-6 sm:p-8 bg-[#090A0E] border-t border-white/10">
        <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Building2 className="w-4 h-4" />
          <span>NEARBY LANDMARKS IN GAJURI, DHADING:</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <p className="text-xs font-bold text-white">Gajuri Bazar</p>
              <p className="text-[10px] text-slate-400">50 meters away</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Hospital className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs font-bold text-white">Gajuri Hospital</p>
              <p className="text-[10px] text-slate-400">150 meters away</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">Big Mart Gajuri</p>
              <p className="text-[10px] text-slate-400">100 meters away</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">NH03 Prithvi Hwy</p>
              <p className="text-[10px] text-slate-400">Direct Road Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md p-4 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold font-serif text-white">Gajuri Cinemas - Fullscreen Interactive Map</h3>
              <p className="text-xs text-[#D4AF37]">Gajuri Bazar, Prithvi Highway, Dhading, Nepal</p>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 mt-4 rounded-2xl overflow-hidden border border-[#D4AF37]/50 relative">
            <iframe
              title="Gajuri Cinemas Google Map Fullscreen"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};
