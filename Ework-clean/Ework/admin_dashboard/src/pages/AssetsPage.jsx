import React, { useState, useEffect } from 'react';
import { 
  Wrench, Car, Zap, Plus, RotateCcw, X, RefreshCw, Scan, QrCode, 
  Search, ShieldCheck, UserCheck, AlertTriangle, Printer, Tag, Eye 
} from 'lucide-react';
import AssetBarcodeScannerModal from '../components/AssetBarcodeScannerModal.jsx';
import AssetInspectionModal from '../components/AssetInspectionModal.jsx';
import { soundService } from '../utils/soundService.js';

const API_BASE = 'http://localhost:5000/api';

const STATUS_STYLE = {
  available: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold',
  assigned: 'bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 font-semibold',
  under_maintenance: 'bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30 font-semibold',
  damaged: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-semibold',
};

const CAT_ICONS = { 
  vehicle: '🚐', 
  tool_kit: '🧰', 
  machinery: '⚙️', 
  electronic: '📱', 
  other: '📦' 
};

const DEFAULT_ASSETS = [
  {
    id: '843eb1f3-eb2a-4fce-8a54-268fb4efcf35',
    name: 'Toyota HiAce Field Van #1',
    asset_code: 'VEH-001',
    category: 'vehicle',
    status: 'assigned',
    assigned_to: 'Rahul Sharma',
    condition_notes: 'Odometer: 24,500 km. Good operational condition. Serviced.',
    created_at: '2026-10-15T08:00:00Z'
  },
  {
    id: '853d2e9f-6a26-4578-aedd-933d0926dc54',
    name: 'Digital Multimeter Pro Kit (Fluke 87V)',
    asset_code: 'TOOL-003',
    category: 'tool_kit',
    status: 'assigned',
    assigned_to: 'Priya Patel',
    condition_notes: 'Calibrated on 01-Oct-2026. High precision test leads included.',
    created_at: '2026-10-14T09:30:00Z'
  },
  {
    id: '8af3df21-1d79-4ab6-bd0b-0c9fa0ed9c54',
    name: 'Industrial Hydraulic Pressure Gauge',
    asset_code: 'MACH-002',
    category: 'machinery',
    status: 'under_maintenance',
    assigned_to: null,
    condition_notes: 'Scheduled for annual valve sensor calibration at workshop.',
    created_at: '2026-10-13T10:15:00Z'
  },
  {
    id: '8bf4ef52-2e80-4bc7-ce1c-1d0ab1fe0d65',
    name: 'Thermal Imaging Camera FLIR E8-XT',
    asset_code: 'ELEC-007',
    category: 'electronic',
    status: 'available',
    assigned_to: null,
    condition_notes: 'Fully charged and operational. Stored at Central Depot Shelf B-12.',
    created_at: '2026-10-12T11:00:00Z'
  },
  {
    id: '9cf5fa63-3f91-5cd8-df2d-2e1bc2af1e76',
    name: 'Bosch Rotary Hammer Drill 850W',
    asset_code: 'TOOL-009',
    category: 'tool_kit',
    status: 'assigned',
    assigned_to: 'Sneha Rao',
    condition_notes: 'Heavy duty carrying case + SDS Plus bit set included.',
    created_at: '2026-10-11T14:45:00Z'
  },
  {
    id: 'a0d6ab74-4e02-6de9-ea3e-3f2cd3ba2f87',
    name: 'Mahindra Bolero Maxi Truck #2',
    asset_code: 'VEH-004',
    category: 'vehicle',
    status: 'available',
    assigned_to: null,
    condition_notes: 'Odometer: 41,200 km. Heavy freight payload bed. Fleet Yard Bay 3.',
    created_at: '2026-10-10T16:20:00Z'
  },
  {
    id: 'b1e7bc85-5f13-7ef0-fb4f-4a3de4cb3a98',
    name: 'Rugged Field Tablet (Galaxy Active 4)',
    asset_code: 'ELEC-012',
    category: 'electronic',
    status: 'assigned',
    assigned_to: 'Amit Verma',
    condition_notes: 'Protected with rubber bumper. Offline GPS sync enabled.',
    created_at: '2026-10-09T12:00:00Z'
  },
  {
    id: 'c2f8cd96-6a24-8f01-ac5a-5b4ef5dc4b09',
    name: 'Honda Portable Petrol Generator 2.2kVA',
    asset_code: 'MACH-005',
    category: 'machinery',
    status: 'available',
    assigned_to: null,
    condition_notes: 'Full fuel tank. Ready for remote worksite deployment.',
    created_at: '2026-10-08T09:15:00Z'
  }
];

export default function AssetsPage({ darkMode = false }) {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [inspectingAsset, setInspectingAsset] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    assetCode: '',
    category: 'tool_kit',
    conditionNotes: ''
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/assets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setAssets(prev => {
          const merged = [...data.data];
          DEFAULT_ASSETS.forEach(def => {
            if (!merged.some(m => m.asset_code === def.asset_code)) {
              merged.push(def);
            }
          });
          return merged;
        });
      }
    } catch (err) {
      console.warn('API fetch warning, using local state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRegister = async () => {
    if (!form.name || !form.assetCode) return;
    try {
      setSaving(true);
      const newAsset = {
        id: `ast-${Date.now()}`,
        name: form.name,
        asset_code: form.assetCode.toUpperCase(),
        category: form.category,
        status: 'available',
        assigned_to: null,
        condition_notes: form.conditionNotes || 'Registered in Central Depot',
        created_at: new Date().toISOString()
      };

      setAssets(prev => [newAsset, ...prev]);
      setShowRegisterModal(false);
      setForm({ name: '', assetCode: '', category: 'tool_kit', conditionNotes: '' });
      soundService.playSuccessChime();

      await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAsset.name,
          assetCode: newAsset.asset_code,
          category: newAsset.category,
          conditionNotes: newAsset.condition_notes
        })
      });
    } catch (err) {
      console.warn('Failed to register remotely:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAsset = async (updated) => {
    setAssets(prev => prev.map(a => (a.id === updated.id || a.asset_code === updated.asset_code) ? updated : a));
    setInspectingAsset(updated);

    try {
      await fetch(`${API_BASE}/assets/${updated.id || updated.asset_code}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: updated.assigned_to,
          status: updated.status
        })
      });
    } catch (err) {
      console.warn('Failed to update asset on remote API:', err);
    }
  };

  const handleScannedAsset = (scannedAsset) => {
    // If not in state, prepend
    setAssets(prev => {
      const exists = prev.some(a => a.asset_code === scannedAsset.asset_code);
      if (!exists) return [scannedAsset, ...prev];
      return prev;
    });
    setInspectingAsset(scannedAsset);
  };

  // Filter & Search logic
  const filtered = assets.filter(a => {
    const matchesStatus = filter === 'all' || a.status === filter;
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.asset_code && a.asset_code.toLowerCase().includes(q)) ||
      (a.assigned_to && a.assigned_to.toLowerCase().includes(q)) ||
      (a.condition_notes && a.condition_notes.toLowerCase().includes(q));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200/90 dark:border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white">Assets & Equipment</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></span>
              <span>Barcode / QR Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track tools, fleet vehicles, and machinery custody with optical barcode scanning & field check-in/out
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAssets}
            className={`p-2.5 rounded-xl border transition-all shadow-xs ${
              darkMode
                ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Barcode Scanner Modal Trigger */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 dark:bg-cyan-600/20 dark:hover:bg-cyan-600/30 border border-cyan-500/30 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs font-bold shadow-xs transition-all"
          >
            <Scan className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Scan Barcode / QR</span>
          </button>

          {/* Register Asset Button */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          darkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{assets.length}</div>
          <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Fleet & Tools</div>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 shadow-xs">
          <div className="text-2xl font-black text-sky-700 dark:text-sky-400">
            {assets.filter(a => a.status === 'assigned').length}
          </div>
          <div className="text-xs font-semibold text-sky-800 dark:text-sky-300 mt-1">In Field (Assigned)</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {assets.filter(a => a.status === 'available').length}
          </div>
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">Available in Depot</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-yellow-500/10 border border-amber-200 dark:border-yellow-500/20 shadow-xs">
          <div className="text-2xl font-black text-amber-700 dark:text-yellow-400">
            {assets.filter(a => a.status === 'under_maintenance' || a.status === 'damaged').length}
          </div>
          <div className="text-xs font-semibold text-amber-800 dark:text-yellow-300 mt-1">Under Maintenance</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'assigned', 'available', 'under_maintenance', 'damaged'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === f
                  ? darkMode
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold'
                  : darkMode
                    ? 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              }`}
            >
              {f === 'all' ? 'All Assets' : f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
              <span className="ml-1.5 text-[10px] opacity-75">
                ({f === 'all' ? assets.length : assets.filter(a => a.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Category & Search Inputs */}
        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-xs border ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Categories</option>
            <option value="vehicle">🚐 Vehicles</option>
            <option value="tool_kit">🧰 Tool Kits</option>
            <option value="machinery">⚙️ Machinery</option>
            <option value="electronic">📱 Electronics</option>
          </select>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, code, staff..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-44 sm:w-56 shadow-xs border ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(asset => (
          <div
            key={asset.id || asset.asset_code}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group shadow-xs ${
              darkMode
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl p-2 rounded-xl border ${
                    darkMode ? 'bg-slate-800/70 border-slate-700/60' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {CAT_ICONS[asset.category] || '📦'}
                  </span>
                  <div>
                    <div className={`text-sm font-bold transition-colors ${
                      darkMode ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {asset.name}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">
                      {asset.asset_code}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[asset.status] || STATUS_STYLE.available}`}>
                  {(asset.status || 'available').replace('_', ' ')}
                </span>
              </div>

              {/* Custody Info */}
              <div className={`py-2.5 px-3 rounded-xl border mb-3 text-xs ${
                darkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`flex items-center justify-between ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Custodian:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {asset.assigned_to ? `👤 ${asset.assigned_to}` : '🏬 In Central Depot'}
                  </span>
                </div>
                {asset.condition_notes && (
                  <div className={`text-[11px] mt-1 line-clamp-1 italic ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    "{asset.condition_notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className={`pt-3 border-t flex items-center justify-between ${
              darkMode ? 'border-slate-800/80' : 'border-slate-100'
            }`}>
              <span className={`text-[10px] font-mono uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {asset.category}
              </span>

              <button
                onClick={() => setInspectingAsset(asset)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  darkMode
                    ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400'
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                <span>Inspect & Tag</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={`col-span-full py-12 text-center rounded-2xl border shadow-xs ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Tag className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>No assets found</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Try resetting the status filter or search query</p>
          </div>
        )}
      </div>

      {/* Barcode & QR Scanner Modal */}
      <AssetBarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={handleScannedAsset}
        availableAssets={assets}
      />

      {/* Detailed Inspection & Tag Modal */}
      {inspectingAsset && (
        <AssetInspectionModal
          asset={inspectingAsset}
          onClose={() => setInspectingAsset(null)}
          onUpdateAsset={handleUpdateAsset}
        />
      )}

      {/* Register Asset Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Register Asset (Supabase)</h2>
              <button 
                onClick={() => setShowRegisterModal(false)} 
                className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ford Transit Van #3"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Asset Barcode / Code *</label>
                <input
                  type="text"
                  placeholder="e.g. VEH-003 or TOOL-010"
                  value={form.assetCode}
                  onChange={e => setForm(f => ({ ...f, assetCode: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="vehicle">🚐 Vehicle</option>
                  <option value="tool_kit">🧰 Tool Kit</option>
                  <option value="machinery">⚙️ Machinery</option>
                  <option value="electronic">📱 Electronic Device</option>
                  <option value="other">📦 Other Equipment</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Condition Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Calibrated and tested / Stored in Bay 4"
                  value={form.conditionNotes}
                  onChange={e => setForm(f => ({ ...f, conditionNotes: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRegisterModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={saving || !form.name || !form.assetCode}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg transition-all hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Registering...' : 'Register Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
