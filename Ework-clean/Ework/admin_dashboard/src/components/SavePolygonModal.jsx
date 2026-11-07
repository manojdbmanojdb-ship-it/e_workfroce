import React, { useState } from 'react';
import { X, CheckCircle2, Shield, Copy, Check, Users, MapPin, Layers, Sparkles } from 'lucide-react';
import { isPointInPolygon, formatArea } from '../utils/geofenceUtils.js';
import { soundService } from '../utils/soundService.js';

const CATEGORIES = [
  'Commercial SEZ & Tech Park',
  'Logistics Depot & Warehouse',
  'Construction & Infrastructure',
  'Restricted Data Center & Plant',
  'Client Campus & Branch',
  'Security Perimeter'
];

const COLORS = [
  { label: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-500' },
  { label: 'Sky Blue', hex: '#0ea5e9', bg: 'bg-sky-500' },
  { label: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
  { label: 'Rose Pink', hex: '#ec4899', bg: 'bg-pink-500' },
  { label: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { label: 'Crimson', hex: '#ef4444', bg: 'bg-red-500' },
];

const EMOJIS = ['🏢', '🏬', '📦', '🏭', '🏗️', '🛡️', '📍', '⚡'];

export default function SavePolygonModal({
  isOpen,
  vertices = [],
  areaMeters = 0,
  staffList = [],
  onClose,
  onSave
}) {
  const [name, setName] = useState('New Client Facility Perimeter');
  const [city, setCity] = useState('Delhi NCR');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState(COLORS[0].hex);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [alertTrigger, setAlertTrigger] = useState('both'); // 'enter' | 'exit' | 'both'
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !vertices || vertices.length < 3) return null;

  // Compute live point-in-polygon staff count
  const insideStaff = staffList.filter(s => isPointInPolygon(s, vertices));

  // Construct GeoJSON Polygon representation
  const geoJson = {
    type: 'Feature',
    properties: {
      name: name.trim() || 'Custom Polygon Geofence',
      category,
      alertTrigger,
      areaMeters
    },
    geometry: {
      type: 'Polygon',
      // GeoJSON expects [lng, lat] and closed ring (first == last)
      coordinates: [
        [
          ...vertices.map(v => [Array.isArray(v) ? v[1] : v.lng, Array.isArray(v) ? v[0] : v.lat]),
          [Array.isArray(vertices[0]) ? vertices[0][1] : vertices[0].lng, Array.isArray(vertices[0]) ? vertices[0][0] : vertices[0].lat]
        ]
      ]
    }
  };

  const handleCopyGeoJson = () => {
    navigator.clipboard.writeText(JSON.stringify(geoJson, null, 2));
    setCopied(true);
    soundService.playBarcodeBeep();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const polygonData = {
        name: name.trim() || 'Custom Facility Perimeter',
        city,
        category,
        color,
        emoji,
        alertTrigger,
        vertices,
        areaMeters
      };

      // Also persist to backend API
      try {
        await fetch('http://localhost:5000/api/geofences/polygons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(polygonData)
        });
      } catch (e) {
        console.warn('Backend sync failed, storing locally:', e);
      }

      soundService.playSuccessChime();
      onSave(polygonData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#091222] border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Save Polygon Geofence</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {vertices.length} Vertices
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Multi-vertex polygonal boundary with Ray-Casting validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">

          {/* Area & Point-in-Polygon Stats Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-[10px] uppercase tracking-wider font-bold text-purple-300">
                Calculated Perimeter Area
              </div>
              <div className="text-base font-black text-purple-400 font-mono mt-0.5">
                {formatArea(areaMeters)}
              </div>
              <div className="text-[10px] text-purple-300/70 mt-0.5">
                Spherical Geodesic Excess
              </div>
            </div>

            <div className={`p-3 rounded-2xl border ${
              insideStaff.length > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Live Point-in-Polygon Check
              </div>
              <div className="text-base font-black text-emerald-400 font-mono mt-0.5 flex items-center space-x-1.5">
                <Users className="h-4 w-4" />
                <span>{insideStaff.length} Staff Inside</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {insideStaff.length > 0 
                  ? insideStaff.map(s => s.name).join(', ') 
                  : 'Zero perimeter breaches'}
              </div>
            </div>
          </div>

          {/* Zone Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Perimeter Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DLF CyberCity SEZ & Tech Park"
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* City / Hub & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">City / Metro Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi NCR"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Facility Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Icon Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Perimeter Glow Color</label>
              <div className="flex items-center space-x-2">
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-lg transition-transform cursor-pointer ${
                      color === c.hex ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Icon Badge</label>
              <div className="flex items-center space-x-1.5">
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`h-7 w-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                      emoji === em ? 'bg-slate-700 border border-sky-400 scale-105' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breach Alert Trigger */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Breach Notification Trigger</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'enter', label: 'On Enter', desc: 'Alert when staff enters' },
                { id: 'exit', label: 'On Exit', desc: 'Alert when staff leaves' },
                { id: 'both', label: 'Both Enter & Exit', desc: 'Full bi-directional audit' },
              ].map(trigger => (
                <button
                  key={trigger.id}
                  type="button"
                  onClick={() => setAlertTrigger(trigger.id)}
                  className={`py-2 px-2 rounded-xl text-left transition-all border cursor-pointer ${
                    alertTrigger === trigger.id
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-bold">{trigger.label}</div>
                  <div className="text-[9px] opacity-70 mt-0.5">{trigger.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* GeoJSON Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">GeoJSON Polygon Coordinates</span>
              <button
                type="button"
                onClick={handleCopyGeoJson}
                className="flex items-center space-x-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied GeoJSON!' : 'Copy GeoJSON'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-24">
              {JSON.stringify(geoJson.geometry, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={handleConfirmSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{saving ? 'Registering Perimeter...' : 'Save Polygon Geofence'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
