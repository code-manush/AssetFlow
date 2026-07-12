// ============================================================
// AssetFlow — Mock Data Store
// ============================================================


export type UserRole = 'admin' | 'asset_manager' | 'employee';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string; // department id
  avatar?: string;
  status: UserStatus;
  joinedAt: string;
}

export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'monitor'
  | 'printer'
  | 'projector'
  | 'server'
  | 'networking'
  | 'furniture'
  | 'vehicle'
  | 'meeting_room'
  | 'other';

export type AssetStatus = 'available' | 'allocated' | 'maintenance' | 'retired';

export interface Asset {
  id: string;
  name: string;
  tag: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  department?: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry?: string;
  serialNumber?: string;
  assignedTo?: string;
  isBookable: boolean;
  notes?: string;
}

export type AllocationStatus = 'active' | 'overdue' | 'returned' | 'transfer_requested';

export interface AllocationRecord {
  id: string;
  assetId: string;
  userId: string;
  departmentId: string;
  allocatedAt: string;
  expectedReturn: string | null;
  returnedAt: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  status: AllocationStatus;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromUserId: string;
  toUserId: string;
  requestedBy: string;
  requestedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export type MaintenancePriority = 'critical' | 'high' | 'medium' | 'low';
export type MaintenanceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'resolved';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  raisedBy: string;
  assignedTo: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  issue: string;
  notes: string;
  raisedAt: string;
  resolvedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface Booking {
  id: string;
  assetId: string;
  userId: string;
  departmentId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export type DepartmentStatus = 'active' | 'inactive';

export interface Department {
  id: string;
  name: string;
  head: string;
  status: DepartmentStatus;
  budget: number;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering',       head: 'u1', status: 'active', budget: 500000 },
  { id: 'd2', name: 'Operations',        head: 'u2', status: 'active', budget: 300000 },
  { id: 'd3', name: 'Human Resources',   head: 'u3', status: 'active', budget: 200000 },
  { id: 'd4', name: 'Finance',           head: 'u4', status: 'active', budget: 250000 },
  { id: 'd5', name: 'Marketing',         head: 'u5', status: 'active', budget: 350000 },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u1', name: 'Alex Rivera',    email: 'alex.rivera@assetflow.io',
    role: 'admin',          department: 'd1', status: 'active', joinedAt: '2022-01-15',
  },
  {
    id: 'u2', name: 'Priya Sharma',   email: 'priya.sharma@assetflow.io',
    role: 'asset_manager',  department: 'd2', status: 'active', joinedAt: '2022-03-10',
  },
  {
    id: 'u3', name: 'James Okafor',   email: 'james.okafor@assetflow.io',
    role: 'asset_manager',  department: 'd3', status: 'active', joinedAt: '2022-06-01',
  },
  {
    id: 'u4', name: 'Sara Chen',      email: 'sara.chen@assetflow.io',
    role: 'employee',        department: 'd1', status: 'active', joinedAt: '2023-02-20',
  },
  {
    id: 'u5', name: 'Marco Bianchi',  email: 'marco.bianchi@assetflow.io',
    role: 'employee',        department: 'd4', status: 'active', joinedAt: '2023-04-12',
  },
  {
    id: 'u6', name: 'Fatima Al-Zahra',email: 'fatima.alzahra@assetflow.io',
    role: 'employee',        department: 'd5', status: 'active', joinedAt: '2023-07-01',
  },
  {
    id: 'u7', name: 'Liu Yang',       email: 'liu.yang@assetflow.io',
    role: 'employee',        department: 'd2', status: 'active', joinedAt: '2023-09-15',
  },
  {
    id: 'u8', name: 'Aisha Patel',    email: 'aisha.patel@assetflow.io',
    role: 'employee',        department: 'd3', status: 'inactive', joinedAt: '2022-11-01',
  },
];

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assets: Asset[] = [
  {
    id: 'a1', name: 'MacBook Pro 16"', tag: 'AF-LPT-001', category: 'laptop',
    status: 'allocated', location: 'Engineering - Floor 3', department: 'd1',
    purchaseDate: '2023-01-15', purchasePrice: 2499, warrantyExpiry: '2026-01-15',
    serialNumber: 'SN-MBP-2023-001', assignedTo: 'u4', isBookable: false,
  },
  {
    id: 'a2', name: 'Dell XPS 15', tag: 'AF-LPT-002', category: 'laptop',
    status: 'allocated', location: 'Finance - Floor 2', department: 'd4',
    purchaseDate: '2023-03-20', purchasePrice: 1899, warrantyExpiry: '2026-03-20',
    serialNumber: 'SN-DXPS-2023-002', assignedTo: 'u5', isBookable: false,
  },
  {
    id: 'a3', name: 'ThinkPad X1 Carbon', tag: 'AF-LPT-003', category: 'laptop',
    status: 'available', location: 'IT Storage', department: undefined,
    purchaseDate: '2022-11-10', purchasePrice: 1650, warrantyExpiry: '2025-11-10',
    serialNumber: 'SN-TPX1-2022-003', assignedTo: undefined, isBookable: false,
  },
  {
    id: 'a4', name: 'HP EliteDesk 800', tag: 'AF-DSK-001', category: 'desktop',
    status: 'allocated', location: 'HR - Floor 1', department: 'd3',
    purchaseDate: '2022-06-01', purchasePrice: 1200, warrantyExpiry: '2025-06-01',
    serialNumber: 'SN-HPED-2022-001', assignedTo: 'u3', isBookable: false,
  },
  {
    id: 'a5', name: 'iPhone 15 Pro', tag: 'AF-MOB-001', category: 'mobile',
    status: 'allocated', location: 'Marketing - Floor 4', department: 'd5',
    purchaseDate: '2023-10-01', purchasePrice: 1199, warrantyExpiry: '2024-10-01',
    serialNumber: 'SN-IP15-2023-001', assignedTo: 'u6', isBookable: false,
  },
  {
    id: 'a6', name: 'Samsung Galaxy S24', tag: 'AF-MOB-002', category: 'mobile',
    status: 'maintenance', location: 'IT Storage', department: undefined,
    purchaseDate: '2024-01-10', purchasePrice: 999, warrantyExpiry: '2026-01-10',
    serialNumber: 'SN-SGS24-2024-002', assignedTo: undefined, isBookable: false,
    notes: 'Screen cracked — sent for repair',
  },
  {
    id: 'a7', name: 'LG UltraWide 34"', tag: 'AF-MON-001', category: 'monitor',
    status: 'available', location: 'IT Storage', department: undefined,
    purchaseDate: '2023-02-28', purchasePrice: 799, warrantyExpiry: '2026-02-28',
    serialNumber: 'SN-LGM-2023-001', assignedTo: undefined, isBookable: false,
  },
  {
    id: 'a8', name: 'Epson EB-2250U Projector', tag: 'AF-PRJ-001', category: 'projector',
    status: 'available', location: 'Meeting Room A', department: undefined,
    purchaseDate: '2022-09-15', purchasePrice: 1350, warrantyExpiry: '2025-09-15',
    serialNumber: 'SN-EPR-2022-001', assignedTo: undefined, isBookable: true,
  },
  {
    id: 'a9', name: 'Conference Room Alpha', tag: 'AF-ROOM-001', category: 'meeting_room',
    status: 'available', location: 'Floor 2 - East Wing', department: undefined,
    purchaseDate: '2020-01-01', purchasePrice: 0, warrantyExpiry: undefined,
    serialNumber: undefined, assignedTo: undefined, isBookable: true,
    notes: 'Capacity: 12 people. Has AV setup.',
  },
  {
    id: 'a10', name: 'Conference Room Beta', tag: 'AF-ROOM-002', category: 'meeting_room',
    status: 'available', location: 'Floor 3 - West Wing', department: undefined,
    purchaseDate: '2020-01-01', purchasePrice: 0, warrantyExpiry: undefined,
    serialNumber: undefined, assignedTo: undefined, isBookable: true,
    notes: 'Capacity: 6 people. Whiteboard available.',
  },
  {
    id: 'a11', name: 'Dell PowerEdge R750', tag: 'AF-SRV-001', category: 'server',
    status: 'allocated', location: 'Data Center', department: 'd1',
    purchaseDate: '2022-04-01', purchasePrice: 8500, warrantyExpiry: '2027-04-01',
    serialNumber: 'SN-DPE-2022-001', assignedTo: undefined, isBookable: false,
  },
  {
    id: 'a12', name: 'Cisco Catalyst 9300', tag: 'AF-NET-001', category: 'networking',
    status: 'allocated', location: 'Server Room', department: 'd1',
    purchaseDate: '2021-11-20', purchasePrice: 3200, warrantyExpiry: '2026-11-20',
    serialNumber: 'SN-CSC-2021-001', assignedTo: undefined, isBookable: false,
  },
  {
    id: 'a13', name: 'HP LaserJet Pro M428', tag: 'AF-PRT-001', category: 'printer',
    status: 'available', location: 'HR - Floor 1', department: 'd3',
    purchaseDate: '2023-05-10', purchasePrice: 450, warrantyExpiry: '2026-05-10',
    serialNumber: 'SN-HPLJ-2023-001', assignedTo: undefined, isBookable: false,
  },
  {
    id: 'a14', name: 'iPad Pro 12.9"', tag: 'AF-TAB-001', category: 'tablet',
    status: 'allocated', location: 'Operations - Floor 2', department: 'd2',
    purchaseDate: '2023-08-01', purchasePrice: 1099, warrantyExpiry: '2025-08-01',
    serialNumber: 'SN-IPAD-2023-001', assignedTo: 'u7', isBookable: false,
  },
  {
    id: 'a15', name: 'Toyota Innova (MH-12 AB 4321)', tag: 'AF-VEH-001', category: 'vehicle',
    status: 'available', location: 'Ground Floor Parking', department: undefined,
    purchaseDate: '2022-07-15', purchasePrice: 22000, warrantyExpiry: '2025-07-15',
    serialNumber: 'VIN-TOYINN-2022-001', assignedTo: undefined, isBookable: true,
    notes: 'Company vehicle — requires valid license.',
  },
];

// ─── Allocation Records ────────────────────────────────────────────────────────

export const allocationRecords: AllocationRecord[] = [
  {
    id: 'al1', assetId: 'a1', userId: 'u4', departmentId: 'd1',
    allocatedAt: '2024-01-10', expectedReturn: '2025-01-10', returnedAt: null,
    condition: 'good', notes: 'Assigned for project Alpha development', status: 'active',
  },
  {
    id: 'al2', assetId: 'a2', userId: 'u5', departmentId: 'd4',
    allocatedAt: '2024-02-01', expectedReturn: '2024-08-01', returnedAt: null,
    condition: 'good', notes: 'Financial reporting workstation', status: 'overdue',
  },
  {
    id: 'al3', assetId: 'a4', userId: 'u3', departmentId: 'd3',
    allocatedAt: '2023-07-01', expectedReturn: null, returnedAt: null,
    condition: 'excellent', notes: 'Permanent desk setup for HR manager', status: 'active',
  },
  {
    id: 'al4', assetId: 'a5', userId: 'u6', departmentId: 'd5',
    allocatedAt: '2023-10-15', expectedReturn: '2025-10-15', returnedAt: null,
    condition: 'excellent', notes: 'Marketing communications device', status: 'active',
  },
  {
    id: 'al5', assetId: 'a14', userId: 'u7', departmentId: 'd2',
    allocatedAt: '2023-09-01', expectedReturn: '2024-09-01', returnedAt: null,
    condition: 'good', notes: 'Field operations tablet', status: 'active',
  },
  {
    id: 'al6', assetId: 'a11', userId: 'u1', departmentId: 'd1',
    allocatedAt: '2022-04-05', expectedReturn: null, returnedAt: null,
    condition: 'excellent', notes: 'Engineering server — permanent allocation', status: 'active',
  },
  {
    id: 'al7', assetId: 'a3', userId: 'u8', departmentId: 'd3',
    allocatedAt: '2023-01-10', expectedReturn: '2023-07-10', returnedAt: '2023-07-08',
    condition: 'good', notes: 'Short-term project assignment', status: 'returned',
  },
  {
    id: 'al8', assetId: 'a7', userId: 'u4', departmentId: 'd1',
    allocatedAt: '2023-03-01', expectedReturn: '2023-09-01', returnedAt: '2023-08-28',
    condition: 'excellent', notes: 'Dual monitor setup trial', status: 'returned',
  },
];

// ─── Transfer Requests ────────────────────────────────────────────────────────

export const transferRequests: TransferRequest[] = [
  {
    id: 'tr1', assetId: 'a2', fromUserId: 'u5', toUserId: 'u4',
    requestedBy: 'u5', requestedAt: '2024-07-20', approvedAt: null, approvedBy: null,
    status: 'pending', notes: 'Marco is moving to a different role — Sara needs the XPS.',
  },
  {
    id: 'tr2', assetId: 'a1', fromUserId: 'u4', toUserId: 'u7',
    requestedBy: 'u2', requestedAt: '2024-06-15', approvedAt: '2024-06-18', approvedBy: 'u1',
    status: 'approved', notes: 'Liu Yang joining the Engineering project team.',
  },
  {
    id: 'tr3', assetId: 'a5', fromUserId: 'u6', toUserId: 'u3',
    requestedBy: 'u6', requestedAt: '2024-05-10', approvedAt: '2024-05-12', approvedBy: 'u2',
    status: 'rejected', notes: 'Phone required in HR for client outreach.',
  },
];

// ─── Maintenance Requests ─────────────────────────────────────────────────────

export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'm1', assetId: 'a6', raisedBy: 'u6', assignedTo: 'u2',
    priority: 'critical', status: 'in_progress',
    issue: 'Screen completely cracked after drop. Device unusable.',
    notes: 'Screen replacement ordered — ETA 3 business days.',
    raisedAt: '2024-07-18', resolvedAt: null, approvedAt: '2024-07-19', approvedBy: 'u1',
  },
  {
    id: 'm2', assetId: 'a1', raisedBy: 'u4', assignedTo: null,
    priority: 'high', status: 'pending',
    issue: 'Battery drains to 0% within 2 hours. Possible battery failure.',
    notes: '',
    raisedAt: '2024-07-22', resolvedAt: null, approvedAt: null, approvedBy: null,
  },
  {
    id: 'm3', assetId: 'a13', raisedBy: 'u3', assignedTo: 'u2',
    priority: 'medium', status: 'approved',
    issue: 'Printer jamming frequently on A4 paper. Paper sensor may be faulty.',
    notes: '',
    raisedAt: '2024-07-15', resolvedAt: null, approvedAt: '2024-07-16', approvedBy: 'u1',
  },
  {
    id: 'm4', assetId: 'a12', raisedBy: 'u1', assignedTo: 'u2',
    priority: 'high', status: 'resolved',
    issue: 'Network switch port 12-16 dropping packets intermittently.',
    notes: 'Firmware updated to v16.12.3. Ports stable post-update.',
    raisedAt: '2024-07-01', resolvedAt: '2024-07-08', approvedAt: '2024-07-02', approvedBy: 'u1',
  },
  {
    id: 'm5', assetId: 'a4', raisedBy: 'u3', assignedTo: null,
    priority: 'low', status: 'pending',
    issue: 'Keyboard spacebar key feels sticky. Minor inconvenience.',
    notes: '',
    raisedAt: '2024-07-23', resolvedAt: null, approvedAt: null, approvedBy: null,
  },
  {
    id: 'm6', assetId: 'a8', raisedBy: 'u7', assignedTo: null,
    priority: 'medium', status: 'rejected',
    issue: 'Projector lamp appears dim compared to last month.',
    notes: '',
    raisedAt: '2024-07-10', resolvedAt: null, approvedAt: null, approvedBy: 'u2',
  },
  {
    id: 'm7', assetId: 'a2', raisedBy: 'u5', assignedTo: 'u3',
    priority: 'high', status: 'in_progress',
    issue: 'Thermal throttling at high CPU load — fan making loud noise.',
    notes: 'Thermal paste replacement scheduled.',
    raisedAt: '2024-07-12', resolvedAt: null, approvedAt: '2024-07-13', approvedBy: 'u2',
  },
  {
    id: 'm8', assetId: 'a15', raisedBy: 'u2', assignedTo: 'u3',
    priority: 'critical', status: 'resolved',
    issue: 'Brake pads worn out. Vehicle unsafe to drive.',
    notes: 'Brake pads + rotors replaced. Full safety inspection passed.',
    raisedAt: '2024-06-20', resolvedAt: '2024-06-25', approvedAt: '2024-06-21', approvedBy: 'u1',
  },
];

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings: Booking[] = [
  {
    id: 'b1', assetId: 'a9', userId: 'u1', departmentId: 'd1',
    startTime: '2024-07-15T09:00:00', endTime: '2024-07-15T11:00:00',
    purpose: 'Q3 Engineering All-Hands Meeting', status: 'completed',
    createdAt: '2024-07-10T08:00:00',
  },
  {
    id: 'b2', assetId: 'a9', userId: 'u3', departmentId: 'd3',
    startTime: '2024-07-15T14:00:00', endTime: '2024-07-15T16:00:00',
    purpose: 'HR Policy Review — Quarterly', status: 'completed',
    createdAt: '2024-07-11T10:30:00',
  },
  {
    id: 'b3', assetId: 'a10', userId: 'u5', departmentId: 'd4',
    startTime: '2024-07-16T10:00:00', endTime: '2024-07-16T12:00:00',
    purpose: 'Finance Board Presentation', status: 'completed',
    createdAt: '2024-07-12T09:00:00',
  },
  {
    id: 'b4', assetId: 'a8', userId: 'u6', departmentId: 'd5',
    startTime: '2024-07-18T15:00:00', endTime: '2024-07-18T17:00:00',
    purpose: 'Marketing Campaign Pitch — Client Alpha', status: 'completed',
    createdAt: '2024-07-13T14:00:00',
  },
  {
    id: 'b5', assetId: 'a9', userId: 'u2', departmentId: 'd2',
    startTime: '2024-07-25T10:00:00', endTime: '2024-07-25T12:00:00',
    purpose: 'Vendor Onboarding Session', status: 'upcoming',
    createdAt: '2024-07-20T11:00:00',
  },
  {
    id: 'b6', assetId: 'a15', userId: 'u7', departmentId: 'd2',
    startTime: '2024-07-26T08:00:00', endTime: '2024-07-26T17:00:00',
    purpose: 'Site visit — client facility in Pune', status: 'upcoming',
    createdAt: '2024-07-21T09:00:00',
  },
  {
    id: 'b7', assetId: 'a10', userId: 'u4', departmentId: 'd1',
    startTime: '2024-07-28T13:00:00', endTime: '2024-07-28T15:00:00',
    purpose: 'Sprint retrospective and planning', status: 'upcoming',
    createdAt: '2024-07-22T16:00:00',
  },
  {
    id: 'b8', assetId: 'a9', userId: 'u1', departmentId: 'd1',
    startTime: '2024-07-24T09:00:00', endTime: '2024-07-24T10:30:00',
    purpose: 'Leadership sync — operations review', status: 'cancelled',
    createdAt: '2024-07-20T14:00:00',
  },
];

// ─── Analytics helpers (static aggregates for charts) ─────────────────────────

export const monthlyAssetData = [
  { month: 'Feb', available: 6, allocated: 7, maintenance: 1 },
  { month: 'Mar', available: 5, allocated: 8, maintenance: 2 },
  { month: 'Apr', available: 7, allocated: 9, maintenance: 1 },
  { month: 'May', available: 6, allocated: 10, maintenance: 2 },
  { month: 'Jun', available: 5, allocated: 11, maintenance: 1 },
  { month: 'Jul', available: 6, allocated: 10, maintenance: 2 },
];

export const categoryBreakdown = [
  { name: 'Laptops',       value: 3,  color: '#6366F1' },
  { name: 'Desktops',      value: 1,  color: '#22C55E' },
  { name: 'Mobile',        value: 2,  color: '#F59E0B' },
  { name: 'Networking',    value: 1,  color: '#14B8A6' },
  { name: 'Servers',       value: 1,  color: '#A855F7' },
  { name: 'Meeting Rooms', value: 2,  color: '#3B82F6' },
  { name: 'Others',        value: 4,  color: '#94A3B8' },
];

export const maintenanceTrend = [
  { month: 'Feb', requests: 2, resolved: 1 },
  { month: 'Mar', requests: 4, resolved: 3 },
  { month: 'Apr', requests: 3, resolved: 3 },
  { month: 'May', requests: 5, resolved: 4 },
  { month: 'Jun', requests: 6, resolved: 5 },
  { month: 'Jul', requests: 8, resolved: 5 },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getAssetById(id: string): Asset | undefined {
  return assets.find(a => a.id === id);
}

export function getDeptById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getCategoryLabel(cat: AssetCategory): string {
  const map: Record<AssetCategory, string> = {
    laptop: 'Laptop', desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet',
    monitor: 'Monitor', printer: 'Printer', projector: 'Projector', server: 'Server',
    networking: 'Networking', furniture: 'Furniture', vehicle: 'Vehicle',
    meeting_room: 'Meeting Room', other: 'Other',
  };
  return map[cat] ?? cat;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
