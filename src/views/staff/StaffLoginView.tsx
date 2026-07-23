import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { ShieldCheck, Lock, Mail, UserCheck, Eye, EyeOff, Film, KeyRound, ArrowRight, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';

export const StaffLoginView: React.FC = () => {
  const { loginStaff, showToast } = useCinema();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Staff ID or Email');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginStaff(identifier, password, rememberDevice);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials or inactive staff account');
      }
    } catch (err) {
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (id: string, name: string) => {
    setIdentifier(id);
    setPassword('staff123');
    setErrorMessage('');
    showToast(`Autofilled demo credentials for ${name}`, 'info');
  };

  return (
    <div className="min-h-[85vh] bg-[#050508] py-8 sm:py-16 px-4 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#0A0A0A] p-0.5 shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
              <Film className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-wide">
            Gajuri Staff Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Authorized Cinema Ticket Scanning & Counter Verification System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0C0D14] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Staff Authentication
              </span>
            </div>
            <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-mono font-bold">
              GATE SECURE
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Staff ID or Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff ID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. STF-001 or staff@gajuri.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#131420] border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#D4AF37] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#131420] border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Device Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded bg-[#131420] border-white/20 text-[#D4AF37] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember this scanning device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#B8860B] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login to Staff Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Autofill Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Quick Demo Staff Logins</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STF-002', 'Sita Thapa (Gate Scanner)')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-left transition-all group"
              >
                <span className="block font-bold text-xs text-amber-300 group-hover:text-amber-200">STF-002</span>
                <span className="block text-[10px] text-slate-400 truncate">Gate Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('STF-001', 'Ramesh Sharma (Counter)')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-left transition-all group"
              >
                <span className="block font-bold text-xs text-amber-300 group-hover:text-amber-200">STF-001</span>
                <span className="block text-[10px] text-slate-400 truncate">Counter Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('STF-003', 'Bikash Gurung (Manager)')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-left transition-all group"
              >
                <span className="block font-bold text-xs text-amber-300 group-hover:text-amber-200">STF-003</span>
                <span className="block text-[10px] text-slate-400 truncate">Manager</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Assistance Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131D] border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Staff Credential Recovery</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have forgotten your Staff ID or password, please contact the Gajuri Cinema IT Administrator or General Manager directly at the central control counter.
            </p>
            <div className="p-3 bg-white/5 rounded-xl text-xs font-mono text-amber-300 text-left space-y-1">
              <p>📍 Admin Office: Gate 1, Gajuri Hall</p>
              <p>📞 Emergency Line: +977 9841234567</p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
            >
              Close & Return
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
