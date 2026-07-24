import React from 'react';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminDashboard } from '../pages/AdminDashboard';
import { useCinema } from '../context/CinemaContext';

export const AdminDashboardView: React.FC = () => {
  const { setActiveTab } = useCinema();

  return (
    <ProtectedAdminRoute
      onRedirectToLogin={() => {
        setActiveTab('admin');
      }}
    >
      <AdminDashboard />
    </ProtectedAdminRoute>
  );
};
