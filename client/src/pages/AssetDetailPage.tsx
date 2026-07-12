import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Tag, Calendar, DollarSign,
  Shield, User, Wrench, ArrowLeftRight, Clock, CheckCircle,
  AlertTriangle, Info,
} from 'lucide-react';
import {
  assets, allocationRecords, maintenanceRequests,
  getUserById, getDeptById, getCategoryLabel, formatDate,
} from '../data/mockData';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const asset = assets.find(a => a.id === id);

  if (!asset) {
    return (
      <div className="empty-state" style={{ minHeight: 400 }}>
        <div className="empty-icon"><Package size={28} /></div>
        <div className="empty-title">Asset not found</div>
        <div className="empty-desc">The asset you're looking for doesn't exist or was removed.</div>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/assets')}>
          <ArrowLeft size={14} /> Back to Assets
        </button>
      </div>
    );
  }

  const assetAllocations = allocationRecords.filter(r => r.assetId === asset.id);
  const assetMaintenance = maintenanceRequests.filter(m => m.assetId === asset.id);
  const activeAlloc      = assetAllocations.find(r => r.status === 'active' || r.status === 'overdue');

  const STATUS_COLOR: Record<string, string> = {
    available: 'var(--success)', allocated: 'var(--info)',
    maintenance: 'var(--warning)', retired: 'var(--text-muted)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Back + Header ─────────────────────────────────── */}
      <div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/assets')}
          style={{ marginBottom: 12, gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to Assets
        </button>

        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={24} color="var(--accent)" />
            </div>
            <div>
              <h1 className="page-title">{asset.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <code style={{ fontSize: '0.78rem', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                  {asset.tag}
                </code>
                <span className={`badge badge-${asset.status}`}>
                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {getCategoryLabel(asset.category)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Info grid */}
          <div className="card">
            <div className="section-header">
              <div className="section-title"><Info size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />Asset Information</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { icon: <MapPin size={14} />, label: 'Location', value: asset.location },
                { icon: <Tag size={14} />, label: 'Serial Number', value: asset.serialNumber ?? '—' },
                { icon: <Calendar size={14} />, label: 'Purchase Date', value: formatDate(asset.purchaseDate) },
                { icon: <DollarSign size={14} />, label: 'Purchase Price', value: asset.purchasePrice > 0 ? `$${asset.purchasePrice.toLocaleString()}` : '—' },
                { icon: <Shield size={14} />, label: 'Warranty Expiry', value: formatDate(asset.warrantyExpiry) },
                { icon: <Package size={14} />, label: 'Bookable', value: asset.isBookable ? 'Yes' : 'No' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {asset.notes && (
              <>
                <div className="divider" />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Notes</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{asset.notes}</p>
                </div>
              </>
            )}
          </div>

          {/* Allocation history */}
          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <ArrowLeftRight size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--info)' }} />
                Allocation History
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assetAllocations.length} records</span>
            </div>
            {assetAllocations.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', textAlign: 'center', padding: '24px 0' }}>
                No allocation history
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {assetAllocations.map((rec, i) => {
                  const u = getUserById(rec.userId);
                  const dept = getDeptById(rec.departmentId);
                  return (
                    <div key={rec.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 0',
                      borderBottom: i < assetAllocations.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: rec.status === 'returned' ? 'var(--bg-elevated)' : 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700,
                        color: rec.status === 'returned' ? 'var(--text-muted)' : 'var(--accent)',
                      }}>
                        {u?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {u?.name ?? rec.userId}
                          <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>· {dept?.name}</span>
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatDate(rec.allocatedAt)} → {rec.returnedAt ? formatDate(rec.returnedAt) : 'Present'}
                        </div>
                        {rec.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>{rec.notes}</div>}
                      </div>
                      <span className={`badge ${rec.status === 'returned' ? 'badge-completed' : rec.status === 'overdue' ? 'badge-overdue' : 'badge-active'}`}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Maintenance history */}
          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <Wrench size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--warning)' }} />
                Maintenance History
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assetMaintenance.length} requests</span>
            </div>
            {assetMaintenance.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', textAlign: 'center', padding: '24px 0' }}>
                No maintenance requests
              </div>
            ) : (
              assetMaintenance.map((req, i) => (
                <div key={req.id} style={{
                  padding: '12px 0',
                  borderBottom: i < assetMaintenance.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {req.issue.length > 70 ? req.issue.slice(0, 70) + '…' : req.issue}
                    </span>
                    <span className={`badge badge-${req.status === 'resolved' ? 'resolved' : req.status === 'pending' ? 'pending' : 'in-progress'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    Raised {formatDate(req.raisedAt)} · Priority: {req.priority}
                    {req.resolvedAt && ` · Resolved ${formatDate(req.resolvedAt)}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current holder */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>
              <User size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />
              Current Assignment
            </div>
            {activeAlloc ? (() => {
              const u = getUserById(activeAlloc.userId);
              const dept = getDeptById(activeAlloc.departmentId);
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {u?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Department', value: dept?.name ?? '—' },
                      { label: 'Role', value: u?.role.replace('_', ' ') ?? '—' },
                      { label: 'Since', value: formatDate(activeAlloc.allocatedAt) },
                      { label: 'Expected Return', value: formatDate(activeAlloc.expectedReturn) },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: 8 }} />
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Asset is available</div>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Quick Stats</div>
            {[
              { label: 'Total Allocations', value: assetAllocations.length },
              { label: 'Maintenance Requests', value: assetMaintenance.length },
              { label: 'Resolved Issues', value: assetMaintenance.filter(m => m.status === 'resolved').length },
              { label: 'Asset Age', value: getAssetAge(asset.purchaseDate) },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAssetAge(purchaseDate: string): string {
  if (!purchaseDate) return '—';
  const ms = Date.now() - new Date(purchaseDate).getTime();
  const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30));
  if (months < 12) return `${months} months`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''}`;
}
