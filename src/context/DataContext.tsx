import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { HealthRecord, Request, Medicine, Expense, Notification, AuditLog, BackupRecord, MedicineDispensing, User, DataSnapshot } from '../types';
import * as db from '../lib/db';
import {
  mockUsers, mockCredentials, mockInventory, mockDispensingHistory,
  mockHealthRecords, mockRequests, mockExpenses, mockNotifications, mockAuditLogs, mockBackupRecords
} from '../data/mockData';

export type { DataSnapshot };

// Build the initial mock data snapshot for restoration
export function buildInitialMockDataSnapshot(): DataSnapshot {
  return {
    id: 'snapshot_initial_mock_data',
    name: 'Default Mock Data',
    createdAt: '2024-01-01T00:00:00',
    type: 'initial',
    data: {
      users: mockUsers,
      healthRecords: mockHealthRecords,
      requests: mockRequests,
      inventory: mockInventory,
      expenses: mockExpenses,
      notifications: mockNotifications,
      auditLogs: mockAuditLogs,
      dispensingHistory: mockDispensingHistory,
    },
  };
}

interface DataContextType {
  users: User[];
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
  inventory: Medicine[];
  setInventory: React.Dispatch<React.SetStateAction<Medicine[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  backupRecords: BackupRecord[];
  setBackupRecords: React.Dispatch<React.SetStateAction<BackupRecord[]>>;
  dispensingHistory: MedicineDispensing[];
  setDispensingHistory: React.Dispatch<React.SetStateAction<MedicineDispensing[]>>;
  snapshots: DataSnapshot[];
  addSnapshot: (snapshot: DataSnapshot) => void;
  resetAllData: () => void;
  restoreFromBackup: (backup: { users: User[]; healthRecords: HealthRecord[]; requests: Request[]; inventory: Medicine[]; expenses: Expense[]; notifications: Notification[]; auditLogs: AuditLog[]; dispensingHistory: MedicineDispensing[] }) => void;
  getInitialSnapshot: () => DataSnapshot | null;
  restoreUsersData: (users: User[]) => void;
  restoreMockData: () => Promise<void>;
  loading: boolean;
  loadError: string | null;
  persistHealthRecord: (record: HealthRecord) => Promise<void>;
  persistRequest: (req: Request) => Promise<void>;
  persistMedicine: (med: Medicine) => Promise<void>;
  persistExpense: (exp: Expense) => Promise<void>;
  persistNotification: (notif: Notification) => Promise<void>;
  persistDispensing: (d: MedicineDispensing) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  addAuditLog: (log: AuditLog) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { users, restoreUsers } = useAuth();
  const [healthRecords, setHealthRecordsState] = useState<HealthRecord[]>([]);
  const [requests, setRequestsState] = useState<Request[]>([]);
  const [inventory, setInventoryState] = useState<Medicine[]>([]);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogsState] = useState<AuditLog[]>([]);
  const [backupRecords, setBackupRecordsState] = useState<BackupRecord[]>([]);
  const [dispensingHistory, setDispensingHistoryState] = useState<MedicineDispensing[]>([]);
  const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load all data from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hr, req, med, exp, notif, audit, backup, disp, snap] = await Promise.all([
          db.fetchHealthRecords(),
          db.fetchRequests(),
          db.fetchMedicines(),
          db.fetchExpenses(),
          db.fetchNotifications(),
          db.fetchAuditLogs(),
          db.fetchBackupRecords(),
          db.fetchDispensing(),
          db.fetchSnapshots(),
        ]);
        if (cancelled) return;
        setHealthRecordsState(hr);
        setRequestsState(req);
        setInventoryState(med);
        setExpensesState(exp);
        setNotificationsState(notif);
        setAuditLogsState(audit);
        setBackupRecordsState(backup);
        setDispensingHistoryState(disp);
        setSnapshots(snap);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Wrapped setters that persist to Supabase
  const setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>> = useCallback((updater) => {
    setHealthRecordsState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: HealthRecord[]) => HealthRecord[])(prev) : updater;
      // Persist diff (upsert all for simplicity; Supabase upsert is idempotent by PK)
      db.upsertHealthRecords(next).catch((e) => console.error('persist healthRecords:', e));
      return next;
    });
  }, []);

  const setRequests: React.Dispatch<React.SetStateAction<Request[]>> = useCallback((updater) => {
    setRequestsState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: Request[]) => Request[])(prev) : updater;
      db.upsertRequestsAll(next).catch((e) => console.error('persist requests:', e));
      return next;
    });
  }, []);

  const setInventory: React.Dispatch<React.SetStateAction<Medicine[]>> = useCallback((updater) => {
    setInventoryState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: Medicine[]) => Medicine[])(prev) : updater;
      db.upsertMedicinesAll(next).catch((e) => console.error('persist inventory:', e));
      return next;
    });
  }, []);

  const setExpenses: React.Dispatch<React.SetStateAction<Expense[]>> = useCallback((updater) => {
    setExpensesState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: Expense[]) => Expense[])(prev) : updater;
      db.upsertExpensesAll(next).catch((e) => console.error('persist expenses:', e));
      return next;
    });
  }, []);

  const setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> = useCallback((updater) => {
    setNotificationsState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: Notification[]) => Notification[])(prev) : updater;
      db.upsertNotificationsAll(next).catch((e) => console.error('persist notifications:', e));
      return next;
    });
  }, []);

  const setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>> = useCallback((updater) => {
    setAuditLogsState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: AuditLog[]) => AuditLog[])(prev) : updater;
      db.upsertAuditLogsAll(next).catch((e) => console.error('persist auditLogs:', e));
      return next;
    });
  }, []);

  const setBackupRecords: React.Dispatch<React.SetStateAction<BackupRecord[]>> = useCallback((updater) => {
    setBackupRecordsState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: BackupRecord[]) => BackupRecord[])(prev) : updater;
      db.upsertBackupRecordsAll(next).catch((e) => console.error('persist backupRecords:', e));
      return next;
    });
  }, []);

  const setDispensingHistory: React.Dispatch<React.SetStateAction<MedicineDispensing[]>> = useCallback((updater) => {
    setDispensingHistoryState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: MedicineDispensing[]) => MedicineDispensing[])(prev) : updater;
      db.upsertDispensingAll(next).catch((e) => console.error('persist dispensing:', e));
      return next;
    });
  }, []);

  // Awaitable single-item persist helpers (update state + await DB write)
  const persistHealthRecord = useCallback(async (record: HealthRecord): Promise<void> => {
    setHealthRecordsState((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      return idx >= 0 ? prev.map((r) => (r.id === record.id ? record : r)) : [...prev, record];
    });
    await db.upsertHealthRecord(record);
  }, []);

  const persistRequest = useCallback(async (req: Request): Promise<void> => {
    setRequestsState((prev) => {
      const idx = prev.findIndex((r) => r.id === req.id);
      return idx >= 0 ? prev.map((r) => (r.id === req.id ? req : r)) : [...prev, req];
    });
    await db.upsertRequest(req);
  }, []);

  const persistMedicine = useCallback(async (med: Medicine): Promise<void> => {
    setInventoryState((prev) => {
      const idx = prev.findIndex((m) => m.id === med.id);
      return idx >= 0 ? prev.map((m) => (m.id === med.id ? med : m)) : [...prev, med];
    });
    await db.upsertMedicine(med);
  }, []);

  const persistExpense = useCallback(async (exp: Expense): Promise<void> => {
    setExpensesState((prev) => {
      const idx = prev.findIndex((e) => e.id === exp.id);
      return idx >= 0 ? prev.map((e) => (e.id === exp.id ? exp : e)) : [...prev, exp];
    });
    await db.upsertExpense(exp);
  }, []);

  const persistNotification = useCallback(async (notif: Notification): Promise<void> => {
    setNotificationsState((prev) => {
      const idx = prev.findIndex((n) => n.id === notif.id);
      return idx >= 0 ? prev.map((n) => (n.id === notif.id ? notif : n)) : [...prev, notif];
    });
    await db.upsertNotification(notif);
  }, []);

  const persistDispensing = useCallback(async (d: MedicineDispensing): Promise<void> => {
    setDispensingHistoryState((prev) => [...prev, d]);
    await db.upsertDispensing(d);
  }, []);

  const removeNotification = useCallback(async (id: string): Promise<void> => {
    setNotificationsState((prev) => prev.filter((n) => n.id !== id));
    await db.deleteNotificationRow(id);
  }, []);

  const addAuditLog = useCallback(async (log: AuditLog): Promise<void> => {
    setAuditLogsState((prev) => [...prev, log]);
    await db.upsertAuditLogsAll([log]);
  }, []);

  const addSnapshot = useCallback((snapshot: DataSnapshot) => {
    setSnapshots((prev) => [snapshot, ...prev].slice(0, 50));
    db.upsertSnapshot(snapshot).catch((e) => console.error('persist snapshot:', e));
  }, []);

  const resetAllData = useCallback(() => {
    const now = new Date();
    const preResetSnapshot: DataSnapshot = {
      id: `snapshot_${Date.now()}`,
      name: `Pre-reset snapshot ${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      createdAt: now.toISOString(),
      type: 'pre_reset',
      data: { users: [...users], healthRecords: [...healthRecords], requests: [...requests], inventory: [...inventory], expenses: [...expenses], notifications: [...notifications], auditLogs: [...auditLogs], dispensingHistory: [...dispensingHistory] },
    };
    setSnapshots((prev) => [preResetSnapshot, ...prev].slice(0, 50));
    setHealthRecordsState([]);
    setRequestsState([]);
    setInventoryState([]);
    setExpensesState([]);
    setNotificationsState([]);
    setAuditLogsState([]);
    setDispensingHistoryState([]);
    db.clearAllData().catch((e) => console.error('clearAllData:', e));
  }, [users, healthRecords, requests, inventory, expenses, notifications, auditLogs, dispensingHistory]);

  const restoreFromBackup = useCallback((backup: { users: User[]; healthRecords: HealthRecord[]; requests: Request[]; inventory: Medicine[]; expenses: Expense[]; notifications: Notification[]; auditLogs: AuditLog[]; dispensingHistory: MedicineDispensing[] }) => {
    setHealthRecordsState(backup.healthRecords);
    setRequestsState(backup.requests);
    setInventoryState(backup.inventory);
    setExpensesState(backup.expenses);
    setNotificationsState(backup.notifications);
    setAuditLogsState(backup.auditLogs);
    setDispensingHistoryState(backup.dispensingHistory);
    Promise.all([
      db.upsertHealthRecords(backup.healthRecords),
      db.upsertRequestsAll(backup.requests),
      db.upsertMedicinesAll(backup.inventory),
      db.upsertExpensesAll(backup.expenses),
      db.upsertNotificationsAll(backup.notifications),
      db.upsertAuditLogsAll(backup.auditLogs),
      db.upsertDispensingAll(backup.dispensingHistory),
    ]).catch((e) => console.error('restoreFromBackup:', e));
  }, []);

  const getInitialSnapshot = useCallback(() => snapshots.find((s) => s.type === 'initial') ?? null, [snapshots]);

  const restoreUsersData = useCallback((restoredUsers: User[]) => {
    restoreUsers(restoredUsers);
  }, [restoreUsers]);

  // Restore full mock data (users + all data)
  const restoreMockData = useCallback(async () => {
    const snapshot = buildInitialMockDataSnapshot();

    // Restore users first (via AuthContext)
    restoreUsers(snapshot.data.users);
    // Also restore credentials for mock users
    const credsToPersist: Record<string, string> = { ...mockCredentials };
    for (const u of snapshot.data.users) {
      const existingPw = await (async () => {
        const existing = await db.fetchUsers();
        const found = existing.users.find((eu) => eu.id === u.id);
        return found ? '' : '';
      })();
    }

    // Set all data in state
    setHealthRecordsState(snapshot.data.healthRecords);
    setRequestsState(snapshot.data.requests);
    setInventoryState(snapshot.data.inventory);
    setExpensesState(snapshot.data.expenses);
    setNotificationsState(snapshot.data.notifications);
    setAuditLogsState(snapshot.data.auditLogs);
    setDispensingHistoryState(snapshot.data.dispensingHistory);
    setBackupRecordsState(mockBackupRecords);

    // Persist all to Supabase
    await Promise.all([
      db.upsertUsers(snapshot.data.users, mockCredentials),
      db.upsertHealthRecords(snapshot.data.healthRecords),
      db.upsertRequestsAll(snapshot.data.requests),
      db.upsertMedicinesAll(snapshot.data.inventory),
      db.upsertExpensesAll(snapshot.data.expenses),
      db.upsertNotificationsAll(snapshot.data.notifications),
      db.upsertAuditLogsAll(snapshot.data.auditLogs),
      db.upsertDispensingAll(snapshot.data.dispensingHistory),
      db.upsertBackupRecordsAll(mockBackupRecords),
    ]);

    // Add the initial snapshot record
    await db.upsertSnapshot(snapshot);
    setSnapshots((prev) => {
      const filtered = prev.filter((s) => s.id !== snapshot.id);
      return [snapshot, ...filtered];
    });
  }, [restoreUsers]);

  return (
    <DataContext.Provider value={{
      users,
      healthRecords, setHealthRecords,
      requests, setRequests,
      inventory, setInventory,
      expenses, setExpenses,
      notifications, setNotifications,
      auditLogs, setAuditLogs,
      backupRecords, setBackupRecords,
      dispensingHistory, setDispensingHistory,
      snapshots,
      addSnapshot,
      resetAllData,
      restoreFromBackup,
      getInitialSnapshot,
      restoreUsersData,
      restoreMockData,
      loading,
      loadError,
      persistHealthRecord,
      persistRequest,
      persistMedicine,
      persistExpense,
      persistNotification,
      persistDispensing,
      removeNotification,
      addAuditLog,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
