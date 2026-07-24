import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CinemaProvider, useCinema } from './context/CinemaContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { TrailerModal } from './components/TrailerModal';
import { SeatSelectionGrid } from './components/SeatSelectionGrid';
import { SnacksSelector } from './components/SnacksSelector';
import { PaymentModal } from './components/PaymentModal';
import { TicketSuccessModal } from './components/TicketSuccessModal';
import { PaymentProcessingView } from './components/PaymentProcessingView';
import { PaymentSuccessView } from './components/PaymentSuccessView';
import { PaymentFailedView } from './components/PaymentFailedView';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { ShowtimesView } from './views/ShowtimesView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLoginView } from './views/AdminLoginView';
import { StaffView } from './views/StaffView';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute';

const MainAppLayout: React.FC = () => {
  const { activeTab, setActiveTab, setStaffSubTab, activeStep, setActiveStep } = useCinema();
  const [paymentViewMode, setPaymentViewMode] = useState<'none' | 'verifying' | 'success' | 'failed'>('none');
  const [verifiedRef, setVerifiedRef] = useState('');
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);

      // Check if arriving from gateway redirect
      if (urlParams.has('gateway') || urlParams.has('pidx') || urlParams.has('PRN') || urlParams.has('data')) {
        setPaymentViewMode('verifying');
      } else if (pathname.startsWith('/staff') || hash.includes('staff')) {
        setActiveTab('staff');
        if (pathname.includes('/scanner') || hash.includes('scanner')) {
          setStaffSubTab('scanner');
        } else if (pathname.includes('/bookings') || hash.includes('bookings')) {
          setStaffSubTab('bookings');
        } else if (pathname.includes('/dashboard') || hash.includes('dashboard')) {
          setStaffSubTab('dashboard');
        } else if (pathname.includes('/login') || hash.includes('login')) {
          setStaffSubTab('login');
        }
      } else if (pathname.startsWith('/admin') || hash.includes('admin')) {
        setActiveTab('admin');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [setActiveTab, setStaffSubTab]);

  if (paymentViewMode === 'verifying') {
    return (
      <PaymentProcessingView
        onSuccess={(bookingRef) => {
          setVerifiedRef(bookingRef);
          setPaymentViewMode('success');
        }}
        onFailed={(err) => {
          setVerifyError(err);
          setPaymentViewMode('failed');
        }}
      />
    );
  }

  if (paymentViewMode === 'success') {
    return (
      <PaymentSuccessView
        bookingRef={verifiedRef || 'GAJ-8921K'}
        onReturnHome={() => {
          setPaymentViewMode('none');
          setActiveStep('movie');
          setActiveTab('home');
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  if (paymentViewMode === 'failed') {
    return (
      <PaymentFailedView
        errorMessage={verifyError}
        onRetry={() => {
          setPaymentViewMode('none');
          setActiveStep('payment');
        }}
        onChangeGateway={() => {
          setPaymentViewMode('none');
          setActiveStep('payment');
        }}
        onReturnHome={() => {
          setPaymentViewMode('none');
          setActiveStep('movie');
          setActiveTab('home');
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  if (activeStep === 'seats') return <SeatSelectionGrid />;
  if (activeStep === 'snacks') return <SnacksSelector />;
  if (activeStep === 'payment') return <PaymentModal />;
  if (activeStep === 'ticket') return <TicketSuccessModal />;

  switch (activeTab) {
    case 'movies':
      return <MoviesView />;
    case 'showtimes':
      return <ShowtimesView />;
    case 'account':
      return <CustomerAccountView />;
    case 'admin':
      return <AdminDashboardView />;
    case 'staff':
      return <StaffView />;
    case 'home':
    default:
      return <HomeView />;
  }
};

export default function App() {
  return (
    <CinemaProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#090A0E] dark:bg-[#090A0E] light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
            <Header />

            <main className="flex-1">
              <Routes>
                {/* Route /admin/login -> AdminLogin */}
                <Route path="/admin/login" element={<AdminLogin onSuccess={() => { window.location.href = '/admin'; }} />} />

                {/* Route /admin -> ProtectedAdminRoute -> AdminDashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute onRedirectToLogin={() => { window.location.href = '/admin/login'; }}>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Catch-all app route */}
                <Route path="*" element={<MainAppLayout />} />
              </Routes>
            </main>

            <TrailerModal />
            <ToastContainer />
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </CinemaProvider>
  );
}
