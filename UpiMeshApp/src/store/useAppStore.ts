import { create } from 'zustand';
import { Account, FlushResult, MeshState, Transaction, NodeProfile } from '../api/apiClient';
import { setBaseUrl, getBaseUrl } from '../api/apiClient';

interface AppState {
  // Backend URL
  baseUrl: string;
  setBaseUrl: (url: string) => void;

  // Mesh state
  meshState: MeshState | null;
  setMeshState: (s: MeshState) => void;

  // Sync state
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
  isSyncing: boolean;
  setIsSyncing: (v: boolean) => void;

  // Mesh logs
  meshLogs: { time: string; message: string }[];
  addLog: (log: string) => void;
  clearLogs: () => void;

  // Accounts
  accounts: Account[];
  prevAccounts: Account[];
  setAccounts: (a: Account[]) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;

  // Last gossip result
  lastGossipTransfers: number | null;
  setLastGossipTransfers: (n: number | null) => void;

  // Last flush results
  flushResults: FlushResult[];
  setFlushResults: (r: FlushResult[]) => void;
  showFlushModal: boolean;
  setShowFlushModal: (v: boolean) => void;

  // Last injected packet
  lastPacket: { packetId: string; ciphertextPreview: string; ttl: number; injectedAt: string } | null;
  setLastPacket: (p: AppState['lastPacket']) => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Profile State
  nodeProfile: NodeProfile | null;
  setNodeProfile: (p: NodeProfile) => void;

  // Navbar Tabs
  activeDashboardTab: 'stats' | 'traffic';
  setActiveDashboardTab: (tab: 'stats' | 'traffic') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  baseUrl: getBaseUrl(),
  setBaseUrl: (url: string) => {
    setBaseUrl(url);
    set({ baseUrl: url });
  },

  meshState: null,
  setMeshState: (s) => set({ meshState: s }),

  isOnline: false,
  setIsOnline: (v) => set({ isOnline: v }),
  isSyncing: false,
  setIsSyncing: (v) => set({ isSyncing: v }),

  meshLogs: [],
  addLog: (log) => set((state) => ({
    meshLogs: [...state.meshLogs, {
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: log,
    }].slice(-100), // Keep last 100 logs
  })),
  clearLogs: () => set({ meshLogs: [] }),

  accounts: [],
  prevAccounts: [],
  setAccounts: (a) => set((state) => ({ prevAccounts: state.accounts, accounts: a })),

  transactions: [],
  setTransactions: (t) => set({ transactions: t }),

  lastGossipTransfers: null,
  setLastGossipTransfers: (n) => set({ lastGossipTransfers: n }),

  flushResults: [],
  setFlushResults: (r) => set({ flushResults: r }),
  showFlushModal: false,
  setShowFlushModal: (v) => set({ showFlushModal: v }),

  lastPacket: null,
  setLastPacket: (p) => set({ lastPacket: p }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  nodeProfile: null,
  setNodeProfile: (p) => set({ nodeProfile: p }),

  activeDashboardTab: 'stats',
  setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),
}));
