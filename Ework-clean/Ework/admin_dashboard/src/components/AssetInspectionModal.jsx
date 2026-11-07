import React, { useState } from 'react';
import { 
  X, QrCode, Printer, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, 
  RotateCcw, Wrench, ShieldCheck, Clock, MapPin, Tag, Truck, Sparkles 
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

const EMPLOYEES = [
  'Rahul Sharma (HVAC Lead)',
  'Priya Patel (Key Accounts)',
  'Amit Verma (Heavy Delivery)',
  'Sneha Rao (Safety Inspector)',
  'Vikram Singh (Field Engineer)'
];

const CAT_LABELS = {
  vehicle: 'Commercial Fleet Vehicle',
  tool_kit: 'Precision Tool Kit',
  machinery: 'Heavy Machinery & Hydraulic',
  electronic: 'Rugged Electronic Device',
  other: 'General Field Asset'
};

export default function AssetInspectionModal({ asset, onClose, onUpdateAsset }) {
  const [selectedStaff, setSelectedStaff] = useState(EMPLOYEES[0]);
  const [returnNotes, setReturnNotes] = useState('Returned to depot. Physical inspection verified OK.');
  const [conditionNotes, setConditionNotes] = useState(asset?.condition_notes || '');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'label' | 'maintenance'

  if (!asset) return null;

  // Extract clean staff name
  const staffNameOnly = (str) => str ? str.split(' (')[0] : '';

  const handleCheckOut = () => {
    soundService.playSuccessChime();
    const updated = {
      ...asset,
      status: 'assigned',
      assigned_to: staffNameOnly(selectedStaff),
      condition_notes: conditionNotes || asset.condition_notes
    };
    onUpdateAsset(updated);
  };

  const handleReturnToDepot = () => {
    soundService.playSuccessChime();
    const updated = {
      ...asset,
      status: 'available',
      assigned_to: null,
      condition_notes: returnNotes || 'Checked back into Central Depot inventory.'
    };
    onUpdateAsset(updated);
  };

  const handleSetStatus = (newStatus) => {
    soundService.playSuccessChime();
    const updated = {
      ...asset,
      status: newStatus,
      assigned_to: newStatus === 'available' ? null : asset.assigned_to
    };
    onUpdateAsset(updated);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 no-print">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-sky-500/15 border border-blue-200 dark:border-sky-500/30 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{asset.name}</h2>
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-sky-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {asset.asset_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {CAT_LABELS[asset.category] || 'Field Asset'} · ID: {asset.id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintLabel}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all text-xs flex items-center space-x-1 cursor-pointer"
              title="Print Thermal Barcode Label"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print Tag</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 px-6 no-print">
          {[
            { id: 'overview', label: 'Asset Overview & Custody' },
            { id: 'label', label: 'Thermal Barcode & QR Label' },
            { id: 'maintenance', label: 'Service & Maintenance Log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-sky-500 text-blue-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
          
          {/* TAB 1: OVERVIEW & CUSTODY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Status and Custodian Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Status</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      asset.status === 'available' ? 'bg-emerald-500 animate-pulse' :
                      asset.status === 'assigned' ? 'bg-blue-500' :
                      asset.status === 'under_maintenance' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-black text-slate-900 dark:text-white capitalize">
                      {(asset.status || 'available').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Custodian / Staff</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {asset.assigned_to ? `👤 ${asset.assigned_to}` : '🏬 Unassigned (In Depot)'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Depot Location</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Central Field Logistics Bay 2
                  </div>
                </div>
              </div>

              {/* Condition & Inspection Notes */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Physical Condition & Calibration Notes</span>
                </span>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  placeholder="Enter condition notes..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Custody Actions: Check-Out vs Return */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Field Check-Out Block */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-blue-600 dark:text-sky-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Issue / Assign to Field Staff</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hand over tool or dispatch vehicle to an active field worker
                  </p>
                  <select
                    value={selectedStaff}
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    {EMPLOYEES.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleCheckOut}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Check-Out Asset
                  </button>
                </div>

                {/* Return / Check-In Block */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Return / Check-In to Depot</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive asset back into storage and clear active staff custody
                  </p>
                  <input
                    type="text"
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    placeholder="Condition notes on return..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                  <button
                    onClick={handleReturnToDepot}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    Check-In to Depot
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: THERMAL BARCODE & QR LABEL */}
          {activeTab === 'label' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="printable-label bg-white text-slate-950 p-6 rounded-xl border-2 border-slate-300 shadow-2xl max-w-sm w-full font-mono text-center">
                
                {/* Brand Header */}
                <div className="border-b-2 border-slate-900 pb-2 mb-3">
                  <div className="text-xs font-black tracking-widest uppercase text-slate-900">
                    EWORK ENTERPRISE SYSTEMS
                  </div>
                  <div className="text-[9px] text-slate-600 font-sans">
                    FIELD ASSET INVENTORY MANAGEMENT
                  </div>
                </div>

                {/* Asset Title */}
                <div className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                  {asset.name}
                </div>
                <div className="text-xs font-black text-blue-700 font-mono tracking-wider mb-3">
                  [{asset.asset_code}]
                </div>

                {/* Simulated Barcode Stripes (Code 128) */}
                <div className="flex justify-center items-center space-x-1 h-12 bg-white px-2">
                  {[2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 1, 2, 3, 2, 1].map((w, i) => (
                    <div key={i} className="bg-slate-900 h-10" style={{ width: `${w * 2}px` }}></div>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-slate-600 tracking-widest mt-1">
                  *{asset.asset_code}*
                </div>

                {/* QR Code Matrix Simulation */}
                <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-around">
                  <div className="h-16 w-16 border-2 border-slate-900 p-1 rounded flex items-center justify-center">
                    <QrCode className="h-14 w-14 text-slate-900" />
                  </div>
                  <div className="text-left text-[10px] font-sans space-y-0.5 text-slate-600">
                    <div>Category: <b className="text-slate-900">{asset.category}</b></div>
                    <div>Location: <b className="text-slate-900">Central Depot</b></div>
                    <div>Status: <b className="text-slate-900 uppercase">{asset.status}</b></div>
                  </div>
                </div>

                <div className="mt-4 text-[8px] text-slate-400 font-sans">
                  DO NOT REMOVE · PROPERTY OF EWORK SOLUTIONS
                </div>
              </div>

              <button
                onClick={handlePrintLabel}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all no-print cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Thermal Barcode Label</span>
              </button>
            </div>
          )}

          {/* TAB 3: MAINTENANCE LOG */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Wrench className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span>Maintenance Scheduling & Fault Reporting</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update asset lifecycle status to alert dispatchers against assigning faulty or uncalibrated units.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleSetStatus('under_maintenance')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Flag Under Maintenance
                  </button>
                  <button
                    onClick={() => handleSetStatus('damaged')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Report Damaged
                  </button>
                  <button
                    onClick={() => handleSetStatus('available')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Mark Serviced & Ready
                  </button>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Recent Maintenance Events</span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Full Diagnostics & Electrical Check</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Completed by Authorized Workshop</div>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">01-Oct-2026</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Initial Depot Commissioning</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Tagged with QR code & registered</div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">15-Sep-2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
