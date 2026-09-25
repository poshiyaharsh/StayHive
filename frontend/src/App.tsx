import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';

// Layout & Protection
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SearchHotelsPage } from './pages/SearchHotelsPage';
import { BookingWizard } from './components/booking/BookingWizard';
import { DashboardPage } from './pages/DashboardPage';
import { HotelsPage } from './pages/HotelsPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomTypesPage } from './pages/RoomTypesPage';
import { BookingsPage } from './pages/BookingsPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { FoodOrdersPage } from './pages/FoodOrdersPage';
import { ServicesPage } from './pages/ServicesPage';
import { HousekeepingPage } from './pages/HousekeepingPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { StaffPage } from './pages/StaffPage';
import { CustomersPage } from './pages/CustomersPage';
import { OffersPage } from './pages/OffersPage';
import { CancellationsPage } from './pages/CancellationsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ProfilePage } from './pages/ProfilePage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <DatabaseProvider>
              <BrowserRouter>
              <Routes>
                {/* Public Landing & Direct Booking Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/search" element={<SearchHotelsPage />} />
                <Route path="/booking/new" element={<div className="min-h-screen p-4 sm:p-8 bg-slate-50 dark:bg-[#0B1120]"><BookingWizard /></div>} />

                {/* Operations & Platform Shell (Protected) */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/book" element={<BookingWizard />} />
                  <Route path="/booking" element={<BookingWizard />} />
                  <Route path="/hotels" element={<HotelsPage />} />
                  <Route path="/rooms" element={<RoomsPage />} />
                  <Route path="/room-types" element={<RoomTypesPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/bookings/:id" element={<BookingDetailsPage />} />
                  <Route path="/restaurant" element={<RestaurantPage />} />
                  <Route path="/food-orders" element={<FoodOrdersPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/housekeeping" element={<HousekeepingPage />} />
                  <Route path="/billing" element={<InvoicesPage />} />
                  <Route path="/staff" element={<StaffPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/cancellations" element={<CancellationsPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/complaints" element={<ComplaintsPage />} />
                  <Route path="/inquiries" element={<InquiriesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </DatabaseProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
