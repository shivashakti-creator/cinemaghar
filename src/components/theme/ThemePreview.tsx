import React from 'react';
import { Theme } from '../../types/theme';
import { Monitor, Sun, Moon, Film, Ticket } from 'lucide-react';

interface ThemePreviewProps {
  type: Theme;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ type }) => {
  if (type === 'light') {
    return (
      <div className="w-full h-32 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden relative p-2 shadow-inner flex flex-col justify-between">
        {/* Mock Light Header */}
        <div className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1">
            <Film className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[10px] font-bold font-serif text-[#D4AF37]">GAJURI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-slate-300 font-medium">
            <span className="bg-[#D4AF37] text-black px-1.5 py-0.5 rounded font-bold">VIP</span>
          </div>
        </div>

        {/* Mock Light Body */}
        <div className="grid grid-cols-3 gap-1.5 my-1">
          <div className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-200 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-800 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
          <div className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-200 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-800 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
          <div className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-200 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-800 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dark') {
    return (
      <div className="w-full h-32 rounded-xl bg-[#090A0E] border border-white/10 overflow-hidden relative p-2 shadow-inner flex flex-col justify-between">
        {/* Mock Dark Header */}
        <div className="bg-[#12131C] text-white rounded-lg px-2.5 py-1.5 flex items-center justify-between border border-[#D4AF37]/30 shadow-sm">
          <div className="flex items-center gap-1">
            <Film className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[10px] font-bold font-serif text-[#D4AF37]">GAJURI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-amber-200 font-medium">
            <span className="bg-[#D4AF37] text-black px-1.5 py-0.5 rounded font-bold">VIP</span>
          </div>
        </div>

        {/* Mock Dark Body */}
        <div className="grid grid-cols-3 gap-1.5 my-1">
          <div className="bg-[#12131C] rounded-lg p-1.5 border border-white/10 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-800 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
          <div className="bg-[#12131C] rounded-lg p-1.5 border border-white/10 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-800 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
          <div className="bg-[#12131C] rounded-lg p-1.5 border border-white/10 shadow-sm space-y-1">
            <div className="w-full h-6 bg-slate-800 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
            <div className="w-1/2 h-1 bg-[#D4AF37] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // System mode split diagonal preview
  return (
    <div className="w-full h-32 rounded-xl border border-amber-500/30 overflow-hidden relative p-2 shadow-inner flex flex-col justify-between bg-gradient-to-r from-slate-200 via-slate-500 to-[#090A0E]">
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
        <div className="bg-[#12131C] border border-[#D4AF37] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
          <Monitor className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] font-bold text-amber-200">OS Auto Sync</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] text-slate-800 dark:text-slate-200 relative z-10 px-1 pt-1 font-bold">
        <span className="bg-white/80 px-1.5 py-0.5 rounded text-black flex items-center gap-1">
          <Sun className="w-2.5 h-2.5 text-amber-600" /> Day
        </span>
        <span className="bg-black/80 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
          <Moon className="w-2.5 h-2.5 text-amber-300" /> Night
        </span>
      </div>
    </div>
  );
};
