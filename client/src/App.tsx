import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AllocationPage from './pages/Allocation';
import MaintenancePage from './pages/Maintenance';
import ResourceBooking from './pages/ResourceBooking';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { RouteIcon } from 'lucide-react';
import AIAssistantPage from './pages/AIAssistantPage';


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — inside AppLayout */}
            <Route element={<DataProvider><AppLayout /></DataProvider>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai" element={<AIAssistantPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />
              <Route path="/allocation" element={<AllocationPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/booking" element={<ResourceBooking />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
