import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  onRedirectToLogin?: () => void;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children, onRedirectToLogin }) => {
  const { profile, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 rounded-3xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold font-serif text-white">Verifying Admin Privileges</h3>
          <p className="text-xs text-slate-400">Communicating with Supabase authentication engine...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-2xl font-black font-serif text-white">Access Restricted</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are attempting to access the Gajuri Cinemas Control Tower. Your current role{' '}
            <span className="text-[#D4AF37] font-bold">({profile?.role || 'unauthenticated'})</span> does not possess administrative privileges.
          </p>
        </div>
        <button
          id="protected-route-login-btn"
          onClick={() => {
            if (onRedirectToLogin) {
              onRedirectToLogin();
            } else {
              window.location.hash = '#admin';
              window.location.href = '/admin/login';
            }
          }}
          className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
        >
          GO TO ADMIN LOGIN
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
