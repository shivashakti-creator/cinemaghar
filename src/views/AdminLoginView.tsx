import React from 'react';
import { AdminLogin } from '../pages/AdminLogin';
import { useCinema } from '../context/CinemaContext';

export const AdminLoginView: React.FC = () => {
  const { setActiveTab } = useCinema();

  return (
    <AdminLogin
      onSuccess={() => {
        setActiveTab('admin');
      }}
    />
  );
};
