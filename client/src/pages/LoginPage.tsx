import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, User, Settings, ArrowRight, Package, BarChart3, Wrench, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';

const ROLES = [
  {
    userId: 'u1',
    label: 'Admin',
    desc: 'Full system access',
    icon: <Shield size={18} />,
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.12)',
  },
  {
    userId: 'u2',
    label: 'Asset Manager',
    desc: 'Manage & allocate assets',
    icon: <Settings size={18} />,
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.12)',
  },
  {
    userId: 'u4',
    label: 'Employee',
    desc: 'View & request assets',
    icon: <User size={18} />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
];

const FEATURES = [
  { icon: <Package size={20} />, label: 'Asset Registry', desc: 'Track every asset lifecycle', color: '#6366F1' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', desc: 'Real-time utilization insights', color: '#22C55E' },
  { icon: <Wrench size={20} />, label: 'Maintenance', desc: 'Kanban-driven workflows', color: '#F59E0B' },
  { icon: <Sparkles size={20} />, label: 'AI Assistant', desc: 'Smart recommendations', color: '#A855F7' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('u1');
  const [loading, setLoading] = useState(false);

  const selectedUser = users.find(u => u.id === selectedRole);

  function handleLogin() {
    setLoading(true);
    setTimeout(() => {
      login(selectedRole);
      navigate('/dashboard');
    }, 600);
  }

  return (
    <div className="login-page">
      {/* Background glows */}
      <div
        className="login-bg-glow"
        style={{ background: 'rgba(99,102,241,0.12)', top: '-200px', left: '-200px' }}
      />
      <div
        className="login-bg-glow"
        style={{ background: 'rgba(168,85,247,0.08)', bottom: '-200px', right: '-100px' }}
      />

      {/* Left — Branding panel */}
      <div className="login-left">
        <div style={{ maxWidth: 460, width: '100%' }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div className="login-logo-icon">
              <Zap size={22} color="white" />
            </div>
            <span className="login-logo-text">AssetFlow</span>
          </div>

          <h1 style={{
            fontSize: '2.6rem', fontWeight: 800, color: 'var(--text-primary)',
            letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 16,
          }}>
            Manage assets<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              intelligently.
            </span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 48, maxWidth: 380 }}>
            A unified platform to track, allocate, and maintain your organization's assets — with AI-powered insights.
          </p>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FEATURES.map(f => (
              <div
                key={f.label}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'border-color var(--transition)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${f.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login panel */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-heading">Welcome back</h2>
          <p className="login-subheading">
            Select your role to sign in and explore the platform.
          </p>

          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {ROLES.map(role => (
              <div
                key={role.userId}
                id={`role-${role.userId}`}
                onClick={() => setSelectedRole(role.userId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${selectedRole === role.userId ? role.color : 'var(--border)'}`,
                  background: selectedRole === role.userId ? role.bg : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: selectedRole === role.userId ? role.bg : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selectedRole === role.userId ? role.color : 'var(--text-muted)',
                  border: `1px solid ${selectedRole === role.userId ? `${role.color}40` : 'var(--border)'}`,
                  transition: 'all var(--transition)',
                  flexShrink: 0,
                }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.895rem', fontWeight: 600,
                    color: selectedRole === role.userId ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>
                    {role.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    {role.desc}
                  </div>
                </div>
                {selectedRole === role.userId && (
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: role.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User info preview */}
          {selectedUser && (
            <div style={{
              padding: '12px 14px', marginBottom: 20,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedUser.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {selectedUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Sign in button */}
          <button
            id="login-btn"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', gap: 10 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <svg
                style={{ animation: 'spin 0.8s linear infinite', width: 16, height: 16 }}
                viewBox="0 0 24 24" fill="none"
              >
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <>Sign in to AssetFlow <ArrowRight size={16} /></>
            )}
          </button>

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
            This is a demo. No credentials required. Select any role above.
          </p>
        </div>
      </div>
    </div>
  );
}
