import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Wrench,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../data/mockData';

interface NavItemDef {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

const navItems: NavItemDef[] = [
  { label: 'Dashboard',        to: '/dashboard',  icon: <LayoutDashboard size={17} />, section: 'Main' },
  { label: 'Assets',           to: '/assets',     icon: <Package size={17} /> },
  { label: 'Allocation',       to: '/allocation', icon: <ArrowLeftRight size={17} /> },
  { label: 'Maintenance',      to: '/maintenance',icon: <Wrench size={17} /> },
  { label: 'Resource Booking', to: '/booking',    icon: <CalendarDays size={17} /> },
  { label: 'Reports',          to: '/reports',    icon: <BarChart3 size={17} />, section: 'Insights' },
  { label: 'AI Assistant',     to: '/ai',         icon: <Sparkles size={17} />, badge: 0 },
  { label: 'Settings',         to: '/settings',   icon: <Settings size={17} />, section: 'System' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  let currentSection = '';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={16} color="white" />
        </div>
        <span className="sidebar-logo-text">AssetFlow</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (item.section) currentSection = item.section;

          return (
            <React.Fragment key={item.to}>
              {showSection && !collapsed && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
                data-tooltip={collapsed ? item.label : undefined}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-text">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 12px 8px',
          padding: '7px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all var(--transition)',
          fontSize: '0.75rem',
          gap: 6,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="nav-item-text" style={{ fontSize: '0.75rem' }}>Collapse</span></>}
      </button>

      {/* User */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => setShowUserMenu(p => !p)}
        >
          <div className="user-avatar">
            {user ? getInitials(user.name) : 'AF'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name ?? 'Guest'}</div>
            <div className="user-role">{user?.role?.replace('_', ' ') ?? 'Unknown'}</div>
          </div>
        </div>

        {showUserMenu && (
          <div
            style={{
              marginTop: 6,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '9px 12px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--danger)', fontSize: '0.82rem', fontFamily: 'var(--font)',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
