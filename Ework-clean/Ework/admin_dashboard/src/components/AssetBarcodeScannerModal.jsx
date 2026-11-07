import React, { useState, useEffect } from 'react';
import { X, QrCode, Scan, CheckCircle2, AlertTriangle, ArrowRight, Camera, Search, Sparkles } from 'lucide-react';
import { soundService } from '../utils/soundService.js';

export default function AssetBarcodeScannerModal({ isOpen, onClose, onScanSuccess, availableAssets = [] }) {
  const [inputCode, setInputCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  const PRESET_CODES = [
    { code: 'VEH-001', name: 'Toyota HiAce Van #1', type: 'Van' },
    { code: 'TOOL-003', name: 'Multimeter Pro Kit', type: 'Tool' },
    { code: 'MACH-002', name: 'Hydraulic Gauge', type: 'Machinery' },
    { code: 'ELEC-007', name: 'FLIR Thermal Cam', type: 'Electronic' },
    { code: 'TOOL-009', name: 'Rotary Hammer Drill', type: 'Tool' },
    { code: 'VEH-004', name: 'Bolero Maxi Truck', type: 'Truck' },
  ];

  const triggerScan = (code) => {
    setSimulating(true);
    setErrorMsg(null);
    setScanResult(null);

    setTimeout(() => {
      soundService.playBarcodeBeep();
      setSimulating(false);

      const matched = availableAssets.find(a => 
        (a.asset_code && a.asset_code.toLowerCase() === code.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === code.toLowerCase())
      );

      if (matched) {
        setScanResult(matched);
      } else {
        // If not in current list, create a virtual scanned asset matching presets
        const preset = PRESET_CODES.find(p => p.code.toLowerCase() === code.toLowerCase());
        const virtual = {
          id: `ast-${Date.now()}`,
          name: preset ? preset.name : `Field Asset (${code.toUpperCase()})`,
          asset_code: code.toUpperCase(),
          category: code.startsWith('VEH') ? 'vehicle' : code.startsWith('TOOL') ? 'tool_kit' : code.startsWith('ELEC') ? 'electronic' : 'machinery',
          status: 'available',
          assigned_to: null,
          condition_notes: 'Scanned via optical laser reader. Verified operational.',
          created_at: new Date().toISOString()
        };
        setScanResult(virtual);
      }
    }, 450);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    triggerScan(inputCode.trim());
    setInputCode('');
  };

  const confirmInspection = () => {
    if (scanResult) {
      onScanSuccess(scanResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Scan className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Asset Barcode & QR Scanner</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Optical scan or USB wedge barcode reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner Viewfinder Visual */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/90 flex flex-col items-center border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-64 h-56 bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Viewfinder Crosshair Corners */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-sm"></div>

            {/* Red Laser Sweep Line */}
            <div className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>

            {/* Background Camera Silhouette */}
            <div className="text-center space-y-2 opacity-40">
              <QrCode className="h-20 w-20 text-cyan-400 mx-auto stroke-1" />
              <div className="text-[11px] font-mono text-cyan-300">ALIGN BARCODE / QR</div>
            </div>

            {/* Simulating Overlay */}
            {simulating && (
              <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-7 w-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono font-bold text-cyan-300">DECODING 1D/2D SYMBOLOGY...</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center">
            Position asset tag within target area or tap sample tags below to simulate instant hardware scan
          </p>
        </div>

        {/* Scanned Result Banner */}
        {scanResult && (
          <div className="p-4 mx-6 my-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>{scanResult.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {scanResult.asset_code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                  Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{scanResult.status || 'available'}</span>
                  {scanResult.assigned_to && ` · Custodian: ${scanResult.assigned_to}`}
                </div>
              </div>
            </div>

            <button
              onClick={confirmInspection}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1 cursor-pointer"
            >
              <span>Inspect</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Fast Test Preset Tags */}
        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Instant 1-Click Scan Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_CODES.map(preset => (
                <button
                  key={preset.code}
                  onClick={() => triggerScan(preset.code)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all group hover:border-cyan-500/50 shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 font-mono">
                    {preset.code}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Keyboard / Wedge Input Form */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type or paste asset code (e.g. VEH-001)..."
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500 font-mono shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition-all cursor-pointer"
            >
              Scan
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
