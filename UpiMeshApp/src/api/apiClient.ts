import axios from 'axios';
import { Platform } from 'react-native';

// Default for Android emulator. Use localhost on web.
let BASE_URL = Platform.OS === 'web' ? 'http://localhost:8082' : 'http://10.0.2.2:8082';

export const setBaseUrl = (url: string) => {
  BASE_URL = url.replace(/\/$/, ''); // strip trailing slash
  api.defaults.baseURL = BASE_URL;
};

export const getBaseUrl = () => BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Account {
  vpa: string;
  holderName: string;
  balance: number;
  version: number;
}

export interface Transaction {
  id: number;
  packetHash: string;
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  signedAt: string;
  settledAt: string;
  bridgeNodeId: string;
  hopCount: number;
  status: 'SETTLED' | 'REJECTED';
}

export interface DeviceState {
  deviceId: string;
  hasInternet: boolean;
  packetCount: number;
  packetIds: string[];
}

export interface MeshState {
  devices: DeviceState[];
  idempotencyCacheSize: number;
}

export interface ServerKey {
  publicKey: string;
  algorithm: string;
  hybridScheme: string;
}

export interface SendRequest {
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  pin: string;
  ttl?: number;
}

export interface SendResponse {
  packetId: string;
  ciphertextPreview: string;
  ttl: number;
  injectedAt: string;
}

export interface FlushResult {
  bridgeNode: string;
  packetId: string;
  outcome: 'SETTLED' | 'DUPLICATE_DROPPED' | 'INVALID';
  reason: string;
  transactionId: number;
}

export interface FlushResponse {
  uploadsAttempted: number;
  results: FlushResult[];
}

export interface GossipResponse {
  transfers: number;
  deviceCounts: Record<string, number>;
}

export interface NodeProfile {
  id: string;
  name: string;
  avatarBase64: string | null;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const apiClient = {
  getAccounts: () => api.get<Account[]>('/api/accounts').then(r => r.data),

  getTransactions: () => api.get<Transaction[]>('/api/transactions').then(r => r.data),

  getMeshState: () => api.get<MeshState>('/api/mesh/state').then(r => r.data),

  getServerKey: () => api.get<ServerKey>('/api/server-key').then(r => r.data),

  sendPayment: (req: SendRequest) =>
    api.post<SendResponse>('/api/demo/send', req).then(r => r.data),

  gossip: () => api.post<GossipResponse>('/api/mesh/gossip').then(r => r.data),

  flush: () => api.post<FlushResponse>('/api/mesh/flush').then(r => r.data),

  reset: () => api.post<{ status: string }>('/api/mesh/reset').then(r => r.data),

  getProfile: () => api.get<NodeProfile>('/api/profile').then(r => r.data),

  updateProfile: (data: { name?: string; avatarBase64?: string }) => 
    api.put<NodeProfile>('/api/profile', data).then(r => r.data),

  testConnection: async () => {
    try {
      await api.get('/api/accounts', { timeout: 4000 });
      return true;
    } catch {
      return false;
    }
  },
};
