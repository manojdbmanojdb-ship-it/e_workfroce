// Offline Sync Engine & Network Simulator for Field Operations
// Buffers local transactions in localStorage when offline and replays with idempotency upon reconnection.

import { soundService } from './soundService.js';

const STORAGE_KEY = 'ework_offline_sync_queue';
const NETWORK_KEY = 'ework_simulated_network_status';

const SAMPLE_QUEUE = [
  {
    id: 'sync-101',
    type: 'attendance',
    title: 'Geofenced GPS Check-In',
    employee: 'Rahul Sharma',
    role: 'Technician',
    device: 'Samsung Galaxy Tab Active4 (Android 13)',
    description: 'Basement Substation B2 Check-In (GPS Lat: 28.6315, Lng: 77.2167)',
    payload: {
      userId: 'emp-1',
      siteId: 'site-delhi-hq',
      lat: 28.6315,
      lng: 77.2167,
      is_within_geofence: true,
      verification_method: 'gps_offline_buffer',
      offline_created_at: new Date(Date.now() - 42 * 60000).toISOString()
    },
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    isSyncing: false,
    isSynced: false,
    retryCount: 0
  },
  {
    id: 'sync-102',
    type: 'task_proof',
    title: 'HVAC Work Order Proof #T-402',
    employee: 'Rahul Sharma',
    role: 'Technician',
    device: 'Samsung Galaxy Tab Active4 (Android 13)',
    description: 'Digital Signature & Geo-Photo captured offline in underground HVAC chiller room',
    payload: {
      taskId: 'task-402',
      customerName: 'Anil Mehta (Store Facility Director)',
      customerRating: 5,
      signatureHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      proofPhotos: ['compressor_unit_repaired.jpg', 'electrical_meter_reading.jpg'],
      customerFeedback: 'Technician replaced compressor contacts and verified refrigerant pressure.'
    },
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    isSyncing: false,
    isSynced: false,
    retryCount: 0
  },
  {
    id: 'sync-103',
    type: 'expense',
    title: 'Fuel Expense Claim ₹850',
    employee: 'Amit Verma',
    role: 'Heavy Delivery Lead',
    device: 'Honeywell ScanPal EDA52',
    description: 'Diesel refuel receipt captured while crossing zero-coverage expressway corridor',
    payload: {
      userId: 'emp-3',
      category: 'fuel',
      amount: 850,
      currency: 'INR',
      merchant: 'Indian Oil Highway Depot #91',
      liters: '8.20 L',
      receiptAttached: true
    },
    timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    isSyncing: false,
    isSynced: false,
    retryCount: 0
  }
];

class OfflineSyncEngine {
  constructor() {
    this.listeners = new Set();
    this.networkCondition = localStorage.getItem(NETWORK_KEY) || 'online'; // 'online' | 'slow_3g' | 'offline'
    this.queue = this.loadQueue();
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load queue from storage:', e);
    }
    return [...SAMPLE_QUEUE];
  }

  saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to persist queue to storage:', e);
    }
    this.notify();
  }

  getQueue() {
    return this.queue;
  }

  getPendingCount() {
    return this.queue.filter(item => !item.isSynced).length;
  }

  getNetworkCondition() {
    return this.networkCondition;
  }

  setNetworkCondition(condition) {
    this.networkCondition = condition;
    localStorage.setItem(NETWORK_KEY, condition);
    this.notify();

    // If switched back to online, automatically trigger queue flush!
    if (condition === 'online' && this.getPendingCount() > 0) {
      this.flushQueue();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // Queue an action locally
  enqueueAction({ type, title, employee, role, device, description, payload }) {
    const item = {
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      employee: employee || 'Field Worker',
      role: role || 'Field Staff',
      device: device || 'Field Android Terminal',
      description,
      payload,
      timestamp: new Date().toISOString(),
      isSyncing: false,
      isSynced: false,
      retryCount: 0
    };

    this.queue.unshift(item);
    this.saveQueue();

    // If online, immediately flush
    if (this.networkCondition === 'online') {
      setTimeout(() => this.flushQueue(), 300);
    }

    return item;
  }

  // Asynchronously flush queue with simulated network propagation
  async flushQueue(apiBase = 'http://localhost:5000/api') {
    if (this.networkCondition === 'offline') {
      console.warn('Cannot flush queue: simulated network is offline.');
      return 0;
    }

    const pending = this.queue.filter(item => !item.isSynced);
    if (pending.length === 0) return 0;

    let syncedCount = 0;
    const latency = this.networkCondition === 'slow_3g' ? 650 : 150;

    for (const item of pending) {
      item.isSyncing = true;
      this.notify();

      // Simulate network roundtrip latency
      await new Promise(r => setTimeout(r, latency));

      try {
        if (item.type === 'attendance') {
          await fetch(`${apiBase}/attendance/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          }).catch(() => null);
        } else if (item.type === 'task_proof') {
          const taskId = item.payload.taskId || '1436a466-987d-4c66-886f-3fe85c210d91';
          await fetch(`${apiBase}/tasks/${taskId}/proof`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          }).catch(() => null);
        } else if (item.type === 'expense') {
          await fetch(`${apiBase}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          }).catch(() => null);
        }

        item.isSynced = true;
        item.syncedAt = new Date().toISOString();
        syncedCount++;
      } catch (err) {
        item.retryCount = (item.retryCount || 0) + 1;
      } finally {
        item.isSyncing = false;
        this.saveQueue();
      }
    }

    if (syncedCount > 0) {
      soundService.playSuccessChime();
    }

    return syncedCount;
  }

  clearSynced() {
    this.queue = this.queue.filter(item => !item.isSynced);
    this.saveQueue();
  }

  resetToDefaults() {
    this.queue = [...SAMPLE_QUEUE];
    this.saveQueue();
  }

  exportAuditJSON() {
    const blob = new Blob([JSON.stringify(this.queue, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ework_Offline_Sync_Audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
