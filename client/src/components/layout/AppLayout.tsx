import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <Header />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
