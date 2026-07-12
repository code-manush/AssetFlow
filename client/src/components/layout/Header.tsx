import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Package,
  Wrench,
  ArrowLeftRight,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ROUTE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  '/dashboard':  { label: 'Dashboard',        icon: <LayoutDashboard size={14} /> },
  '/assets':     { label: 'Assets',           icon: <Package size={14} /> },
  '/allocation': { label: 'Allocation',       icon: <ArrowLeftRight size={14} /> },
  '/maintenance':{ label: 'Maintenance',      icon: <Wrench size={14} /> },
  '/booking':    { label: 'Resource Booking', icon: <CalendarDays size={14} /> },
  '/reports':    { label: 'Reports',          icon: <BarChart3 size={14} /> },
  '/ai':         { label: 'AI Assistant',     icon: <Sparkles size={14} /> },
  '/settings':   { label: 'Settings',         icon: <Settings size={14} /> },
};

const NOTIFICATIONS = [
  { id: 1, text: '2 maintenance requests pending approval', time: '5m ago', type: 'warning' },
  { id: 2, text: 'Asset AF-LPT-002 is overdue for return', time: '1h ago', type: 'danger' },
  { id: 3, text: 'Transfer request approved by Alex Rivera', time: '3h ago', type: 'success' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');

  const route = ROUTE_LABELS[location.pathname];

  return (
    <header className="main-header">
      {/* Breadcrumb */}
      <div className="header-breadcrumb">
        <span className="breadcrumb-root">AssetFlow</span>
        {route && (
          <>
            <ChevronRight size={13} className="breadcrumb-sep" style={{ color: 'var(--text-disabled)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} className="breadcrumb-current">
              {route.icon}
              {route.label}
            </span>
          </>
        )}
      </div>

      {/* Search */}
      <div className="header-search">
        <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          placeholder="Search assets, users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && search.trim()) {
              navigate(`/assets?q=${encodeURIComponent(search.trim())}`);
              setSearch('');
            }
          }}
        />
        <kbd style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          background: 'var(--bg-base)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '2px 5px', fontFamily: 'monospace',
        }}>⌘K</kbd>
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Theme toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifs(p => !p)}
            aria-label="Notifications"
            id="notif-btn"
          >
            <Bell size={17} />
            <span className="notif-dot" />
          </button>

          {showNotifs && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowNotifs(false)}
              />
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 320, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  <span style={{
                    fontSize: '0.68rem', background: 'var(--danger)', color: 'white',
                    padding: '2px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700,
                  }}>
                    {NOTIFICATIONS.length} new
                  </span>
                </div>
                {NOTIFICATIONS.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'background var(--transition)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50', marginTop: 5, flexShrink: 0,
                        background: n.type === 'warning' ? 'var(--warning)'
                          : n.type === 'danger' ? 'var(--danger)' : 'var(--success)',
                      }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {n.text}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <button
                    style={{
                      fontSize: '0.78rem', color: 'var(--accent)', background: 'none',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                    onClick={() => setShowNotifs(false)}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
