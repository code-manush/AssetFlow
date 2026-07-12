import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, X, Filter, Download, Package,
  ChevronUp, ChevronDown, Eye, Edit2, Trash2,
  CheckCircle, AlertTriangle, Clock, Archive,
} from 'lucide-react';
import {
  assets as initialAssets, departments, users,
  Asset, AssetCategory, AssetStatus,
  getCategoryLabel, formatDate, getInitials,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { apiFetch } from '../lib/api';

// ── Types ──────────────────────────────────────────────────
type SortKey = 'name' | 'tag' | 'category' | 'status' | 'purchaseDate' | 'purchasePrice';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: AssetStatus[] = ['available', 'allocated', 'maintenance', 'retired'];
const CATEGORY_OPTIONS: AssetCategory[] = [
  'laptop','desktop','mobile','tablet','monitor','printer',
  'projector','server','networking','furniture','vehicle','meeting_room','other',
];

const STATUS_COLORS: Record<AssetStatus, string> = {
  available: 'badge-available',
  allocated: 'badge-allocated',
  maintenance: 'badge-maintenance',
  retired: 'badge-cancelled',
};

function statusIcon(s: AssetStatus) {
  if (s === 'available')   return <CheckCircle size={12} />;
  if (s === 'allocated')   return <Clock size={12} />;
  if (s === 'maintenance') return <AlertTriangle size={12} />;
  return <Archive size={12} />;
}

const EMPTY_FORM: Omit<Asset, 'id'> = {
  name: '', tag: '', category: 'laptop', status: 'available',
  location: '', purchaseDate: '', purchasePrice: 0,
  warrantyExpiry: '', serialNumber: '', isBookable: false, notes: '',
};

export default function AssetsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // ── Local asset list ──────────────────────────────────────
  const { assets: assetList, refreshData } = useData();

  // ── Filters & sorting ────────────────────────────────────
  const [search, setSearch]             = useState(searchParams.get('q') ?? '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCat, setFilterCat]       = useState<string>('all');
  const [sortKey, setSortKey]           = useState<SortKey>('name');
  const [sortDir, setSortDir]           = useState<SortDir>('asc');
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  // ── Modals ───────────────────────────────────────────────
  const [showAdd, setShowAdd]         = useState(false);
  const [editAsset, setEditAsset]     = useState<Asset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [form, setForm]               = useState<Omit<Asset, 'id'>>(EMPTY_FORM);
  const [formErr, setFormErr]         = useState('');

  // ── Derived ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    return assetList
      .filter(a => {
        const q = search.toLowerCase();
        const matchQ = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q)
          || a.location.toLowerCase().includes(q) || (a.serialNumber ?? '').toLowerCase().includes(q);
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchCat    = filterCat === 'all'    || a.category === filterCat;
        return matchQ && matchStatus && matchCat;
      })
      .sort((a, b) => {
        let av: string | number = a[sortKey] ?? '';
        let bv: string | number = b[sortKey] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [assetList, search, filterStatus, filterCat, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={13} style={{ opacity: 0.25 }} />;
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  }

  // ── Handlers ────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormErr('');
    setShowAdd(true);
  }

  function openEdit(a: Asset) {
    const { id, ...rest } = a;
    setForm(rest);
    setEditAsset(a);
    setFormErr('');
  }

  async function handleSave() {
    if (!form.name.trim() || !form.tag.trim() || !form.location.trim()) {
      setFormErr('Name, Tag and Location are required.');
      return;
    }
    try {
      if (editAsset) {
        await apiFetch(`/assets/${editAsset.id}`, { method: 'PUT', body: JSON.stringify(form) });
        setEditAsset(null);
      } else {
        await apiFetch('/assets', { method: 'POST', body: JSON.stringify(form) });
        setShowAdd(false);
      }
      setFormErr('');
      await refreshData();
    } catch (e: any) {
      setFormErr(e.message);
    }
  }

  async function handleDelete() {
    if (!deleteAsset) return;
    try {
      await apiFetch(`/assets/${deleteAsset.id}`, { method: 'DELETE' });
      setDeleteAsset(null);
      await refreshData();
    } catch (e: any) {
      alert(e.message);
    }
  }

  function clearFilters() {
    setSearch(''); setFilterStatus('all'); setFilterCat('all'); setPage(1);
  }

  const hasFilters = search || filterStatus !== 'all' || filterCat !== 'all';

  // Summary stats
  const stats = useMemo(() => ({
    total:       assetList.length,
    available:   assetList.filter(a => a.status === 'available').length,
    allocated:   assetList.filter(a => a.status === 'allocated').length,
    maintenance: assetList.filter(a => a.status === 'maintenance').length,
  }), [assetList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Registry</h1>
          <p className="page-subtitle">
            {stats.total} assets tracked &nbsp;·&nbsp; {stats.available} available &nbsp;·&nbsp; {stats.allocated} deployed
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => alert('CSV export coming soon!')}>
            <Download size={15} /> Export CSV
          </button>
          {isManager && (
            <button className="btn btn-primary" id="add-asset-btn" onClick={openAdd}>
              <Plus size={15} /> Add Asset
            </button>
          )}
        </div>
      </div>

      {/* ── Mini stat strip ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total',       value: stats.total,       color: 'var(--accent)',   bg: 'var(--accent-light)' },
          { label: 'Available',   value: stats.available,   color: 'var(--success)',  bg: 'var(--success-light)' },
          { label: 'Deployed',    value: stats.allocated,   color: 'var(--info)',     bg: 'var(--info-light)' },
          { label: 'Maintenance', value: stats.maintenance, color: 'var(--warning)',  bg: 'var(--warning-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              <Package size={16} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="filter-row">
        <div className="search-bar" style={{ minWidth: 260, flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            id="asset-search"
            placeholder="Search by name, tag, serial, location…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <select className="filter-select" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} of {assetList.length} assets
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Asset <SortIcon k="name" /></span>
              </th>
              <th onClick={() => toggleSort('tag')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Tag <SortIcon k="tag" /></span>
              </th>
              <th onClick={() => toggleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Category <SortIcon k="category" /></span>
              </th>
              <th>Location</th>
              <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Status <SortIcon k="status" /></span>
              </th>
              <th onClick={() => toggleSort('purchasePrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Value <SortIcon k="purchasePrice" /></span>
              </th>
              <th onClick={() => toggleSort('purchaseDate')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Purchased <SortIcon k="purchaseDate" /></span>
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon"><Package size={24} /></div>
                    <div className="empty-title">No assets found</div>
                    <div className="empty-desc">Try adjusting your filters or add a new asset.</div>
                  </div>
                </td>
              </tr>
            ) : paginated.map(asset => (
              <tr key={asset.id}>
                {/* Asset name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Package size={15} color="var(--accent)" />
                    </div>
                    <div>
                      <div className="td-primary">{asset.name}</div>
                      {asset.serialNumber && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>S/N: {asset.serialNumber}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Tag */}
                <td>
                  <code style={{ fontSize: '0.78rem', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                    {asset.tag}
                  </code>
                </td>

                {/* Category */}
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                  {getCategoryLabel(asset.category)}
                </td>

                {/* Location */}
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {asset.location}
                </td>

                {/* Status */}
                <td>
                  <span className={`badge ${STATUS_COLORS[asset.status]}`}>
                    {statusIcon(asset.status)}
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </td>

                {/* Value */}
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {asset.purchasePrice > 0 ? `$${asset.purchasePrice.toLocaleString()}` : '—'}
                </td>

                {/* Purchase date */}
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {formatDate(asset.purchaseDate)}
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      data-tooltip="View details"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Eye size={14} />
                    </button>
                    {isManager && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => openEdit(asset)}
                          data-tooltip="Edit"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteAsset(asset)}
                          data-tooltip="Delete"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} results
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {(showAdd || editAsset) && (
        <AssetFormModal
          form={form}
          error={formErr}
          isEdit={!!editAsset}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditAsset(null); setFormErr(''); }}
        />
      )}

      {/* ── Delete confirm ───────────────────────────────── */}
      {deleteAsset && (
        <div className="modal-overlay" onClick={() => setDeleteAsset(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--danger)' }}>Delete Asset</span>
              <button className="icon-btn" onClick={() => setDeleteAsset(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteAsset.name}</strong> ({deleteAsset.tag})?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteAsset(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Asset Form Modal ───────────────────────────────────────

function AssetFormModal({
  form, error, isEdit, onChange, onSave, onClose,
}: {
  form: Omit<Asset, 'id'>; error: string; isEdit: boolean;
  onChange: (f: Omit<Asset, 'id'>) => void;
  onSave: () => void; onClose: () => void;
}) {
  const f = (key: keyof Omit<Asset, 'id'>, val: any) =>
    onChange({ ...form, [key]: val });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <Package size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
            {isEdit ? 'Edit Asset' : 'Add New Asset'}
          </span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Asset Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. MacBook Pro 16" />
            </div>
            <div className="form-group">
              <label className="form-label">Asset Tag <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" value={form.tag} onChange={e => f('tag', e.target.value)} placeholder="e.g. AF-LPT-001" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => f('category', e.target.value as AssetCategory)}>
                {(['laptop','desktop','mobile','tablet','monitor','printer','projector','server','networking','furniture','vehicle','meeting_room','other'] as AssetCategory[])
                  .map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => f('status', e.target.value as AssetStatus)}>
                {(['available','allocated','maintenance','retired'] as AssetStatus[]).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Engineering - Floor 3" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input className="form-input" type="date" value={form.purchaseDate} onChange={e => f('purchaseDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price ($)</label>
              <input className="form-input" type="number" min={0} value={form.purchasePrice} onChange={e => f('purchasePrice', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input className="form-input" value={form.serialNumber ?? ''} onChange={e => f('serialNumber', e.target.value)} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty Expiry</label>
              <input className="form-input" type="date" value={form.warrantyExpiry ?? ''} onChange={e => f('warrantyExpiry', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={3} value={form.notes ?? ''} onChange={e => f('notes', e.target.value)} placeholder="Optional notes or remarks" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="is-bookable" checked={form.isBookable} onChange={e => f('isBookable', e.target.checked)} />
            <label htmlFor="is-bookable" style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Make this asset bookable (meeting rooms, shared equipment)
            </label>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginTop: 4 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>
            {isEdit ? <><Edit2 size={14} /> Update Asset</> : <><Plus size={14} /> Add Asset</>}
          </button>
        </div>
      </div>
    </div>
  );
}
