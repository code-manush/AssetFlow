import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Kanban,
  Table2,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,

  CheckCheck,
  Upload,
  ChevronRight,
  X,
  AlertCircle,
  Zap,
  Activity,
} from 'lucide-react';
import {
  maintenanceRequests,
  assets,
  users,
  getUserById,
  getAssetById,
  formatDate,
  MaintenanceRequest,
  MaintenancePriority,
  MaintenanceStatus,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalMaintenance extends MaintenanceRequest {}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityBadgeClass(p: MaintenancePriority): string {
  const map: Record<MaintenancePriority, string> = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return map[p] ?? 'badge-low';
}

function statusBadgeClass(s: MaintenanceStatus): string {
  const map: Record<MaintenanceStatus, string> = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    in_progress: 'badge-in-progress',
    resolved: 'badge-resolved',
  };
  return map[s] ?? 'badge-pending';
}

function statusLabel(s: MaintenanceStatus): string {
  const map: Record<MaintenanceStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return map[s] ?? s;
}

function priorityLabel(p: MaintenancePriority): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

const KANBAN_COLS: { status: MaintenanceStatus; label: string; color: string }[] = [
  { status: 'pending',     label: 'Pending',     color: 'var(--warning)' },
  { status: 'approved',    label: 'Approved',    color: 'var(--success)' },
  { status: 'in_progress', label: 'In Progress', color: 'var(--teal)'    },
  { status: 'resolved',    label: 'Resolved',    color: 'var(--accent)'  },
  { status: 'rejected',    label: 'Rejected',    color: 'var(--danger)'  },
];



// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCards({ requests }: { requests: LocalMaintenance[] }) {
  const pending    = requests.filter(r => r.status === 'pending').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const resolved   = requests.filter(r => r.status === 'resolved').length;
  const critical   = requests.filter(r => r.priority === 'critical').length;

  const cards = [
    { label: 'Pending',     value: pending,    icon: <Clock size={18} />,         color: 'var(--warning)',  bg: 'var(--warning-light)' },
    { label: 'In Progress', value: inProgress, icon: <Activity size={18} />,      color: 'var(--teal)',     bg: 'var(--teal-light)' },
    { label: 'Resolved',    value: resolved,   icon: <CheckCheck size={18} />,     color: 'var(--success)',  bg: 'var(--success-light)' },
    { label: 'Critical',    value: critical,   icon: <Zap size={18} />,            color: 'var(--danger)',   bg: 'var(--danger-light)' },
  ];

  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <div className="kpi-card" key={c.label}>
          <div className="kpi-icon-wrap" style={{ background: c.bg, color: c.color }}>
            {c.icon}
          </div>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-value" style={{ color: c.color }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCardItem({
  req,
  onClick,
}: {
  req: LocalMaintenance;
  onClick: () => void;
}) {
  const asset = getAssetById(req.assetId);
  const raisedByUser = getUserById(req.raisedBy);

  return (
    <div className="kanban-card" onClick={onClick}>
      {/* Asset name + tag */}
      <div style={{ marginBottom: 8 }}>
        <div className="td-primary" style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
          {asset?.name ?? 'Unknown Asset'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{asset?.tag}</div>
      </div>

      {/* Issue snippet */}
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginBottom: 8,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {req.issue}
      </div>

      {/* Priority badge */}
      <div style={{ marginBottom: 8 }}>
        <span className={`badge ${priorityBadgeClass(req.priority)}`}>
          {priorityLabel(req.priority)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{raisedByUser?.name ?? '—'}</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {formatDate(req.raisedAt)}
        </div>
      </div>
    </div>
  );
}

// ─── Raise Request Modal ──────────────────────────────────────────────────────

interface RaiseModalProps {
  onClose: () => void;
  onSubmit: (req: LocalMaintenance) => void;
  currentUserId: string;
}

function RaiseRequestModal({ onClose, onSubmit, currentUserId }: RaiseModalProps) {
  const [assetId, setAssetId]   = useState('');
  const [issue, setIssue]       = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [error, setError]       = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) { setError('Please select an asset.'); return; }
    if (!issue.trim()) { setError('Please describe the issue.'); return; }

    const newReq: LocalMaintenance = {
      id: `m${Date.now()}`,
      assetId,
      raisedBy: currentUserId,
      assignedTo: null,
      priority,
      status: 'pending',
      issue: issue.trim(),
      notes: '',
      raisedAt: new Date().toISOString(),
      resolvedAt: null,
      approvedAt: null,
      approvedBy: null,
    };
    onSubmit(newReq);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <Wrench size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
            Raise Maintenance Request
          </span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Asset Select */}
            <div className="form-group">
              <label className="form-label">Select Asset <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className="form-select"
                value={assetId}
                onChange={e => setAssetId(e.target.value)}
              >
                <option value="">— Choose an asset —</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                ))}
              </select>
            </div>

            {/* Issue Description */}
            <div className="form-group">
              <label className="form-label">Describe the Issue <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea
                className="form-textarea"
                placeholder="Describe what's wrong in detail..."
                value={issue}
                onChange={e => setIssue(e.target.value)}
                rows={4}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={e => setPriority(e.target.value as MaintenancePriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Photo upload placeholder */}
            <div className="form-group">
              <label className="form-label">Attach Photo (optional)</label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '20px',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'border-color var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <Upload size={20} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload or drag & drop</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PNG, JPG up to 5 MB</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </label>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}>
                <AlertCircle size={14} color="var(--danger)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Wrench size={14} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  req: LocalMaintenance;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAssign: (id: string, techId: string) => void;
  canManage: boolean;
  currentUserId: string;
}

function DetailModal({ req, onClose, onApprove, onReject, onAssign, canManage, currentUserId }: DetailModalProps) {
  const asset       = getAssetById(req.assetId);
  const raisedBy    = getUserById(req.raisedBy);
  const assignedTo  = req.assignedTo ? getUserById(req.assignedTo) : null;
  const approvedBy  = req.approvedBy ? getUserById(req.approvedBy) : null;
  const [selectedTech, setSelectedTech] = useState(req.assignedTo ?? '');

  // Workflow steps: Pending → Approved/Rejected → Assigned → In Progress → Resolved
  const workflowSteps = [
    { label: 'Pending',      icon: '1' },
    { label: 'Approved',     icon: '2' },
    { label: 'Assigned',     icon: '3' },
    { label: 'In Progress',  icon: '4' },
    { label: 'Resolved',     icon: '5' },
  ];

  
  const statusToStep: Record<MaintenanceStatus, number> = {
    pending:     0,
    approved:    1,
    rejected:    1,
    in_progress: 3,
    resolved:    4,
  };

  const currentStep = statusToStep[req.status] ?? 0;
  const isRejected  = req.status === 'rejected';

  function getWorkflowClass(idx: number): 'done' | 'active' | 'idle' {
    if (isRejected) return idx === 0 ? 'done' : 'idle';
    if (idx < currentStep) return 'done';
    if (idx === currentStep) return 'active';
    return 'idle';
  }

  const techUsers = users.filter(u => u.role === 'asset_manager' || u.role === 'admin');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {asset?.name ?? 'Asset'} — Maintenance Request
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              #{req.id} &nbsp;·&nbsp; {asset?.tag}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${priorityBadgeClass(req.priority)}`}>{priorityLabel(req.priority)}</span>
            <span className={`badge ${statusBadgeClass(req.status)}`}>{statusLabel(req.status)}</span>
            <button className="icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Workflow Steps */}
          <div className="workflow-steps">
            {workflowSteps.map((step, idx) => {
              const state = getWorkflowClass(idx);
              const isLast = idx === workflowSteps.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className={`workflow-step ${state}`}>
                    <div className="workflow-step-dot">
                      {state === 'done' ? <CheckCircle size={13} /> : step.icon}
                    </div>
                    <div className="workflow-step-label">{step.label}</div>
                  </div>
                  {!isLast && (
                    <div className={`workflow-connector ${state === 'done' ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Rejected banner */}
          {isRejected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}>
              <XCircle size={16} color="var(--danger)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>This request has been rejected.</span>
            </div>
          )}

          {/* Info grid */}
          <div className="form-row">
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Asset</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{asset?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset?.tag} · {asset?.location}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Raised By</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{raisedBy?.name ?? '—'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(req.raisedAt)}</div>
            </div>
          </div>

          <div className="form-row">
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Assigned To</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{assignedTo?.name ?? 'Not assigned'}</div>
            </div>
            {req.approvedBy && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Approved By</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{approvedBy?.name ?? '—'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.approvedAt ? formatDate(req.approvedAt) : '—'}</div>
              </div>
            )}
          </div>

          {/* Issue */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Issue Description</div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {req.issue}
            </div>
          </div>

          {/* Notes */}
          {req.notes && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Technician Notes</div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {req.notes}
              </div>
            </div>
          )}

          {/* Resolution date */}
          {req.resolvedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--success-light)', borderRadius: 8 }}>
              <CheckCheck size={16} color="var(--success)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 500 }}>
                Resolved on {formatDate(req.resolvedAt)}
              </span>
            </div>
          )}

          {/* Manager: assign technician */}
          {canManage && (req.status === 'approved' || req.status === 'in_progress') && (
            <div className="form-group">
              <label className="form-label">Assign Technician</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  value={selectedTech}
                  onChange={e => setSelectedTech(e.target.value)}
                >
                  <option value="">— Select technician —</option>
                  {techUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
                <button
                  className="btn btn-secondary"
                  onClick={() => selectedTech && onAssign(req.id, selectedTech)}
                  disabled={!selectedTech}
                >
                  <UserCheck size={14} /> Assign
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {canManage && req.status === 'pending' && (
            <>
              <button className="btn btn-danger" onClick={() => { onReject(req.id); onClose(); }}>
                <XCircle size={14} /> Reject
              </button>
              <button className="btn btn-success" onClick={() => { onApprove(req.id); onClose(); }}>
                <CheckCircle size={14} /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests]               = useState<LocalMaintenance[]>(maintenanceRequests);
  const [view, setView]                       = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch]                   = useState('');
  const [filterPriority, setFilterPriority]   = useState<string>('all');
  const [filterStatus, setFilterStatus]       = useState<string>('all');
  const [showRaiseModal, setShowRaiseModal]   = useState(false);
  const [detailReq, setDetailReq]             = useState<LocalMaintenance | null>(null);

  const isManager = user?.role === 'admin' || user?.role === 'asset_manager';
  const currentUserId = user?.id ?? 'u4';

 

  const handleRaiseSubmit = (req: LocalMaintenance) => {
    setRequests(prev => [req, ...prev]);
    setShowRaiseModal(false);
  };

  const handleApprove = (id: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: currentUserId }
          : r
      )
    );
  };

  const handleReject = (id: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      )
    );
  };

  const handleAssign = (id: string, techId: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, assignedTo: techId, status: 'in_progress' } : r
      )
    );
   
    setDetailReq(prev => prev && prev.id === id ? { ...prev, assignedTo: techId, status: 'in_progress' } : prev);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = requests.filter(r => {
    const asset  = getAssetById(r.assetId);
    const raised = getUserById(r.raisedBy);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (asset?.name ?? '').toLowerCase().includes(q) ||
      (asset?.tag ?? '').toLowerCase().includes(q) ||
      r.issue.toLowerCase().includes(q) ||
      (raised?.name ?? '').toLowerCase().includes(q);

    const matchPriority = filterPriority === 'all' || r.priority === filterPriority;
    const matchStatus   = filterStatus   === 'all' || r.status   === filterStatus;

    return matchSearch && matchPriority && matchStatus;
  });

  

  const kanbanGroups = KANBAN_COLS.map(col => ({
    ...col,
    items: filtered.filter(r => r.status === col.status),
  }));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, background: 'var(--purple-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={16} color="var(--purple)" />
            </div>
            <h1 className="page-title">Maintenance</h1>
          </div>
          <p className="page-subtitle">Track and manage asset maintenance requests across the organisation.</p>
        </div>

        <div className="page-actions">
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: 0, color: view === 'kanban' ? 'var(--accent)' : 'var(--text-muted)', background: view === 'kanban' ? 'var(--accent-light)' : 'transparent', gap: 5 }}
              onClick={() => setView('kanban')}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: 0, color: view === 'table' ? 'var(--accent)' : 'var(--text-muted)', background: view === 'table' ? 'var(--accent-light)' : 'transparent', gap: 5 }}
              onClick={() => setView('table')}
            >
              <Table2 size={14} /> Table
            </button>
          </div>

          {/* Raise button (all roles) */}
          <button className="btn btn-primary" onClick={() => setShowRaiseModal(true)}>
            <Plus size={15} /> Raise Request
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards requests={requests} />

      {/* Filter Row */}
      <div className="filter-row">
        <div className="search-bar" style={{ maxWidth: 320 }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            placeholder="Search assets, issues, raised by..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        {(search || filterPriority !== 'all' || filterStatus !== 'all') && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setFilterPriority('all'); setFilterStatus('all'); }}
          >
            <X size={13} /> Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Kanban View ─────────────────────────────────────────────────────── */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {kanbanGroups.map(col => (
            <div className="kanban-col" key={col.status}>
              <div className="kanban-col-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                  {col.label}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                }}>
                  {col.items.length}
                </span>
              </div>

              <div className="kanban-col-body">
                {col.items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    No requests
                  </div>
                ) : (
                  col.items.map(req => (
                    <KanbanCardItem
                      key={req.id}
                      req={req}
                      onClick={() => setDetailReq(req)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table View ──────────────────────────────────────────────────────── */}
      {view === 'table' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Raised By</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date Raised</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon"><Wrench size={24} /></div>
                      <div className="empty-title">No maintenance requests found</div>
                      <div className="empty-desc">Try adjusting your filters or raise a new request.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(req => {
                  const asset      = getAssetById(req.assetId);
                  const raisedBy   = getUserById(req.raisedBy);
                  const assignedTo = req.assignedTo ? getUserById(req.assignedTo) : null;

                  return (
                    <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => setDetailReq(req)}>
                      {/* Asset */}
                      <td>
                        <div className="td-primary">{asset?.name ?? '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{asset?.tag}</div>
                      </td>

                      {/* Issue */}
                      <td>
                        <div style={{
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-secondary)',
                        }}>
                          {req.issue}
                        </div>
                      </td>

                      {/* Priority */}
                      <td>
                        <span className={`badge ${priorityBadgeClass(req.priority)}`}>
                          {priorityLabel(req.priority)}
                        </span>
                      </td>

                      {/* Raised By */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{
                            width: 26, height: 26,
                            borderRadius: '50%',
                            background: 'var(--accent-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                          }}>
                            {raisedBy?.name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '??'}
                          </div>
                          <span className="td-primary">{raisedBy?.name ?? '—'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${statusBadgeClass(req.status)}`}>
                          {statusLabel(req.status)}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td>
                        {assignedTo ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{assignedTo.name}</span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Date Raised */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {formatDate(req.raisedAt)}
                      </td>

                      {/* Actions */}
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDetailReq(req)}
                            title="View Details"
                          >
                            <ChevronRight size={13} /> View
                          </button>

                          {isManager && req.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                title="Approve"
                                onClick={() => handleApprove(req.id)}
                              >
                                <CheckCircle size={13} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject"
                                onClick={() => handleReject(req.id)}
                              >
                                <XCircle size={13} />
                              </button>
                            </>
                          )}

                          {isManager && (req.status === 'approved' || req.status === 'in_progress') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Assign Technician"
                              onClick={() => setDetailReq(req)}
                            >
                              <UserCheck size={13} /> Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {showRaiseModal && (
        <RaiseRequestModal
          onClose={() => setShowRaiseModal(false)}
          onSubmit={handleRaiseSubmit}
          currentUserId={currentUserId}
        />
      )}

      {detailReq && (
        <DetailModal
          req={detailReq}
          onClose={() => setDetailReq(null)}
          onApprove={id => { handleApprove(id); setDetailReq(prev => prev ? { ...prev, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: currentUserId } : prev); }}
          onReject={id => { handleReject(id); setDetailReq(prev => prev ? { ...prev, status: 'rejected' } : prev); }}
          onAssign={handleAssign}
          canManage={isManager}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
