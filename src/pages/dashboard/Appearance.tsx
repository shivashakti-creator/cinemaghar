import React from 'react';
import { ThemeSelector } from '../../components/theme/ThemeSelector';
import { useTheme } from '../../hooks/useTheme';
import { useCinema } from '../../context/CinemaContext';
import { Sparkles, ShieldCheck, Monitor, Smartphone, Moon, Sun } from 'lucide-react';

export const Appearance: React.FC = () => {
  const { theme, resolvedTheme } = useTheme();
  const { user } = useCinema() || {};

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          <h1 className="text-3xl font-extrabold font-serif text-slate-900 dark:text-white tracking-wide">
            Appearance
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose how the cinema website looks for your account.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <ThemeSelector />

      {/* Persistence & Active Status Information Banner */}
      <div className="bg-slate-100 dark:bg-[#12131C] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-2xl text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Automatic Persistence & Sync
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {user?.email
                  ? `Your theme preference (${theme.toUpperCase()}) is saved to your account (${user.email}) in Supabase.`
                  : `Your theme preference (${theme.toUpperCase()}) is saved in local browser storage.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#1A1B28] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-medium">
            <span>Currently Active:</span>
            <span className="font-bold text-[#D4AF37] uppercase flex items-center gap-1">
              {resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              {resolvedTheme} Mode
            </span>
          </div>
        </div>

        {theme === 'system' && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              System mode detects your Operating System setting and automatically switches between day & night styles.
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
