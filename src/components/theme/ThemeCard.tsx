import React from 'react';
import { ThemeCardProps } from '../../types/theme';
import { ThemePreview } from './ThemePreview';
import { Sun, Moon, Laptop, CheckCircle2 } from 'lucide-react';

export const ThemeCard: React.FC<ThemeCardProps> = ({
  id,
  title,
  description,
  icon,
  selected,
  onSelect
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-amber-300" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
      className={`group relative rounded-3xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
        selected
          ? 'bg-amber-500/10 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-[1.02]'
          : 'bg-white dark:bg-[#12131C] border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 hover:bg-slate-50 dark:hover:bg-[#1A1B28]'
      }`}
    >
      {/* Top Bar: Icon, Title & Radio Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl ${
              selected
                ? 'bg-[#D4AF37] text-black shadow-lg'
                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200'
            }`}
          >
            {renderIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Radio Circle Indicator */}
        <div className="shrink-0 pt-0.5">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected
                ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                : 'border-slate-300 dark:border-slate-600 bg-transparent'
            }`}
          >
            {selected && <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />}
          </div>
        </div>
      </div>

      {/* Visual Preview Box */}
      <div className="pt-2">
        <ThemePreview type={id} />
      </div>

      {/* Selection Label */}
      <div
        className={`text-center py-2 rounded-xl text-xs font-bold transition-all ${
          selected
            ? 'bg-[#D4AF37] text-black shadow-md'
            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'
        }`}
      >
        {selected ? 'ACTIVE THEME' : 'SELECT THEME'}
      </div>
    </div>
  );
};
