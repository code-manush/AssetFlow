import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ShieldCheck, Cpu, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />

      {/* Header */}
      <header style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/AssetFlow.png" alt="AssetFlow Logo" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>AssetFlow</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <ThemeToggle />
          <button
            onClick={handleGetStarted}
            className="btn btn-primary"
            style={{ padding: '8px 24px', borderRadius: '999px', fontWeight: 600 }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)', padding: '6px 16px',
          borderRadius: '999px', border: '1px solid var(--border)',
          marginBottom: 32, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)'
        }}>
          <SparkleIcon />
          <span>Introducing AI-Powered Asset Management</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 6vw, 4.5rem)',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          marginBottom: 24,
          maxWidth: '800px'
        }}>
          Manage your assets with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            unmatched intelligence.
          </span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          lineHeight: 1.6,
          marginBottom: 48
        }}>
          AssetFlow is the ultimate platform to track, allocate, and maintain your organization's resources, driven by advanced analytics and seamless workflows.
        </p>

        <button
          onClick={handleGetStarted}
          className="btn btn-primary btn-lg"
          style={{
            padding: '16px 36px',
            fontSize: '1.1rem',
            borderRadius: '999px',
            gap: 12,
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
          }}
        >
          Get Started for Free <ArrowRight size={20} />
        </button>

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 80,
          maxWidth: '1000px',
          width: '100%'
        }}>
          <FeatureCard
            icon={<ShieldCheck size={24} color="#22C55E" />}
            title="Secure Allocation"
            desc="Keep track of exactly who has what with our secure allocation system."
            bg="rgba(34, 197, 94, 0.1)"
          />
          <FeatureCard
            icon={<BarChart2 size={24} color="#6366F1" />}
            title="Real-time Analytics"
            desc="Make data-driven decisions with real-time insights and customizable reporting."
            bg="rgba(99, 102, 241, 0.1)"
          />
          <FeatureCard
            icon={<Cpu size={24} color="#A855F7" />}
            title="Automated Maintenance"
            desc="Predict and schedule maintenance automatically to prevent downtime."
            bg="rgba(168, 85, 247, 0.1)"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '32px',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
    >
      <div style={{
        width: 48, height: 48, borderRadius: '12px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#F59E0B' }}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
