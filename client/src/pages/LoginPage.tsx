import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Package, BarChart3, Wrench, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  { icon: <Package size={20} />, label: 'Asset Registry', desc: 'Track every asset lifecycle', color: '#6366F1' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', desc: 'Real-time utilization insights', color: '#22C55E' },
  { icon: <Wrench size={20} />, label: 'Maintenance', desc: 'Kanban-driven workflows', color: '#F59E0B' },
  { icon: <Sparkles size={20} />, label: 'AI Assistant', desc: 'Smart recommendations', color: '#A855F7' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
      const body = isSignUp ? { name, email, password } : { email, password };
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ position: 'relative' }}>
      <ThemeToggle style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }} />
      <div className="login-bg-glow" style={{ background: 'rgba(99,102,241,0.12)', top: '-200px', left: '-200px' }} />
      <div className="login-bg-glow" style={{ background: 'rgba(168,85,247,0.08)', bottom: '-200px', right: '-100px' }} />

      <div className="login-left">
        <div style={{ maxWidth: 460, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <img src="/AssetFlow.png" alt="AssetFlow Logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <span className="login-logo-text">AssetFlow</span>
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 16 }}>
            Manage assets<br />
            <span style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              intelligently.
            </span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 48, maxWidth: 380 }}>
            A unified platform to track, allocate, and maintain your organization's assets — with AI-powered insights.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
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

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-heading">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          <p className="login-subheading" style={{ marginBottom: 24 }}>{isSignUp ? 'Register to join the platform' : 'Enter your credentials to access the platform.'}</p>

          {error && <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', gap: 10, marginTop: 10 }}
              disabled={loading}
            >
              {loading ? (isSignUp ? 'Creating...' : 'Signing In...') : <><LogIn size={16} /> {isSignUp ? 'Sign Up' : 'Sign In'}</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
