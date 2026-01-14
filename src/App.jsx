import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogisticsProvider } from './context/LogisticsContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BookingPortal from './components/BookingPortal';
import SlotGrid from './components/SlotGrid';

import ScheduleUpload from './components/ScheduleUpload';
import LiveOperations from './components/LiveOperations';

// Helper to determine default path based on role
const getDefaultPath = (role) => {
  switch (role) {
    case 'vendor': return '/bookings';
    case 'warehouse_employee': return '/live-operations';
    default: return '/dashboard';
  }
};

// Helper Route Wrapper to enforce roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <div className="p-10 text-center">Loading...</div>; // Should not happen in this mock

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their default home
    return <Navigate to={getDefaultPath(user.role)} replace />;
  }
  return children;
};

// Root Redirector
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={getDefaultPath(user.role)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LogisticsProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<RootRedirect />} />

              {/* Admin Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/capacity" element={
                <ProtectedRoute allowedRoles={['admin', 'warehouse_employee']}>
                  <SlotGrid />
                </ProtectedRoute>
              } />
              <Route path="/live-operations" element={
                <ProtectedRoute allowedRoles={['warehouse_employee']}>
                  <LiveOperations />
                </ProtectedRoute>
              } />
              <Route path="/upload-schedule" element={
                <ProtectedRoute allowedRoles={['admin', 'warehouse_employee']}>
                  <ScheduleUpload />
                </ProtectedRoute>
              } />


              {/* Vendor Routes */}
              <Route path="/bookings" element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}> {/* Admin allows viewing bookings for demo, but nav is hidden */}
                  <BookingPortal />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </Layout>
        </LogisticsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
