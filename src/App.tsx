import React, { useEffect } from 'react';
import { CinemaProvider, useCinema } from './context/CinemaContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { TrailerModal } from './components/TrailerModal';
import { SeatSelectionGrid } from './components/SeatSelectionGrid';
import { SnacksSelector } from './components/SnacksSelector';
import { PaymentModal } from './components/PaymentModal';
import { TicketSuccessModal } from './components/TicketSuccessModal';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { ShowtimesView } from './views/ShowtimesView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLoginView } from './views/AdminLoginView';
import { StaffView } from './views/StaffView';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, setStaffSubTab, activeStep, isAdmin } = useCinema();

  // URL Hash/Path routing synchronization
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (pathname.startsWith('/staff') || hash.includes('staff')) {
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

  // If user is currently inside an active booking flow step
  if (activeStep === 'seats') {
    return <SeatSelectionGrid />;
  }
  if (activeStep === 'snacks') {
    return <SnacksSelector />;
  }
  if (activeStep === 'payment') {
    return <PaymentModal />;
  }
  if (activeStep === 'ticket') {
    return <TicketSuccessModal />;
  }

  // Otherwise render primary views based on tab
  switch (activeTab) {
    case 'movies':
      return <MoviesView />;
    case 'showtimes':
      return <ShowtimesView />;
    case 'account':
      return <CustomerAccountView />;
    case 'admin':
      return isAdmin ? <AdminDashboardView /> : <AdminLoginView />;
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
      <div className="min-h-screen bg-[#090A0E] text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
        {/* Navigation Header */}
        <Header />

        {/* Dynamic Main Body */}
        <main className="flex-1">
          <MainContent />
        </main>

        {/* Global Trailer Video Modal */}
        <TrailerModal />

        {/* Floating Toast Feedback Notifications */}
        <ToastContainer />

        {/* Footer */}
        <Footer />
      </div>
    </CinemaProvider>
  );
}
