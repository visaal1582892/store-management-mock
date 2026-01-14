import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LogisticsProvider } from './context/LogisticsContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BookingPortal from './components/BookingPortal';
import SlotGrid from './components/SlotGrid';
import OperationsPortal from './components/OperationsPortal';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <AuthProvider>
      <LogisticsProvider>
        <Layout activePage={activePage} setActivePage={setActivePage}>
          <div className="animate-in fade-in duration-500">
            {activePage === 'Dashboard' && <Dashboard />}
            {activePage === 'Bookings' && <BookingPortal />}
            {activePage === 'Capacity' && <SlotGrid />}
            {activePage === 'Exceptions' && <OperationsPortal />}
          </div>
        </Layout>
      </LogisticsProvider>
    </AuthProvider>
  );
}

export default App;
