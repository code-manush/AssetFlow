import React, { createContext, useContext, useState, useEffect } from 'react';

// Re-using types from mockData (we can import them or redefine)
import type { Asset, AllocationRecord, MaintenanceRequest, Booking, User, Department } from '../data/mockData';

interface DataContextType {
  assets: Asset[];
  allocations: AllocationRecord[];
  maintenance: MaintenanceRequest[];
  bookings: Booking[];
  users: User[];
  departments: Department[];
  loading: boolean;
  refreshData: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getAssetById: (id: string) => Asset | undefined;
  getDeptById: (id: string) => Department | undefined;
  categoryBreakdown: any[];
  monthlyAssetData: any[];
  maintenanceTrend: any[];
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [ass, all, main, book, usr] = await Promise.all([
        fetch('http://localhost:5000/api/assets').then(r => r.json()),
        fetch('http://localhost:5000/api/allocations').then(r => r.json()),
        fetch('http://localhost:5000/api/maintenance').then(r => r.json()),
        fetch('http://localhost:5000/api/bookings').then(r => r.json()),
        fetch('http://localhost:5000/api/users').then(r => r.json()),
      ]);
      setAssets(ass || []);
      setAllocations(all || []);
      setMaintenance(main || []);
      setBookings(book || []);
      setUsers(usr || []);
      // Optional: if departments API exists, fetch it too.
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getAssetById = (id: string) => assets.find(a => a.id === id);
  const getDeptById = (id: string) => departments.find(d => d.id === id);

  // Derived metrics
  const categoryBreakdown = (() => {
    const cats: any = {};
    assets.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
    return Object.entries(cats).map(([name, value], i) => {
      const colors = ['#6366F1', '#22C55E', '#F59E0B', '#14B8A6', '#A855F7', '#3B82F6', '#94A3B8'];
      return { name, value, color: colors[i % colors.length] };
    });
  })();

  const monthlyAssetData = [
    { month: 'Jul', available: assets.filter(a => (a.status as string).toUpperCase() === 'AVAILABLE').length, allocated: assets.filter(a => (a.status as string).toUpperCase() === 'ALLOCATED').length, maintenance: assets.filter(a => (a.status as string).toUpperCase() === 'MAINTENANCE').length }
  ];

  const maintenanceTrend = [
    { month: 'Jul', requests: maintenance.length, resolved: maintenance.filter(m => (m.status as string).toUpperCase() === 'RESOLVED').length }
  ];

  return (
    <DataContext.Provider value={{
      assets, allocations, maintenance, bookings, users, departments,
      loading, refreshData, getUserById, getAssetById, getDeptById,
      categoryBreakdown, monthlyAssetData, maintenanceTrend
    }}>
      {children}
    </DataContext.Provider>
  );
};
