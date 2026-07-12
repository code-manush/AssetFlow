import React, { useState } from 'react';
import { User, Bell, Palette, Shield, Building2, Save, Check, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDeptById, getInitials } from '../data/mockData';

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const dept = getDeptById(user?.departmentId ?? '');
    const [saved, setSaved] = useState(false);
    const [notifs, setNotifs] = useState({ maintenance: true, allocations: true, overdue: true, bookings: false });

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

            <div>
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your profile, preferences, and organization settings</p>
            </div>

            {/* ── Profile ────────────────────────────────────── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <User size={16} color="var(--accent)" />
                    <span className="section-title">Profile</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', fontWeight: 800, color: 'white',
                    }}>
                        {user ? getInitials(user.name) : 'AF'}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ marginTop: 8 }}>
                            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-active' : user?.role === 'ASSET_MANAGER' ? 'badge-allocated' : 'badge-pending'}`}>
                                {user?.role?.replace('_', ' ') ?? 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" defaultValue={user?.name} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" defaultValue={user?.email} type="email" />
                    </div>
                </div>

                <div className="form-row" style={{ marginTop: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <input className="form-input" value={dept?.name ?? '—'} readOnly style={{ opacity: 0.7 }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <input className="form-input" value={user?.role?.replace('_', ' ') ?? '—'} readOnly style={{ opacity: 0.7, textTransform: 'capitalize' }} />
                    </div>
                </div>
            </div>

            {/* ── Appearance ─────────────────────────────────── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Palette size={16} color="var(--accent)" />
                    <span className="section-title">Appearance</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Theme</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Switch between dark and light mode</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['dark', 'light'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => t !== theme && toggleTheme()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '8px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                    background: theme === t ? 'var(--accent-light)' : 'var(--bg-elevated)',
                                    border: `1.5px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                                    color: theme === t ? 'var(--accent)' : 'var(--text-muted)',
                                    fontSize: '0.82rem', fontWeight: 500, fontFamily: 'var(--font)',
                                    transition: 'all var(--transition)',
                                }}
                            >
                                {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Notifications ───────────────────────────────── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Bell size={16} color="var(--accent)" />
                    <span className="section-title">Notifications</span>
                </div>

                {[
                    { key: 'maintenance' as const, label: 'Maintenance Requests', desc: 'New and updated maintenance requests' },
                    { key: 'allocations' as const, label: 'Asset Allocations', desc: 'When assets are allocated or returned' },
                    { key: 'overdue' as const, label: 'Overdue Alerts', desc: 'Assets past their expected return date' },
                    { key: 'bookings' as const, label: 'Booking Reminders', desc: 'Upcoming resource booking reminders' },
                ].map((n, i, arr) => (
                    <div
                        key={n.key}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 0',
                            borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{n.label}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.desc}</div>
                        </div>
                        <button
                            onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                            style={{
                                width: 44, height: 24, borderRadius: 'var(--radius-full)', border: 'none',
                                background: notifs[n.key] ? 'var(--accent)' : 'var(--bg-elevated)',
                                cursor: 'pointer', position: 'relative', transition: 'background var(--transition)',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 3, width: 18, height: 18,
                                left: notifs[n.key] ? 23 : 3,
                                borderRadius: '50%', background: 'white',
                                transition: 'left var(--transition)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                            }} />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Organization ───────────────────────────────── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Building2 size={16} color="var(--accent)" />
                    <span className="section-title">Organization</span>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Organization Name</label>
                        <input className="form-input" defaultValue="AssetFlow Demo Corp" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Time Zone</label>
                        <select className="form-select" defaultValue="Asia/Kolkata">
                            <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                            <option value="America/New_York">EST (UTC-5)</option>
                            <option value="Europe/London">GMT (UTC+0)</option>
                            <option value="Asia/Dubai">GST (UTC+4)</option>
                        </select>
                    </div>
                </div>
                <div className="form-row" style={{ marginTop: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select className="form-select" defaultValue="USD">
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date Format</label>
                        <select className="form-select" defaultValue="DD-MMM-YYYY">
                            <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Security ────────────────────────────────────── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Shield size={16} color="var(--accent)" />
                    <span className="section-title">Security</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { label: 'Change Password', desc: 'Update your account password', btnLabel: 'Change', btnClass: 'btn-secondary' },
                        { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', btnLabel: 'Enable 2FA', btnClass: 'btn-secondary' },
                        { label: 'Active Sessions', desc: '1 active session on this device', btnLabel: 'View Sessions', btnClass: 'btn-ghost' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                            </div>
                            <button className={`btn ${item.btnClass} btn-sm`} onClick={() => alert('Feature coming soon!')}>{item.btnLabel}</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Save ────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 24 }}>
                <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave} style={{ gap: 8 }}>
                    {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}