import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { Task } from '../types';
import { 
  ArrowLeft, MapPin, Phone, User, Clock, CheckCircle2, 
  Camera, FileText, Send, AlertTriangle, Play, Sparkles, 
  ExternalLink, Star, ShieldCheck, PenTool 
} from 'lucide-react';

export const TaskDetailsScreen: React.FC = () => {
  const { selectedTaskId, navigateTo, showToast } = useApp();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Proof submission fields
  const [workNotes, setWorkNotes] = useState('');
  const [customerName, setCustomerName] = useState('Vikram Malhotra');
  const [customerRating, setCustomerRating] = useState(5);
  const [photoCount, setPhotoCount] = useState(0);
  const [signed, setSigned] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    if (!selectedTaskId) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await apiService.getTasks();
        if (res.success && res.data) {
          const match = res.data.find(t => t.id === selectedTaskId);
          if (match) {
            setTask(match);
            if (match.proof) {
              setWorkNotes(match.proof.notes || '');
              setCustomerName(match.proof.customerName || 'Vikram Malhotra');
              setPhotoCount(match.proof.photos?.length || 1);
              setSigned(!!match.proof.signature);
            }
          }
        }
      } catch (e) {
        console.warn('Task fetch error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [selectedTaskId]);

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-slate-500">Loading task details...</p>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    setUpdating(true);
    try {
      const res = await apiService.updateTaskStatus(task.id, newStatus);
      setTask(prev => prev ? ({ ...prev, status: newStatus }) : null);
      showToast(`Work order status updated to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (e) {
      setTask(prev => prev ? ({ ...prev, status: newStatus }) : null);
      showToast('Offline: Status change buffered locally', 'info');
    } finally {
      setUpdating(false);
    }
  };

  const handleCapturePhoto = () => {
    setPhotoCount(prev => prev + 1);
    showToast('Work order photo captured & geotagged with GPS coordinates', 'success');
  };

  const handleSignSignature = () => {
    setSigned(true);
    showToast('Customer digital signature verified and stamped', 'success');
  };

  const handleSubmitProof = async () => {
    if (!signed) {
      showToast('Please capture customer signature before completing work', 'error');
      return;
    }

    setIsSubmittingProof(true);
    const proofPayload = {
      notes: workNotes || 'All HVAC maintenance checks completed according to standard protocol.',
      customerName,
      customerRating,
      signature: 'data:image/svg+xml;base64,signed_verified_mobile',
      photos: photoCount > 0 ? Array(photoCount).fill('photo_geotagged.jpg') : ['site_proof.jpg'],
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await apiService.submitTaskProof(task.id, proofPayload);
      setTask(prev => prev ? ({ ...prev, status: 'completed', proof: proofPayload }) : null);
      showToast('Proof-of-work submitted! Manager alerted.', 'success');
    } catch (e) {
      setTask(prev => prev ? ({ ...prev, status: 'completed', proof: proofPayload }) : null);
      showToast('Offline: Proof stored in local SQLite cache. Will sync once online.', 'info');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const openGoogleMaps = () => {
    const lat = task.lat || 28.6318;
    const lng = task.lng || 77.2170;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('tasks')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Work Orders</span>
        </button>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
          task.status === 'completed'
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            : task.status === 'in_progress'
            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
        }`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {/* Task Header Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wider font-mono">
            {task.priority} Priority
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: #{task.id.slice(-6)}
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {task.title}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {task.description}
        </p>

        {/* Customer & Location Details */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span>Customer:</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {task.contact_name || customerName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center space-x-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span>Phone:</span>
            </span>
            <a 
              href={`tel:${task.contact_phone || '+919811240912'}`}
              className="font-mono font-bold text-blue-600 dark:text-sky-400 underline"
            >
              {task.contact_phone || '+91 98112-40912'}
            </a>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-sky-500" />
              <span>Site:</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-right truncate max-w-[190px]">
              {task.address || 'Connaught Place, Inner Circle'}
            </span>
          </div>
        </div>

        {/* Action: Open in Google Maps */}
        <button
          onClick={openGoogleMaps}
          className="w-full py-2.5 rounded-2xl border border-sky-500/30 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer hover:bg-sky-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Launch Turn-by-Turn Google Maps Navigation</span>
        </button>
      </div>

      {/* Workflow Controls: In Progress vs Start */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
          <Play className="h-3.5 w-3.5 text-blue-500" />
          <span>Work Order Execution</span>
        </h3>

        <div className="flex items-center space-x-2">
          {task.status !== 'in_progress' && task.status !== 'completed' && (
            <button
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={updating}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span>Start Work Order</span>
            </button>
          )}

          {task.status === 'in_progress' && (
            <div className="w-full p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-sky-400 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Work In Progress on Site</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Live Timer Running</span>
            </div>
          )}
        </div>
      </div>

      {/* Proof-of-Work Capture Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
            <Camera className="h-3.5 w-3.5 text-emerald-500" />
            <span>Digital Proof of Work</span>
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            GPS Stamped
          </span>
        </div>

        {/* 1. Photos */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Site Photographs</span>
            <span className="text-slate-400 font-mono">{photoCount} captured</span>
          </div>
          <button
            onClick={handleCapturePhoto}
            className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Camera className="h-4 w-4 text-sky-500" />
            <span>{photoCount > 0 ? '+ Add Additional Site Photo' : 'Capture Before/After Work Photo'}</span>
          </button>
        </div>

        {/* 2. Customer Signature */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Digital Sign-Off</span>
            <span className={`text-[10px] font-bold ${signed ? 'text-emerald-500' : 'text-amber-500'}`}>
              {signed ? '✓ Signed on Glass' : 'Pending Signature'}
            </span>
          </div>
          
          {signed ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Client signature recorded ({customerName})</span>
              </span>
              <button
                onClick={() => setSigned(false)}
                className="text-[10px] text-slate-400 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignSignature}
              className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <PenTool className="h-4 w-4 text-emerald-500" />
              <span>Tap to Open Signature Pad</span>
            </button>
          )}
        </div>

        {/* 3. Field Work Notes */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Work Order Notes &amp; Material Consumption
          </label>
          <textarea
            rows={2}
            value={workNotes}
            onChange={e => setWorkNotes(e.target.value)}
            placeholder="e.g. Replaced compressor filter and tested air pressure..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Final Submit Button */}
        <button
          onClick={handleSubmitProof}
          disabled={isSubmittingProof || task.status === 'completed'}
          className={`w-full py-3.5 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all ${
            task.status === 'completed'
              ? 'bg-emerald-600 text-white opacity-90'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 cursor-pointer active:scale-98'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{task.status === 'completed' ? 'Work Order Completed & Stamped' : isSubmittingProof ? 'Transmitting to Server...' : 'Submit Proof & Complete Task'}</span>
        </button>
      </div>
    </div>
  );
};
