import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ArrowLeftRight, Wrench, CalendarDays,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Activity, ArrowRight, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  assets, allocationRecords, maintenanceRequests, bookings,
  monthlyAssetData, categoryBreakdown, maintenanceTrend,
  getUserById, getAssetById, formatDate,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';

// ── Custom tooltip for recharts ────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: '0.78rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── KPI derivations ─────────────────────────────────────
  const kpis = useMemo(() => {
    const totalAssets    = assets.length;
    const available      = assets.filter(a => a.status === 'available').length;
    const allocated      = assets.filter(a => a.status === 'allocated').length;
    const maintenance    = assets.filter(a => a.status === 'maintenance').length;
    const utilization    = Math.round((allocated / totalAssets) * 100);
    const pendingMaint   = maintenanceRequests.filter(m => m.status === 'pending').length;
    const activeAlloc    = allocationRecords.filter(r => r.status === 'active').length;
    const overdueAlloc   = allocationRecords.filter(r => r.status === 'overdue').length;
    const upcomingBook   = bookings.filter(b => b.status === 'upcoming').length;
    return { totalAssets, available, allocated, maintenance, utilization, pendingMaint, activeAlloc, overdueAlloc, upcomingBook };
  }, []);

  // ── Recent activity feed ─────────────────────────────────
  const recentActivity = useMemo(() => {
    const items: { icon: React.ReactNode; bg: string; color: string; title: string; meta: string }[] = [];
    allocationRecords.slice(0, 3).forEach(r => {
      const u = getUserById(r.userId);
      const a = getAssetById(r.assetId);
      items.push({
        icon: <ArrowLeftRight size={14} />, bg: 'var(--accent-light)', color: 'var(--accent)',
        title: `${a?.name ?? r.assetId} allocated to ${u?.name ?? r.userId}`,
        meta: formatDate(r.allocatedAt),
      });
    });
    maintenanceRequests.filter(m => m.status === 'resolved').slice(0, 2).forEach(m => {
      const a = getAssetById(m.assetId);
      items.push({
        icon: <CheckCircle size={14} />, bg: 'var(--success-light)', color: 'var(--success)',
        title: `Maintenance resolved: ${a?.name ?? m.assetId}`,
        meta: formatDate(m.resolvedAt ?? m.raisedAt),
      });
    });
    maintenanceRequests.filter(m => m.status === 'pending').slice(0, 2).forEach(m => {
      const a = getAssetById(m.assetId);
      items.push({
        icon: <AlertTriangle size={14} />, bg: 'var(--warning-light)', color: 'var(--warning)',
        title: `Maintenance pending: ${a?.name ?? m.assetId}`,
        meta: formatDate(m.raisedAt),
      });
    });
    return items.slice(0, 6);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome bar ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening across your asset portfolio today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/assets')}>
            <Package size={15} /> View Assets
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/allocation')}>
            <Plus size={15} /> New Allocation
          </button>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────── */}
      <div className="kpi-grid">
        <KpiCard
          icon={<Package size={20} />}
          iconBg="var(--accent-light)" iconColor="var(--accent)"
          label="Total Assets" value={kpis.totalAssets}
          trend={`${kpis.available} available`} trendDir="up"
        />
        <KpiCard
          icon={<ArrowLeftRight size={20} />}
          iconBg="var(--info-light)" iconColor="var(--info)"
          label="Active Allocations" value={kpis.activeAlloc}
          trend={kpis.overdueAlloc > 0 ? `${kpis.overdueAlloc} overdue` : 'All on time'} trendDir={kpis.overdueAlloc > 0 ? 'down' : 'up'}
        />
        <KpiCard
          icon={<Wrench size={20} />}
          iconBg="var(--warning-light)" iconColor="var(--warning)"
          label="Pending Maintenance" value={kpis.pendingMaint}
          trend={`${kpis.maintenance} in repair`} trendDir={kpis.pendingMaint > 3 ? 'down' : 'neutral'}
        />
        <KpiCard
          icon={<Activity size={20} />}
          iconBg="var(--success-light)" iconColor="var(--success)"
          label="Utilization Rate" value={`${kpis.utilization}%`}
          trend={`${kpis.allocated}/${kpis.totalAssets} deployed`} trendDir="up"
        />
        <KpiCard
          icon={<CalendarDays size={20} />}
          iconBg="var(--teal-light)" iconColor="var(--teal)"
          label="Upcoming Bookings" value={kpis.upcomingBook}
          trend="Next 7 days" trendDir="neutral"
        />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Area chart: Asset utilization trend */}
        <div className="chart-card">
          <div className="chart-title">Asset Status Trend</div>
          <div className="chart-subtitle">Monthly breakdown — last 6 months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyAssetData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gAlloc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAvail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 8 }} />
              <Area type="monotone" dataKey="allocated" name="Allocated" stroke="#6366F1" strokeWidth={2} fill="url(#gAlloc)" dot={false} />
              <Area type="monotone" dataKey="available" name="Available" stroke="#22C55E" strokeWidth={2} fill="url(#gAvail)" dot={false} />
              <Area type="monotone" dataKey="maintenance" name="Maintenance" stroke="#F59E0B" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: Category breakdown */}
        <div className="chart-card">
          <div className="chart-title">Assets by Category</div>
          <div className="chart-subtitle">Distribution across {assets.length} total assets</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {categoryBreakdown.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{c.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Maintenance trend bar chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div className="chart-title">Maintenance Requests</div>
              <div className="chart-subtitle">Raised vs resolved — last 6 months</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/maintenance')}
              style={{ gap: 4, color: 'var(--accent)' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={maintenanceTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={16} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 8 }} />
              <Bar dataKey="requests" name="Raised" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity feed */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="chart-title">Recent Activity</div>
              <div className="chart-subtitle">Latest system events</div>
            </div>
            <Clock size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {recentActivity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div className="activity-body">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-meta">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions row ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { label: 'Allocate an Asset',     icon: <ArrowLeftRight size={18}/>, to: '/allocation', color: '#6366F1' },
          { label: 'Log Maintenance',       icon: <Wrench size={18}/>,          to: '/maintenance', color: '#F59E0B' },
          { label: 'Book a Resource',       icon: <CalendarDays size={18}/>,    to: '/booking',    color: '#14B8A6' },
          { label: 'View Reports',          icon: <TrendingUp size={18}/>,      to: '/reports',    color: '#22C55E' },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all var(--transition)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${action.color}50`;
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--radius-md)',
              background: `${action.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: action.color, flexShrink: 0,
            }}>
              {action.icon}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{action.label}</span>
            <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────

function KpiCard({
  icon, iconBg, iconColor, label, value, trend, trendDir,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string | number;
  trend?: string; trendDir?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrap" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {trend && (
          <div className={`kpi-trend ${trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : ''}`}>
            {trendDir === 'up' ? <TrendingUp size={11} style={{ display: 'inline', marginRight: 3 }} /> :
             trendDir === 'down' ? <TrendingDown size={11} style={{ display: 'inline', marginRight: 3 }} /> : null}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
