import React, { useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  AlertTriangle,
  Package,
  Clock,
  User,
  Building2,
  FileText,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  allocationRecords,
  transferRequests,
  assets,
  users,
  departments,
  getUserById,
  getAssetById,
  getDeptById,
  formatDate,
  AllocationRecord,
  TransferRequest,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';


type Tab = 'active' | 'transfers' | 'returns';
type StatusFilter = 'all' | 'active' | 'overdue';

interface AllocateForm {
  assetId: string;
  userId: string;
  departmentId: string;
  expectedReturn: string;
  notes: string;
}

interface TransferForm {
  assetId: string;
  toUserId: string;
  notes: string;
}

interface ReturnForm {
  allocationId: string;
  conditionNotes: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}


function isOverdue(expectedReturn: string | null): boolean {
  if (!expectedReturn) return false;
  return new Date(expectedReturn) < new Date();
}


function allocationStatusBadge(rec: AllocationRecord): string {
  if (rec.status === 'returned') return 'badge badge-completed';
  if (rec.status === 'overdue' || isOverdue(rec.expectedReturn)) return 'badge badge-overdue';
  if (rec.status === 'transfer_requested') return 'badge badge-pending';
  return 'badge badge-active';
}

function allocationStatusLabel(rec: AllocationRecord): string {
  if (rec.status === 'returned') return 'Returned';
  if (rec.status === 'overdue' || isOverdue(rec.expectedReturn)) return 'Overdue';
  if (rec.status === 'transfer_requested') return 'Transfer Pending';
  return 'Active';
}


function transferStatusBadge(status: TransferRequest['status']): string {
  if (status === 'approved') return 'badge badge-approved';
  if (status === 'rejected') return 'badge badge-rejected';
  return 'badge badge-pending';
}


let localAllocations: AllocationRecord[] = allocationRecords.map(r => ({ ...r }));
let localTransfers: TransferRequest[] = transferRequests.map(t => ({ ...t }));


export default function AllocationPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'asset_manager';

  
  const [activeTab, setActiveTab] = useState<Tab>('active');

  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ── Modal states ──────────────────────────────────────────
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // ── Form states ───────────────────────────────────────────
  const [allocateForm, setAllocateForm] = useState<AllocateForm>({
    assetId: '',
    userId: '',
    departmentId: '',
    expectedReturn: '',
    notes: '',
  });
  const [allocateError, setAllocateError] = useState<string | null>(null);
  const [allocateConflict, setAllocateConflict] = useState(false);

  const [transferForm, setTransferForm] = useState<TransferForm>({
    assetId: '',
    toUserId: '',
    notes: '',
  });
  const [transferError, setTransferError] = useState<string | null>(null);

  const [returnForm, setReturnForm] = useState<ReturnForm>({
    allocationId: '',
    conditionNotes: '',
    condition: 'good',
  });

  // ── Force re-render counter ───────────────────────────────
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate(n => n + 1);

  // ============================================================
  // Derived data
  // ============================================================
  const activeAllocations = localAllocations.filter(
    r => r.status === 'active' || r.status === 'overdue' || r.status === 'transfer_requested'
  );

  const filteredActive = activeAllocations.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return r.status === 'active' && !isOverdue(r.expectedReturn);
    if (statusFilter === 'overdue') return r.status === 'overdue' || isOverdue(r.expectedReturn);
    return true;
  });

  const returnedAllocations = localAllocations.filter(r => r.status === 'returned');

  const availableAssets = assets.filter(a => a.status === 'available');
  const allocatedAssets = assets.filter(a => a.status === 'allocated');
  const activeUsers = users.filter(u => u.status === 'active');
  const activeDepts = departments.filter(d => d.status === 'active');

  // ============================================================
  // Handlers: Allocate Asset
  // ============================================================
  function openAllocateModal() {
    setAllocateForm({ assetId: '', userId: '', departmentId: '', expectedReturn: '', notes: '' });
    setAllocateError(null);
    setAllocateConflict(false);
    setShowAllocateModal(true);
  }

  function handleAllocateSubmit() {
    const { assetId, userId, departmentId } = allocateForm;
    if (!assetId || !userId || !departmentId) {
      setAllocateError('Asset, User, and Department are required.');
      return;
    }
   
    const existingActive = localAllocations.find(
      r => r.assetId === assetId && (r.status === 'active' || r.status === 'overdue')
    );
    if (existingActive) {
      setAllocateConflict(true);
      setAllocateError('This asset is already allocated. You can raise a Transfer Request instead.');
      return;
    }
    const newRecord: AllocationRecord = {
      id: `al${Date.now()}`,
      assetId,
      userId,
      departmentId,
      allocatedAt: new Date().toISOString().slice(0, 10),
      expectedReturn: allocateForm.expectedReturn || null,
      returnedAt: null,
      condition: 'good',
      notes: allocateForm.notes,
      status: 'active',
    };
    localAllocations = [newRecord, ...localAllocations];
    setShowAllocateModal(false);
    rerender();
  }

  function handleConflictTransfer() {
   
    const allocated = localAllocations.find(
      r => r.assetId === allocateForm.assetId && (r.status === 'active' || r.status === 'overdue')
    );
    setTransferForm({
      assetId: allocateForm.assetId,
      toUserId: allocateForm.userId,
      notes: '',
    });
    setTransferError(null);
    setShowAllocateModal(false);
    setAllocateConflict(false);
    setShowTransferModal(true);
  }

  // ============================================================
  // Handlers: Transfer Request
  // ============================================================
  function openTransferModal() {
    setTransferForm({ assetId: '', toUserId: '', notes: '' });
    setTransferError(null);
    setShowTransferModal(true);
  }

  function handleTransferSubmit() {
    const { assetId, toUserId } = transferForm;
    if (!assetId || !toUserId) {
      setTransferError('Asset and Target User are required.');
      return;
    }
    const allocation = localAllocations.find(
      r => r.assetId === assetId && (r.status === 'active' || r.status === 'overdue')
    );
    if (!allocation) {
      setTransferError('Could not find an active allocation for this asset.');
      return;
    }
    if (allocation.userId === toUserId) {
      setTransferError('The target user already holds this asset.');
      return;
    }
    const newTransfer: TransferRequest = {
      id: `tr${Date.now()}`,
      assetId,
      fromUserId: allocation.userId,
      toUserId,
      requestedBy: user?.id ?? 'u1',
      requestedAt: new Date().toISOString().slice(0, 10),
      approvedAt: null,
      approvedBy: null,
      status: 'pending',
      notes: transferForm.notes,
    };
    localTransfers = [newTransfer, ...localTransfers];
    
    allocation.status = 'transfer_requested';
    setShowTransferModal(false);
    rerender();
  }

  function handleTransferAction(id: string, action: 'approved' | 'rejected') {
    const tr = localTransfers.find(t => t.id === id);
    if (!tr) return;
    tr.status = action;
    tr.approvedAt = new Date().toISOString().slice(0, 10);
    tr.approvedBy = user?.id ?? '';
    if (action === 'approved') {
      
      const allocation = localAllocations.find(
        r => r.assetId === tr.assetId && (r.status === 'active' || r.status === 'overdue' || r.status === 'transfer_requested')
      );
      if (allocation) {
        allocation.userId = tr.toUserId;
        allocation.status = 'active';
      }
    } else {
      
      const allocation = localAllocations.find(
        r => r.assetId === tr.assetId && r.status === 'transfer_requested'
      );
      if (allocation) allocation.status = 'active';
    }
    rerender();
  }

  
  function openReturnModal(allocationId: string) {
    setReturnForm({ allocationId, conditionNotes: '', condition: 'good' });
    setShowReturnModal(true);
  }

  function handleReturnSubmit() {
    const { allocationId, conditionNotes, condition } = returnForm;
    const rec = localAllocations.find(r => r.id === allocationId);
    if (!rec) return;
    rec.status = 'returned';
    rec.returnedAt = new Date().toISOString().slice(0, 10);
    rec.condition = condition;
    rec.notes = conditionNotes || rec.notes;
    setShowReturnModal(false);
    rerender();
  }

 
  const overdueCount = activeAllocations.filter(
    r => r.status === 'overdue' || isOverdue(r.expectedReturn)
  ).length;
  const pendingTransferCount = localTransfers.filter(t => t.status === 'pending').length;

  
  return (
    <div>
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Allocation</h1>
          <p className="page-subtitle">
            Manage asset assignments, transfers, and returns across your organisation
          </p>
        </div>
        <div className="page-actions">
          {activeTab === 'active' && isManager && (
            <button className="btn btn-primary" onClick={openAllocateModal}>
              <Plus size={15} />
              Allocate Asset
            </button>
          )}
          {activeTab === 'transfers' && (
            <button className="btn btn-secondary" onClick={openTransferModal}>
              <ArrowLeftRight size={15} />
              Request Transfer
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-label">Active Allocations</div>
          <div className="kpi-value">{activeAllocations.length}</div>
        </div>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-label" style={{ color: 'var(--danger)' }}>Overdue</div>
          <div className="kpi-value" style={{ color: overdueCount > 0 ? 'var(--danger)' : undefined }}>
            {overdueCount}
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-label">Pending Transfers</div>
          <div className="kpi-value">{pendingTransferCount}</div>
        </div>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-label">Returned</div>
          <div className="kpi-value">{returnedAllocations.length}</div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="tab-list">
        <button
          className={`tab-btn${activeTab === 'active' ? ' active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Package size={14} />
          Active Allocations
          {activeAllocations.length > 0 && (
            <span
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {activeAllocations.length}
            </span>
          )}
        </button>
        <button
          className={`tab-btn${activeTab === 'transfers' ? ' active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          <ArrowLeftRight size={14} />
          Transfer Requests
          {pendingTransferCount > 0 && (
            <span
              style={{
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {pendingTransferCount}
            </span>
          )}
        </button>
        <button
          className={`tab-btn${activeTab === 'returns' ? ' active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          <RotateCcw size={14} />
          Returns
          {returnedAllocations.length > 0 && (
            <span
              style={{
                background: 'var(--success-light)',
                color: 'var(--success)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {returnedAllocations.length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================
          TAB 1 — ACTIVE ALLOCATIONS
      ============================================================ */}
      {activeTab === 'active' && (
        <>
          {/* Filter row */}
          <div className="filter-row">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Filter:
            </label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="overdue">Overdue Only</option>
            </select>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Showing {filteredActive.length} of {activeAllocations.length} records
            </span>
          </div>

          {filteredActive.length === 0 ? (
            <EmptyState
              icon={<Package size={26} />}
              title="No allocations found"
              desc="Allocate an asset to a user to get started."
            />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Allocated To</th>
                    <th>Department</th>
                    <th>Allocated Date</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    {isManager && <th style={{ textAlign: 'center' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.map(rec => {
                    const asset = getAssetById(rec.assetId);
                    const assignee = getUserById(rec.userId);
                    const dept = getDeptById(rec.departmentId);
                    const overdue = rec.status === 'overdue' || isOverdue(rec.expectedReturn);

                    return (
                      <tr
                        key={rec.id}
                        style={
                          overdue
                            ? {
                                background: 'rgba(239,68,68,0.04)',
                                borderLeft: '3px solid var(--danger)',
                              }
                            : undefined
                        }
                      >
                        {/* Asset */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--accent-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Package size={15} color="var(--accent)" />
                            </div>
                            <div>
                              <div className="td-primary">
                                {asset?.name ?? rec.assetId}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {asset?.tag}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Allocated To */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg,var(--accent),#a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: '#fff',
                                flexShrink: 0,
                              }}
                            >
                              {assignee?.name.slice(0, 1) ?? '?'}
                            </div>
                            <span className="td-primary">{assignee?.name ?? rec.userId}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td>{dept?.name ?? rec.departmentId}</td>

                        {/* Allocated Date */}
                        <td>{formatDate(rec.allocatedAt)}</td>

                        {/* Expected Return */}
                        <td>
                          {rec.expectedReturn ? (
                            <span style={overdue ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                              {overdue && <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                              {formatDate(rec.expectedReturn)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                              No deadline
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={allocationStatusBadge(rec)}>
                            <span className="badge-dot" />
                            {allocationStatusLabel(rec)}
                          </span>
                        </td>

                        {/* Action */}
                        {isManager && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openReturnModal(rec.id)}
                              style={{ gap: 5 }}
                            >
                              <RotateCcw size={12} />
                              Return
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          TAB 2 — TRANSFER REQUESTS
      ============================================================ */}
      {activeTab === 'transfers' && (
        <>
          {localTransfers.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight size={26} />}
              title="No transfer requests"
              desc="Raise a transfer request to move an asset from one user to another."
            />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>From User</th>
                    <th>To User</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    {isManager && <th style={{ textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {localTransfers.map(tr => {
                    const asset = getAssetById(tr.assetId);
                    const fromUser = getUserById(tr.fromUserId);
                    const toUser = getUserById(tr.toUserId);
                    const reqBy = getUserById(tr.requestedBy);

                    return (
                      <tr key={tr.id}>
                        {/* Asset */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                            <div>
                              <div className="td-primary">{asset?.name ?? tr.assetId}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {asset?.tag}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* From User */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={13} color="var(--text-muted)" />
                            <span>{fromUser?.name ?? tr.fromUserId}</span>
                          </div>
                        </td>

                        {/* To User */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={13} color="var(--accent)" />
                            <span className="td-primary">{toUser?.name ?? tr.toUserId}</span>
                          </div>
                        </td>

                        {/* Requested By */}
                        <td>{reqBy?.name ?? tr.requestedBy}</td>

                        {/* Date */}
                        <td>{formatDate(tr.requestedAt)}</td>

                        {/* Status */}
                        <td>
                          <span className={transferStatusBadge(tr.status)}>
                            <span className="badge-dot" />
                            {tr.status.charAt(0).toUpperCase() + tr.status.slice(1)}
                          </span>
                        </td>

                        {/* Notes */}
                        <td
                          style={{
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                          }}
                          title={tr.notes}
                        >
                          {tr.notes || '—'}
                        </td>

                        {/* Actions */}
                        {isManager && (
                          <td>
                            {tr.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleTransferAction(tr.id, 'approved')}
                                  style={{ gap: 4 }}
                                >
                                  <CheckCircle size={12} />
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleTransferAction(tr.id, 'rejected')}
                                  style={{ gap: 4 }}
                                >
                                  <XCircle size={12} />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center' }}>
                                {tr.approvedBy && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    by {getUserById(tr.approvedBy)?.name ?? tr.approvedBy}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          TAB 3 — RETURNS
      ============================================================ */}
      {activeTab === 'returns' && (
        <>
          {returnedAllocations.length === 0 ? (
            <EmptyState
              icon={<RotateCcw size={26} />}
              title="No returned assets"
              desc="Returned asset records will appear here."
            />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Returned By</th>
                    <th>Department</th>
                    <th>Allocated Date</th>
                    <th>Returned Date</th>
                    <th>Condition at Return</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {returnedAllocations.map(rec => {
                    const asset = getAssetById(rec.assetId);
                    const assignee = getUserById(rec.userId);
                    const dept = getDeptById(rec.departmentId);

                    return (
                      <tr key={rec.id}>
                        {/* Asset */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            <div>
                              <div className="td-primary">{asset?.name ?? rec.assetId}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {asset?.tag}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Returned By */}
                        <td>{assignee?.name ?? rec.userId}</td>

                        {/* Department */}
                        <td>{dept?.name ?? rec.departmentId}</td>

                        {/* Allocated Date */}
                        <td>{formatDate(rec.allocatedAt)}</td>

                        {/* Returned Date */}
                        <td>
                          {rec.returnedAt ? (
                            <span style={{ color: 'var(--success)' }}>
                              <CheckCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              {formatDate(rec.returnedAt)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Condition at Return */}
                        <td>
                          <ConditionBadge condition={rec.condition} />
                        </td>

                        {/* Notes */}
                        <td
                          style={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                          title={rec.notes}
                        >
                          {rec.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          MODAL: Allocate Asset
      ============================================================ */}
      {showAllocateModal && (
        <div className="modal-overlay" onClick={() => setShowAllocateModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Package size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
                Allocate Asset
              </h3>
              <button className="icon-btn" onClick={() => setShowAllocateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Error banner */}
              {allocateError && (
                <div
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--danger)', fontSize: '0.82rem', margin: 0 }}>{allocateError}</p>
                    {allocateConflict && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={handleConflictTransfer}
                      >
                        <ArrowLeftRight size={12} />
                        Raise Transfer Request Instead
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Asset Select */}
              <div className="form-group">
                <label className="form-label">
                  Asset <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={allocateForm.assetId}
                  onChange={e => {
                    setAllocateForm(f => ({ ...f, assetId: e.target.value }));
                    setAllocateError(null);
                    setAllocateConflict(false);
                  }}
                >
                  <option value="">— Select an available asset —</option>
                  {availableAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.tag}] {a.name}
                    </option>
                  ))}
                </select>
                {availableAssets.length === 0 && (
                  <p className="form-hint">No available assets at this time.</p>
                )}
              </div>

              {/* User + Department row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Assign To (User) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={allocateForm.userId}
                    onChange={e => setAllocateForm(f => ({ ...f, userId: e.target.value }))}
                  >
                    <option value="">— Select user —</option>
                    {activeUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Department <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={allocateForm.departmentId}
                    onChange={e => setAllocateForm(f => ({ ...f, departmentId: e.target.value }))}
                  >
                    <option value="">— Select department —</option>
                    {activeDepts.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expected Return */}
              <div className="form-group">
                <label className="form-label">Expected Return Date (optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={allocateForm.expectedReturn}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setAllocateForm(f => ({ ...f, expectedReturn: e.target.value }))}
                />
                <p className="form-hint">Leave blank for permanent / indefinite allocation.</p>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Reason for allocation, usage instructions, etc."
                  value={allocateForm.notes}
                  onChange={e => setAllocateForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAllocateModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAllocateSubmit}>
                <CheckCircle size={14} />
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: Request Transfer
      ============================================================ */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <ArrowLeftRight size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
                Request Asset Transfer
              </h3>
              <button className="icon-btn" onClick={() => setShowTransferModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {transferError && (
                <div
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <AlertTriangle size={15} color="var(--danger)" />
                  <p style={{ color: 'var(--danger)', fontSize: '0.82rem', margin: 0 }}>{transferError}</p>
                </div>
              )}

              {/* Asset Select — from allocated assets */}
              <div className="form-group">
                <label className="form-label">
                  Asset (currently allocated) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={transferForm.assetId}
                  onChange={e => {
                    setTransferForm(f => ({ ...f, assetId: e.target.value }));
                    setTransferError(null);
                  }}
                >
                  <option value="">— Select allocated asset —</option>
                  {allocatedAssets.map(a => {
                    const currentRec = localAllocations.find(
                      r => r.assetId === a.id && (r.status === 'active' || r.status === 'overdue' || r.status === 'transfer_requested')
                    );
                    const holder = currentRec ? getUserById(currentRec.userId) : null;
                    return (
                      <option key={a.id} value={a.id}>
                        [{a.tag}] {a.name}{holder ? ` — held by ${holder.name}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Target User */}
              <div className="form-group">
                <label className="form-label">
                  Transfer To <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={transferForm.toUserId}
                  onChange={e => {
                    setTransferForm(f => ({ ...f, toUserId: e.target.value }));
                    setTransferError(null);
                  }}
                >
                  <option value="">— Select target user —</option>
                  {activeUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes / Reason</label>
                <textarea
                  className="form-textarea"
                  placeholder="Why is this transfer needed?"
                  value={transferForm.notes}
                  onChange={e => setTransferForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowTransferModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleTransferSubmit}>
                <ArrowLeftRight size={14} />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <RotateCcw size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--success)' }} />
                Mark Asset as Returned
              </h3>
              <button className="icon-btn" onClick={() => setShowReturnModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Show asset info */}
              {(() => {
                const rec = localAllocations.find(r => r.id === returnForm.allocationId);
                const asset = rec ? getAssetById(rec.assetId) : undefined;
                const assignee = rec ? getUserById(rec.userId) : undefined;
                return rec ? (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Package size={18} color="var(--accent)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {asset?.name ?? rec.assetId}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {asset?.tag} · Held by {assignee?.name ?? rec.userId}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Condition Select */}
              <div className="form-group">
                <label className="form-label">
                  Condition at Return <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={returnForm.condition}
                  onChange={e =>
                    setReturnForm(f => ({
                      ...f,
                      condition: e.target.value as ReturnForm['condition'],
                    }))
                  }
                >
                  <option value="excellent">Excellent — Like new</option>
                  <option value="good">Good — Minor wear</option>
                  <option value="fair">Fair — Visible wear, functional</option>
                  <option value="poor">Poor — Significant damage</option>
                </select>
              </div>

              {/* Check-in Notes */}
              <div className="form-group">
                <label className="form-label">Check-in Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the asset's physical condition, any damage, missing parts, etc."
                  value={returnForm.conditionNotes}
                  onChange={e => setReturnForm(f => ({ ...f, conditionNotes: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowReturnModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleReturnSubmit}>
                <CheckCircle size={14} />
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      <p className="empty-desc">{desc}</p>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    excellent: { cls: 'badge badge-approved', label: 'Excellent' },
    good:      { cls: 'badge badge-active',   label: 'Good' },
    fair:      { cls: 'badge badge-pending',  label: 'Fair' },
    poor:      { cls: 'badge badge-overdue',  label: 'Poor' },
  };
  const resolved = map[condition] ?? { cls: 'badge badge-inactive', label: condition };
  return (
    <span className={resolved.cls}>
      <span className="badge-dot" />
      {resolved.label}
    </span>
  );
}
