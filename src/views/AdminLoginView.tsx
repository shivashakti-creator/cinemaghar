import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { ShieldCheck, Lock, Mail, KeyRound, Sparkles, Film, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginView: React.FC = () => {
  const { loginAdmin, showToast } = useCinema();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in both email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await loginAdmin(email, password, rememberMe);
      if (!success) {
        showToast('Invalid credentials. Use admin@gajuricinemas.com / admin123', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@gajuricinemas.com');
    setPassword('admin123');
    showToast('Demo admin credentials filled', 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#0F1018]/90 backdrop-blur-2xl border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(212,175,55,0.25)] relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
            GAJURI CINEMAS
          </h1>
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Control Tower Admin Portal
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Banner */}
        <div className="bg-[#181A26] border border-[#D4AF37]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-white font-bold">Demo Owner Login</p>
            <p className="text-slate-400 text-[11px]">admin@gajuricinemas.com / admin123</p>
          </div>
          <button
            id="fill-demo-credentials-btn"
            type="button"
            onClick={fillDemoCredentials}
            className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-[11px] hover:bg-amber-400 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gajuricinemas.com"
                required
                className="w-full bg-[#161722] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#161722] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 text-[#D4AF37] focus:ring-0 bg-[#161722]"
              />
              <span className="text-xs">Remember Login Session</span>
            </label>
            <span className="text-[11px] text-[#D4AF37] font-medium">Protected SSL</span>
          </div>

          {/* Submit Button */}
          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#997A15] hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>ACCESS ADMIN DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10 text-[11px] text-slate-400">
          Gajuri Cinemas Operating System v3.4 • Nepal
        </div>

      </motion.div>
    </div>
  );
};
