import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight,
  BatteryCharging, Download, RefreshCw, Filter, MapPin,
  Clock, Zap, CheckCircle2, XCircle
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

const INITIAL_AUDIT_EVENTS = [
  {
    id: 'evt-1',
    time: '11:42:15 AM',
    type: 'entry',
    employee: 'Priya Patel',
    role: 'Sales Executive',
    site: 'Mumbai Tech Hub',
    distanceMeters: 42,
    details: 'Verified entry within 200m site geofence. Automated attendance timestamp logged.',
    lat: 19.0600,
    lng: 72.8688,
    status: 'Verified In-Bounds'
  },
  {
    id: 'evt-2',
    time: '11:38:04 AM',
    type: 'breach',
    employee: 'Rahul Sharma',
    role: 'Technician',
    site: 'Delhi Corporate HQ',
    distanceMeters: 198,
    details: 'Exited authorized 150m perimeter zone during active work order #T-402.',
    lat: 28.6338,
    lng: 77.2198,
    status: 'Perimeter Breach (48m Out)'
  },
  {
    id: 'evt-3',
    time: '11:29:50 AM',
    type: 'mock_gps',
    employee: 'Amit Verma',
    role: 'Delivery Agent',
    site: 'Inner Circle Transit',
    distanceMeters: 0,
    details: 'Hardware location provider check: 0 mock/spoofed GPS providers detected. High accuracy lock.',
    lat: 28.6328,
    lng: 77.2188,
    status: 'Anti-Spoof Passed'
  },
  {
    id: 'evt-4',
    time: '11:15:22 AM',
    type: 'battery',
    employee: 'Sneha Rao',
    role: 'Site Inspector',
    site: 'Hyderabad Zone',
    distanceMeters: 12,
    details: 'Field device battery dropped to 14%. Power-saving high-accuracy telemetry throttling active.',
    lat: 17.4435,
    lng: 78.3772,
    status: 'Low Battery (14%)'
  },
  {
    id: 'evt-5',
    time: '10:58:30 AM',
    type: 'entry',
    employee: 'Rahul Sharma',
    role: 'Technician',
    site: 'Connaught Place Site #B',
    distanceMeters: 18,
    details: 'Technician arrived within 50m of HVAC client address. Task status auto-updated to "At Site".',
    lat: 28.6318,
    lng: 77.2170,
    status: 'Verified Arrival'
  },
  {
    id: 'evt-6',
    time: '10:45:10 AM',
    type: 'speed',
    employee: 'Amit Verma',
    role: 'Delivery Agent',
    site: 'Barakhamba Road',
    distanceMeters: 0,
    details: 'Transit speed telemetry recorded: 58 km/h. Safe driving corridor maintained.',
    lat: 28.6305,
    lng: 77.2155,
    status: 'Transit Speed: 58 km/h'
  }
];

export default function GeofenceAuditFeed({ onLocateEmployee, darkMode = false }) {
  const [events, setEvents] = useState(INITIAL_AUDIT_EVENTS);
  const [filter, setFilter] = useState('all'); // 'all' | 'breach' | 'entry' | 'safety'

  const filtered = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'breach') return e.type === 'breach' || e.type === 'mock_gps';
    if (filter === 'entry') return e.type === 'entry';
    if (filter === 'safety') return e.type === 'battery' || e.type === 'speed' || e.type === 'sos';
    return true;
  });

  const handleSimulateBreach = () => {
    soundService.playSosSiren();
    const newBreach = {
      id: `evt-sim-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      type: 'breach',
      employee: 'Rahul Sharma',
      role: 'Technician',
      site: 'Connaught Place Perimeter',
      distanceMeters: 215,
      details: '🚨 Boundary breach alert! Staff moved 65m beyond authorized client boundary.',
      lat: 28.6342,
      lng: 77.2210,
      status: 'Active Perimeter Breach'
    };
    setEvents(prev => [newBreach, ...prev]);
  };

  const handleSimulateEntry = () => {
    soundService.playSuccessChime();
    const newEntry = {
      id: `evt-sim-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      type: 'entry',
      employee: 'Priya Patel',
      role: 'Sales Executive',
      site: 'Delhi Corporate HQ',
      distanceMeters: 15,
      details: '🟢 Verified check-in: Employee entered HQ geofence. Status set to "At Site".',
      lat: 28.6315,
      lng: 77.2167,
      status: 'Verified Arrival'
    };
    setEvents(prev => [newEntry, ...prev]);
  };

  const handleExportCSV = () => {
    const headers = ['Time', 'Type', 'Employee', 'Role', 'Site', 'Status', 'Details', 'Latitude', 'Longitude'];
    const rows = events.map(e => [
      `"${e.time}"`,
      `"${e.type}"`,
      `"${e.employee}"`,
      `"${e.role}"`,
      `"${e.site}"`,
      `"${e.status}"`,
      `"${e.details}"`,
      e.lat,
      e.lng
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eworkforce_geofence_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls & Filter Tabs */}
      <div className={`pb-3 border-b space-y-2.5 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`text-xs font-black uppercase tracking-wider ${
              darkMode ? 'text-slate-200' : 'text-slate-900'
            }`}>
              Live Boundary Audit Log
            </span>
          </div>
          
          <button
            onClick={handleExportCSV}
            className={`flex items-center space-x-1 text-[11px] font-bold p-1 rounded transition-colors cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-sky-400' : 'text-slate-600 hover:text-sky-600'
            }`}
            title="Download CSV Audit Report"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl border ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'all', label: `All (${events.length})` },
            { id: 'breach', label: 'Breaches' },
            { id: 'entry', label: 'Entries' },
            { id: 'safety', label: 'Safety' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream List */}
      <div className="space-y-2.5 my-3 overflow-y-auto flex-1 pr-1">
        {filtered.map(evt => {
          const isBreach = evt.type === 'breach';
          const isEntry = evt.type === 'entry';
          const isBattery = evt.type === 'battery';
          const isMockGps = evt.type === 'mock_gps';

          return (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border transition-all ${
                isBreach
                  ? (darkMode ? 'bg-red-950/30 border-red-500/40 hover:border-red-400' : 'bg-red-50 border-red-200 hover:border-red-300')
                  : isEntry
                  ? (darkMode ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400' : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300')
                  : isBattery
                  ? (darkMode ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400' : 'bg-amber-50 border-amber-200 hover:border-amber-300')
                  : (darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  {isBreach && <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 animate-bounce" />}
                  {isEntry && <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                  {isBattery && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                  {isMockGps && <CheckCircle2 className="h-4 w-4 text-sky-500 flex-shrink-0" />}
                  
                  <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>{evt.employee}</span>
                  <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>({evt.role})</span>
                </div>

                <span className={`text-[10px] font-mono font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{evt.time}</span>
              </div>

              <div className={`text-[11px] leading-snug mb-2 font-medium ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {evt.details}
              </div>

              <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
                darkMode ? 'border-slate-800/60' : 'border-slate-200'
              }`}>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isBreach
                    ? (darkMode ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-800 border border-red-300')
                    : isEntry
                    ? (darkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                    : isBattery
                    ? (darkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300')
                    : (darkMode ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-sky-100 text-sky-800 border border-sky-300')
                }`}>
                  {evt.status}
                </span>

                {onLocateEmployee && (
                  <button
                    onClick={() => onLocateEmployee(evt.employee, [evt.lat, evt.lng])}
                    className={`flex items-center space-x-1 font-bold cursor-pointer ${
                      darkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-700 hover:text-sky-800'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>Focus Pin</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className={`h-32 flex flex-col items-center justify-center text-xs border border-dashed rounded-xl ${
            darkMode ? 'text-slate-500 border-slate-800' : 'text-slate-600 border-slate-300'
          }`}>
            <span>No events matching "{filter}"</span>
          </div>
        )}
      </div>

      {/* Simulator Actions Footer */}
      <div className={`pt-3 border-t space-y-2 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className={`text-[10px] uppercase font-bold tracking-wider ${
          darkMode ? 'text-slate-500' : 'text-slate-600'
        }`}>
          Simulate Real-Time Boundary Actions:
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSimulateEntry}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              darkMode 
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            <span>+ Simulate Entry</span>
          </button>
          <button
            onClick={handleSimulateBreach}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              darkMode 
                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40' 
                : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            <span>🚨 Simulate Breach</span>
          </button>
        </div>
      </div>
    </div>
  );
}
