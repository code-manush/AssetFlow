import React, { useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { Download, BarChart3, TrendingUp, Package, Wrench } from 'lucide-react';
import {
    assets, allocationRecords, maintenanceRequests, departments,
    monthlyAssetData, maintenanceTrend, categoryBreakdown,
} from '../data/mockData';

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
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

// Assets by department
const assetsByDept = departments.map(d => ({
    name: d.name.split(' ')[0],
    assets: assets.filter(a => a.department === d.id).length,
}));

// Asset value by category
const valueByCategory = [
    { name: 'Laptops', value: 6048 },
    { name: 'Desktops', value: 1200 },
    { name: 'Mobile', value: 2198 },
    { name: 'Servers', value: 8500 },
    { name: 'Network', value: 3200 },
    { name: 'Other', value: 2249 },
];

const REPORT_TABS = ['Overview', 'Assets', 'Maintenance', 'Utilization'] as const;
type ReportTab = typeof REPORT_TABS[number];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('Overview');

    const totalValue = assets.reduce((s, a) => s + a.purchasePrice, 0);
    const utilizationRate = Math.round((assets.filter(a => a.status === 'allocated').length / assets.length) * 100);
    const resolvedRate = Math.round((maintenanceRequests.filter(m => m.status === 'resolved').length / maintenanceRequests.length) * 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Header ─────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Data-driven insights across your asset portfolio</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={() => alert('PDF export coming soon!')}>
                        <Download size={15} /> Export PDF
                    </button>
                    <button className="btn btn-primary" onClick={() => alert('CSV export coming soon!')}>
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── Top KPI strip ──────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                    { label: 'Portfolio Value', value: `$${totalValue.toLocaleString()}`, sub: `${assets.length} assets`, color: 'var(--accent)', bg: 'var(--accent-light)', icon: <Package size={18} /> },
                    { label: 'Utilization Rate', value: `${utilizationRate}%`, sub: `${assets.filter(a => a.status === 'allocated').length} deployed`, color: 'var(--success)', bg: 'var(--success-light)', icon: <TrendingUp size={18} /> },
                    { label: 'Active Allocations', value: allocationRecords.filter(r => r.status === 'active').length, sub: `${allocationRecords.filter(r => r.status === 'overdue').length} overdue`, color: 'var(--info)', bg: 'var(--info-light)', icon: <BarChart3 size={18} /> },
                    { label: 'Maintenance Resolved', value: `${resolvedRate}%`, sub: `${maintenanceRequests.filter(m => m.status === 'resolved').length} of ${maintenanceRequests.length}`, color: 'var(--warning)', bg: 'var(--warning-light)', icon: <Wrench size={18} /> },
                ].map(k => (
                    <div key={k.label} className="kpi-card">
                        <div className="kpi-icon-wrap" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                        <div className="kpi-body">
                            <div className="kpi-label">{k.label}</div>
                            <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{k.value}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ───────────────────────────────────────── */}
            <div className="tab-list">
                {REPORT_TABS.map(tab => (
                    <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Overview ───────────────────────────────────── */}
            {activeTab === 'Overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="chart-card">
                        <div className="chart-title">Asset Status Trend</div>
                        <div className="chart-subtitle">6-month allocation vs availability</div>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={monthlyAssetData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="4 4" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                                <Line type="monotone" dataKey="allocated" name="Allocated" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 3 }} />
                                <Line type="monotone" dataKey="available" name="Available" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: '#22C55E', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Category Distribution</div>
                        <div className="chart-subtitle">Assets grouped by type</div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ResponsiveContainer width="55%" height={240}>
                                <PieChart>
                                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {categoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {categoryBreakdown.map(c => (
                                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{c.name}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assets tab ─────────────────────────────────── */}
            {activeTab === 'Assets' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="chart-card">
                        <div className="chart-title">Assets by Department</div>
                        <div className="chart-subtitle">Distribution across teams</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={assetsByDept} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="assets" name="Assets" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Portfolio Value by Category</div>
                        <div className="chart-subtitle">Total invested capital — $USD</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={valueByCategory} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Value ($)" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── Maintenance tab ────────────────────────────── */}
            {activeTab === 'Maintenance' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="chart-card">
                        <div className="chart-title">Maintenance Volume Trend</div>
                        <div className="chart-subtitle">Requests raised vs resolved per month</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={maintenanceTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={4}>
                                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                                <Bar dataKey="requests" name="Raised" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={16} />
                                <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Priority Breakdown</div>
                        <div className="chart-subtitle">Current maintenance requests by priority</div>
                        {(() => {
                            const data = [
                                { name: 'Critical', value: maintenanceRequests.filter(m => m.priority === 'critical').length, color: '#EF4444' },
                                { name: 'High', value: maintenanceRequests.filter(m => m.priority === 'high').length, color: '#F97316' },
                                { name: 'Medium', value: maintenanceRequests.filter(m => m.priority === 'medium').length, color: '#F59E0B' },
                                { name: 'Low', value: maintenanceRequests.filter(m => m.priority === 'low').length, color: '#22C55E' },
                            ];
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', height: 220 }}>
                                    <ResponsiveContainer width="55%" height="100%">
                                        <PieChart>
                                            <Pie data={data} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                                {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {data.map(d => (
                                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ── Utilization tab ────────────────────────────── */}
            {activeTab === 'Utilization' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                        {[
                            { label: 'Overall Utilization', value: utilizationRate, color: 'var(--accent)' },
                            { label: 'Maintenance Rate', value: Math.round(assets.filter(a => a.status === 'maintenance').length / assets.length * 100), color: 'var(--warning)' },
                            { label: 'Availability Rate', value: Math.round(assets.filter(a => a.status === 'available').length / assets.length * 100), color: 'var(--success)' },
                        ].map(metric => (
                            <div key={metric.label} className="card" style={{ textAlign: 'center', padding: 28 }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                                    {metric.label}
                                </div>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: metric.color, lineHeight: 1, marginBottom: 12 }}>
                                    {metric.value}%
                                </div>
                                {/* Mini progress bar */}
                                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${metric.value}%`, background: metric.color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Monthly Utilization Rate</div>
                        <div className="chart-subtitle">Percentage of assets deployed over time</div>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart
                                data={monthlyAssetData.map(d => ({
                                    ...d, rate: Math.round(d.allocated / (d.allocated + d.available + d.maintenance) * 100),
                                }))}
                                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                            >
                                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="4 4" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="rate" name="Utilization %" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
