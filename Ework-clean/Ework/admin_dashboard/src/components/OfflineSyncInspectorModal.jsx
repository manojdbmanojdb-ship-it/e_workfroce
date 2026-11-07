import React, { useState, useEffect } from 'react';
import { 
  X, Wifi, WifiOff, RefreshCw, CheckCircle2, Clock, ShieldCheck, 
  Download, Trash2, Play, Sparkles, AlertTriangle, ArrowRight, 
  Smartphone, MapPin, Camera, Receipt, MessageSquare, ChevronDown, ChevronUp 
} from 'lucide-react';
import { offlineSyncEngine } from '../utils/offlineSyncEngine.js';
import { soundService } from '../utils/soundService.js';

const TYPE_ICONS = {
  attendance: { icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  task_proof: { icon: Camera, color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30' },
  expense: { icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  chat: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
};

export default function OfflineSyncInspectorModal({ isOpen, onClose }) {
  const [queue, setQueue] = useState(offlineSyncEngine.getQueue());
  const [networkCondition, setNetworkCondition] = useState(offlineSyncEngine.getNetworkCondition());
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'synced'
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncEngine.subscribe((engine) => {
      setQueue([...engine.getQueue()]);
      setNetworkCondition(engine.getNetworkCondition());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleNetworkChange = (newCondition) => {
    offlineSyncEngine.setNetworkCondition(newCondition);
    if (newCondition === 'offline') {
      soundService.playBarcodeBeep();
    } else {
      soundService.playSuccessChime();
    }
  };

  const handleFlush = async () => {
    setIsSyncing(true);
    await offlineSyncEngine.flushQueue();
    setIsSyncing(false);
  };

  // Simulate pushing mock field actions into the queue
  const simulateAction = (type) => {
    soundService.playBarcodeBeep();
    if (type === 'attendance') {
      offlineSyncEngine.enqueueAction({
        type: 'attendance',
        title: 'Geofenced GPS Check-In',
        employee: 'Priya Patel',
        role: 'Key Accounts Exec',
        device: 'Apple iPhone 14 Pro (Field Client)',
        description: 'Customer Site Basement Check-In (Lat: 28.6335, Lng: 77.2201)',
        payload: {
          userId: 'emp-2',
          siteId: 'site-connaught-place',
          lat: 28.6335,
          lng: 77.2201,
          within_geofence: true,
          offline_timestamp: new Date().toISOString()
        }
      });
    } else if (type === 'task_proof') {
      offlineSyncEngine.enqueueAction({
        type: 'task_proof',
        title: 'Electrical Inspection Sign-Off',
        employee: 'Sneha Rao',
        role: 'Safety Inspector',
        device: 'Samsung Galaxy Active 4',
        description: 'Digital signature & photo captured in shielded generator vault',
        payload: {
          taskId: 'task-552',
          customerName: 'Rajesh Khanna (Chief Engineer)',
          customerRating: 5,
          signatureHash: 'sha256-f8a192bc90182c...',
          customerFeedback: 'All 3-phase circuits verified. Generator passed load test.'
        }
      });
    } else if (type === 'expense') {
      offlineSyncEngine.enqueueAction({
        type: 'expense',
        title: 'Express Highway Toll ₹420',
        employee: 'Amit Verma',
        role: 'Heavy Delivery Lead',
        device: 'Honeywell EDA52 Mobile POS',
        description: 'FASTag toll slip recorded in zero-reception tunnel section',
        payload: {
          userId: 'emp-3',
          category: 'transport',
          amount: 420,
          merchant: 'Yamuna Expressway Toll Terminal',
          receiptAttached: true
        }
      });
    }
  };

  const pendingCount = queue.filter(q => !q.isSynced).length;
  const syncedCount = queue.filter(q => q.isSynced).length;

  const filteredQueue = queue.filter(item => {
    if (filter === 'pending') return !item.isSynced;
    if (filter === 'synced') return item.isSynced;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              networkCondition === 'offline' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : networkCondition === 'slow_3g'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {networkCondition === 'offline' ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Offline Data Sync &amp; Network Simulator</h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  networkCondition === 'offline'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : networkCondition === 'slow_3g'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {networkCondition === 'offline' ? 'Offline Mode' : networkCondition === 'slow_3g' ? 'Slow 2G/3G' : 'Online 5G'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect local SQLite / Hive transactions buffered during field network dropouts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => offlineSyncEngine.exportAuditJSON()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1 border border-slate-700"
              title="Export Sync Audit JSON"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Network Simulator Controls Banner */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-300 block">Simulate Network Reception:</span>
              <span className="text-[11px] text-slate-400">Test how the system behaves when technicians work in basements or tunnels</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleNetworkChange('online')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  networkCondition === 'online'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="h-3.5 w-3.5" />
                <span>5G Online</span>
              </button>

              <button
                onClick={() => handleNetworkChange('slow_3g')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  networkCondition === 'slow_3g'
                    ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Slow 2G/3G</span>
              </button>

              <button
                onClick={() => handleNetworkChange('offline')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  networkCondition === 'offline'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span>Dead Zone (Offline)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Actions & KPI Counters */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Mock Actions Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generate Mock Field Transactions (Stored in Local Buffer):
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">1-Click Test Triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => simulateAction('attendance')}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-white group-hover:text-emerald-400">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>+ Offline Check-In</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Priya Patel · Basement Vault GPS
                </div>
              </button>

              <button
                onClick={() => simulateAction('task_proof')}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-white group-hover:text-sky-400">
                  <Camera className="h-3.5 w-3.5 text-sky-400" />
                  <span>+ Signature &amp; Proof</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Sneha Rao · Generator Load Test
                </div>
              </button>

              <button
                onClick={() => simulateAction('expense')}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-white group-hover:text-amber-400">
                  <Receipt className="h-3.5 w-3.5 text-amber-400" />
                  <span>+ Expressway Toll Slip</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Amit Verma · ₹420 Highway Freight
                </div>
              </button>
            </div>
          </div>

          {/* Queue Statistics & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              {[
                { id: 'all', label: 'All Transactions', count: queue.length },
                { id: 'pending', label: 'Queued (Offline)', count: pendingCount, highlight: pendingCount > 0 },
                { id: 'synced', label: 'Synced & Replayed', count: syncedCount },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.id
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    f.highlight ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sync Now Action */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => offlineSyncEngine.clearSynced()}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-all text-xs flex items-center space-x-1"
                title="Clear Synced Items"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear Synced</span>
              </button>

              <button
                onClick={handleFlush}
                disabled={isSyncing || networkCondition === 'offline' || pendingCount === 0}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {networkCondition === 'offline'
                    ? 'Sync Blocked (Offline)'
                    : isSyncing
                    ? 'Replaying Transactions...'
                    : `Flush & Replay Queue (${pendingCount})`}
                </span>
              </button>
            </div>
          </div>

          {/* Queued Transaction Cards */}
          <div className="space-y-3">
            {filteredQueue.map(item => {
              const typeMeta = TYPE_ICONS[item.type] || TYPE_ICONS.attendance;
              const Icon = typeMeta.icon;
              const isExpanded = expandedItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all ${
                    item.isSyncing
                      ? 'bg-sky-950/40 border-sky-500/40 shadow-lg'
                      : item.isSynced
                      ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-amber-500/40'
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left Icon and Title */}
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${typeMeta.bg} ${typeMeta.border} border flex-shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${typeMeta.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{item.title}</span>
                          <span className="font-mono text-[10px] text-slate-500">[{item.id}]</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-400">
                          <span className="text-slate-200 font-semibold">{item.employee}</span>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center space-x-1">
                            <Smartphone className="h-3 w-3 text-slate-500" />
                            <span>{item.device}</span>
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Status Badge & Expand Toggle */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div>
                        {item.isSyncing ? (
                          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Broadcasting...</span>
                          </span>
                        ) : item.isSynced ? (
                          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Replayed &amp; Synced</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Clock className="h-3 w-3" />
                            <span>Queued (Offline)</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center space-x-1"
                        title="Inspect JSON Payload"
                      >
                        <span className="text-[11px] font-mono">JSON</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                  </div>

                  {/* Expandable JSON Payload Inspector */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800/80 rounded-b-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Encrypted Offline Payload &amp; Telemetry Headers
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {item.isSynced ? '✓ Written to Supabase PostgreSQL' : 'Local Hive Storage Partition'}
                        </span>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div className="p-10 text-center rounded-2xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Queue is 100% Up-To-Date</p>
                <p className="text-xs text-slate-400 mt-1">No pending offline field events buffered in storage.</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Cryptographic Idempotency Keys active to prevent duplicate records upon reconnect</span>
          </div>

          <button
            onClick={() => offlineSyncEngine.resetToDefaults()}
            className="text-[11px] text-slate-400 hover:text-sky-300 transition-colors"
          >
            Reset Test Queue
          </button>
        </div>

      </div>
    </div>
  );
}
