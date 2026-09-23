import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { ReceptionDashboard } from '../components/dashboard/ReceptionDashboard';
import { HousekeepingDashboard } from '../components/dashboard/HousekeepingDashboard';
import { RestaurantDashboard } from '../components/dashboard/RestaurantDashboard';
import { CustomerDashboard } from '../components/dashboard/CustomerDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return <AdminDashboard />;
    case 'RECEPTION':
      return <ReceptionDashboard />;
    case 'HOUSEKEEPING':
      return <HousekeepingDashboard />;
    case 'RESTAURANT':
      return <RestaurantDashboard />;
    case 'CUSTOMER':
      return <CustomerDashboard />;
    default:
      return <AdminDashboard />;
  }
};
