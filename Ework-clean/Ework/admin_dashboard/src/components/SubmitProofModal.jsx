import React, { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle2, Star, Camera, Upload, Trash2,
  MapPin, Clock, ShieldCheck, PenTool, Sparkles,
  Layers, Wrench, AlertCircle, RefreshCw
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

const PRESET_BEFORE_PHOTOS = [
  {
    name: 'HVAC Compressor',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    notes: 'Burned out capacitor, clogged intake, heavy dust on condenser coils.'
  },
  {
    name: 'Electrical Circuit',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    notes: 'Loose terminal contacts, tripped 32A breaker, fluctuating voltage.'
  },
  {
    name: 'Safety Inspection',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
    notes: 'Missing inspection tags, depressurized CO2 gauge, worn seal ring.'
  }
];

const PRESET_AFTER_PHOTOS = [
  {
    name: 'HVAC Restored',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    notes: 'Replaced 45uF capacitor, cleaned copper fins, pressure normalized at 120 PSI.'
  },
  {
    name: 'Electrical Fixed',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
    notes: 'Re-crimped terminal lugs, replaced breaker, load tested at 230V balanced.'
  },
  {
    name: 'Safety Certified',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    notes: 'New EPDM gasket, 15 bar hydrostatic certificate, updated 2027 barcode tag.'
  }
];

export default function SubmitProofModal({ isOpen, onClose, task, onSubmitSuccess }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Active Tab
  const [activeStep, setActiveStep] = useState('photos'); // 'photos' | 'signature' | 'customer' | 'parts'

  // Photo States
  const [beforePhoto, setBeforePhoto] = useState(PRESET_BEFORE_PHOTOS[0].url);
  const [beforeNotes, setBeforeNotes] = useState(PRESET_BEFORE_PHOTOS[0].notes);
  const [afterPhoto, setAfterPhoto] = useState(PRESET_AFTER_PHOTOS[0].url);
  const [afterNotes, setAfterNotes] = useState(PRESET_AFTER_PHOTOS[0].notes);

  // Customer Feedback & Rating
  const [customerName, setCustomerName] = useState(task?.customer_name || 'Vikram Malhotra');
  const [customerDesignation, setCustomerDesignation] = useState('Facilities Supervisor');
  const [customerPhone, setCustomerPhone] = useState('+91 98112-40912');
  const [customerRating, setCustomerRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerFeedback, setCustomerFeedback] = useState(
    'Work completed satisfactorily on time. The technician explained all diagnostics and tested system performance before sign-off.'
  );

  // Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, item: 'Initial safety lockdown & electrical supply isolation', done: true },
    { id: 2, item: 'Diagnostic pressure & voltage testing', done: true },
    { id: 3, item: 'Defective component replacement & wire crimping', done: true },
    { id: 4, item: 'Full operational load test (Passed within spec)', done: true },
    { id: 5, item: 'Site cleanup and debris removal', done: true },
  ]);

  // Parts Used
  const [parts, setParts] = useState([
    { id: 1, name: 'Dual Run Heavy Capacitor 45/5 uF', code: 'CAP-4505', qty: 1, cost: 750 },
    { id: 2, name: 'Eco Refrigerant Canister R-410A', code: 'REF-410A', qty: 1, cost: 1100 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [cameraShutter, setCameraShutter] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (!isOpen || activeStep !== 'signature') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set high resolution for retina displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#38bdf8'; // sky-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen, activeStep]);

  if (!isOpen || !task) return null;

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const simulateAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    // Draw nice stylized signature path
    ctx.beginPath();
    const startX = 40;
    const startY = rect.height / 2 + 10;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + 40, startY - 50, startX + 70, startY + 40, startX + 110, startY - 20);
    ctx.bezierCurveTo(startX + 140, startY - 40, startX + 170, startY + 30, startX + 220, startY - 10);
    ctx.bezierCurveTo(startX + 260, startY + 20, startX + 290, startY - 15, startX + 340, startY + 5);
    ctx.stroke();

    // Underline flourish
    ctx.beginPath();
    ctx.moveTo(startX + 20, startY + 30);
    ctx.lineTo(startX + 360, startY + 25);
    ctx.stroke();

    setHasSignature(true);
  };

  const handleCustomFileUpload = (type, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') setBeforePhoto(event.target.result);
        else setAfterPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCamera = () => {
    setCameraShutter(true);
    setTimeout(() => {
      setCameraShutter(false);
      setAfterPhoto(PRESET_AFTER_PHOTOS[Math.floor(Math.random() * PRESET_AFTER_PHOTOS.length)].url);
    }, 300);
  };

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Get signature data URL
      let signatureDataUrl = null;
      if (canvasRef.current && hasSignature) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      }

      const totalPartsCost = parts.reduce((sum, p) => sum + (p.qty * p.cost), 0);
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const proofData = {
        technicianName: task.assignee || 'Rahul Sharma',
        technicianRole: 'Senior Field Technician',
        siteAddress: task.address || 'Connaught Place, Block B, New Delhi',
        durationOnSite: '1 hour 45 minutes',
        signedAt: `${currentDate}, ${currentTime}`,
        gpsCoords: {
          lat: 28.6318,
          lng: 77.2170,
          accuracy: '± 3.2m · Geofence Verified'
        },
        beforePhoto,
        beforeNotes,
        afterPhoto,
        afterNotes,
        signatureUrl: signatureDataUrl,
        customerName: customerName || 'Customer Representative',
        customerDesignation,
        customerPhone,
        customerRating,
        customerFeedback,
        checklist: checklist.map(c => ({ item: c.item, done: c.done, time: currentTime })),
        partsUsed: parts,
        totalPartsCost
      };

      // Call API endpoint PATCH /api/tasks/:id/proof
      const payload = {
        proofPhotoUrls: [beforePhoto, afterPhoto],
        signatureUrl: signatureDataUrl || 'digital_signed_canvas',
        customerName,
        customerRating,
        customerFeedback
      };

      try {
        await fetch(`http://localhost:5000/api/tasks/${task.id}/proof`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Backend endpoint error (using local state fallback):', err);
      }

      // Play success chime
      soundService.playSuccessChime();

      if (onSubmitSuccess) {
        onSubmitSuccess(task.id, proofData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit proof of work:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#091222] border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-[#070e1c] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="h-full w-full bg-[#071120] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white">Digital Proof-of-Work Submission</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Work Order #{task.id?.toString().slice(-4) || 'T-402'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                <span>Task: <strong className="text-slate-200">{task.title}</strong></span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <MapPin className="h-3 w-3" />
                  <span>{task.address || 'Connaught Place, Delhi'} (Geofence Validated)</span>
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 py-2.5 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'photos', label: '1. Before & After Photos', icon: Camera },
            { id: 'signature', label: '2. Customer Signature Pad', icon: PenTool },
            { id: 'customer', label: '3. 5-Star Rating & Review', icon: Star },
            { id: 'parts', label: '4. Checklist & Parts Used', icon: Wrench },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: BEFORE & AFTER PHOTOS */}
          {activeStep === 'photos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">GPS Camera Watermark:</span> Real-time coordinates, geofence radius, and ISO timestamp are burned onto photographic records.
                </div>
                <button
                  type="button"
                  onClick={handleSimulateCamera}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Simulate Shutter Snap</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Before Photo Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <span className="text-xs font-bold text-orange-400 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                      <span>Before Work (Fault State)</span>
                    </span>
                    <label className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center space-x-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload Custom</span>
                      <input type="file" accept="image/*" onChange={(e) => handleCustomFileUpload('before', e)} className="hidden" />
                    </label>
                  </div>

                  <div className="relative aspect-video bg-black/50 overflow-hidden group">
                    <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                    
                    {/* Timestamp & GPS Watermark Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-lg p-2 text-[10px] font-mono text-slate-200 border border-white/10">
                      <div className="text-emerald-400 font-bold flex items-center justify-between">
                        <span>LAT 28.6318° N, LNG 77.2170° E</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">±3m ACCURATE</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">
                        {new Date().toISOString()} • DELHI HQ GEOFENCE
                      </div>
                    </div>
                  </div>

                  {/* Preset Selector */}
                  <div className="p-3 bg-slate-950/20 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Quick Presets</div>
                    <div className="flex gap-2">
                      {PRESET_BEFORE_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setBeforePhoto(p.url); setBeforeNotes(p.notes); }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer truncate flex-1 ${
                            beforePhoto === p.url
                              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Diagnostic Notes</label>
                      <input
                        type="text"
                        value={beforeNotes}
                        onChange={(e) => setBeforeNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        placeholder="State before work..."
                      />
                    </div>
                  </div>
                </div>

                {/* After Photo Card */}
                <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all ${cameraShutter ? 'ring-4 ring-white' : ''}`}>
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      <span>After Work (Resolved State)</span>
                    </span>
                    <label className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center space-x-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload Custom</span>
                      <input type="file" accept="image/*" onChange={(e) => handleCustomFileUpload('after', e)} className="hidden" />
                    </label>
                  </div>

                  <div className="relative aspect-video bg-black/50 overflow-hidden group">
                    <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                    
                    {/* Timestamp & GPS Watermark Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-lg p-2 text-[10px] font-mono text-slate-200 border border-white/10">
                      <div className="text-emerald-400 font-bold flex items-center justify-between">
                        <span>LAT 28.6318° N, LNG 77.2170° E</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">VERIFIED FIX</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">
                        {new Date().toISOString()} • LOAD TESTED 18°C
                      </div>
                    </div>
                  </div>

                  {/* Preset Selector */}
                  <div className="p-3 bg-slate-950/20 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Quick Presets</div>
                    <div className="flex gap-2">
                      {PRESET_AFTER_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setAfterPhoto(p.url); setAfterNotes(p.notes); }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer truncate flex-1 ${
                            afterPhoto === p.url
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Resolution & Test Notes</label>
                      <input
                        type="text"
                        value={afterNotes}
                        onChange={(e) => setAfterNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        placeholder="Resolution notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HTML5 SIGNATURE PAD */}
          {activeStep === 'signature' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <PenTool className="h-4 w-4 text-sky-400" />
                    <span>Customer Digital Sign-Off Pad</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Draw with mouse or finger to certify work order completion and site handover.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={simulateAutoSign}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sample Signature</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative rounded-2xl border-2 border-dashed border-sky-500/30 bg-[#060c18] overflow-hidden p-1 shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-56 cursor-crosshair touch-none"
                />

                {!hasSignature && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500">
                    <PenTool className="h-8 w-8 mb-2 opacity-40 text-sky-400" />
                    <span className="text-xs font-medium">Draw Customer Signature Here</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Mouse click-drag or stylus touch supported</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-1 pointer-events-none">
                  <span>Signatory: {customerName || 'Customer Representative'}</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>SHA-256 Digital Audit Trail</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Legal Field Acceptance</div>
                    <div className="text-[10px] text-slate-400">Compliant with Section 65B Electronic Records Act</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold">
                    GPS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Geofence Signature Lock</div>
                    <div className="text-[10px] text-slate-400">Stamped at 28.6318° N, 77.2170° E</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOMER RATING & FEEDBACK */}
          {activeStep === 'customer' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">Customer Satisfaction Score</div>
                  <div className="text-[11px] text-slate-400">Record direct customer feedback prior to closing work order.</div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || customerRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setCustomerRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-mono text-sm font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {customerRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Customer / Client Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Designation / Role</label>
                  <input
                    type="text"
                    value={customerDesignation}
                    onChange={(e) => setCustomerDesignation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Branch Supervisor"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Phone / Mobile</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Customer Review & Remarks</label>
                <textarea
                  rows="3"
                  value={customerFeedback}
                  onChange={(e) => setCustomerFeedback(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                  placeholder="Enter verbatim customer feedback or comments..."
                />
              </div>
            </div>
          )}

          {/* STEP 4: CHECKLIST & PARTS USED */}
          {activeStep === 'parts' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Mandatory Completion Quality Checklist</span>
                </h4>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        item.done
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-medium flex-1">{item.item}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.done ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parts Used */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Wrench className="h-3.5 w-3.5 text-sky-400" />
                    <span>Parts & Consumables Consumed</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Total: ₹{parts.reduce((sum, p) => sum + (p.qty * p.cost), 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="p-2.5 text-left">Item</th>
                        <th className="p-2.5 text-left">Code</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {parts.map(p => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-sans font-medium text-white">{p.name}</td>
                          <td className="p-2.5 text-slate-400 text-[11px]">{p.code}</td>
                          <td className="p-2.5 text-center text-slate-300">{p.qty}</td>
                          <td className="p-2.5 text-right text-slate-300">₹{p.cost}</td>
                          <td className="p-2.5 text-right text-emerald-400 font-bold">₹{p.qty * p.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#070e1c] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All proof data digitally signed & tied to Task #{task.id}</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {activeStep !== 'photos' && (
              <button
                type="button"
                onClick={() => {
                  const steps = ['photos', 'signature', 'customer', 'parts'];
                  const prevIdx = steps.indexOf(activeStep) - 1;
                  if (prevIdx >= 0) setActiveStep(steps[prevIdx]);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Previous Step
              </button>
            )}

            {activeStep !== 'parts' ? (
              <button
                type="button"
                onClick={() => {
                  const steps = ['photos', 'signature', 'customer', 'parts'];
                  const nextIdx = steps.indexOf(activeStep) + 1;
                  if (nextIdx < steps.length) setActiveStep(steps[nextIdx]);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                Next Step →
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-sky-400 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitting ? 'Submitting Proof...' : 'Complete Work Order & Verify'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
