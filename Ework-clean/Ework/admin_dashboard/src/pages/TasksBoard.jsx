import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2, Clock, MapPin, AlertTriangle, Plus, X,
  Truck, User, RefreshCw, Sparkles, FileCheck, Star,
  ShieldCheck, Camera, Printer, MessageSquare, Navigation
} from 'lucide-react';
import RouteOptimizerModal from '../components/RouteOptimizerModal';
import ProofInspectorModal from '../components/ProofInspectorModal';
import SubmitProofModal from '../components/SubmitProofModal';
import WorkOrderCertificateModal from '../components/WorkOrderCertificateModal';
import CustomerAlertDispatcherModal from '../components/CustomerAlertDispatcherModal';
import CustomerTrackingPortalModal from '../components/CustomerTrackingPortalModal';

const API_BASE = 'http://localhost:5000/api';

const EMPLOYEES = ['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Rao'];

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
};

const COLUMNS = [
  { key: 'pending', label: 'Pending', color: 'text-slate-400', dot: 'bg-slate-400' },
  { key: 'in_route', label: 'In Route', color: 'text-sky-400', dot: 'bg-sky-400' },
  { key: 'in_progress', label: 'In Progress', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { key: 'completed', label: 'Completed', color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

const SAMPLE_ENRICHMENTS = {
  'HVAC Compressor Inspection #T-402': {
    assignee: 'Rahul Sharma',
    customer_name: 'Vikram Malhotra',
    customer_rating: 5,
    customer_feedback: 'Technician was punctual and completed the entire HVAC repair with zero downtime for our office floor. Cleaned the workspace thoroughly afterwards.',
    proof: {
      technicianName: 'Rahul Sharma',
      siteAddress: 'Connaught Place, Block B, New Delhi',
      beforePhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      beforeNotes: 'Burned out compressor capacitor and clogged intake filter before servicing.',
      afterPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      afterNotes: 'Installed new 45uF capacitor, cleaned copper coils, pressure tested at 120 PSI.',
      customerName: 'Vikram Malhotra',
      customerDesignation: 'Property & Facilities Manager',
      customerPhone: '+91 98112-40912',
      customerRating: 5,
      customerFeedback: 'Technician was punctual and completed the entire HVAC repair with zero downtime for our office floor. Cleaned the workspace thoroughly afterwards.',
      signedAt: '17 Oct 2026, 11:02 AM',
      durationOnSite: '1 hour 45 minutes',
      gpsCoords: { lat: 28.6318, lng: 77.2170, accuracy: '± 4 meters (Geofenced)' },
      checklist: [
        { item: 'Compressor & electrical supply voltage diagnostic', done: true, time: '09:20 AM' },
        { item: 'High-pressure safety relief valve inspection', done: true, time: '09:40 AM' },
        { item: 'Refrigerant R-410A top-up (1.2 kg added)', done: true, time: '10:05 AM' },
        { item: 'Ultrasonic air filter wash & debris flush', done: true, time: '10:30 AM' },
        { item: '15-minute operational load test (Passed at 18°C)', done: true, time: '10:55 AM' },
      ],
      partsUsed: [
        { name: 'Dual Run Capacitor 45/5 uF', code: 'CAP-4505', qty: 1, cost: 750 },
        { name: 'R-410A Eco Refrigerant Canister (1kg)', code: 'REF-410A', qty: 1, cost: 1100 },
      ],
      totalPartsCost: 1850,
    }
  },
  'Quarterly Fire Extinguisher Testing': {
    assignee: 'Sneha Rao',
    customer_name: 'Ananya Deshmukh',
    customer_rating: 5,
    customer_feedback: 'All 14 fire extinguishers tested and tagged with barcode stickers. Pressure gauges are in green zone.',
    proof: {
      technicianName: 'Sneha Rao',
      siteAddress: 'Hitec City, Phase 2, Hyderabad',
      beforePhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
      beforeNotes: 'Expired inspection tags on Floor 3 and Floor 4 foam extinguishers.',
      afterPhoto: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
      afterNotes: 'Replaced CO2 seal rings, pressure verified at 15 bar, new 2027 compliance tags affixed.',
      customerName: 'Ananya Deshmukh',
      customerDesignation: 'Safety Compliance Officer',
      customerPhone: '+91 99001-33211',
      customerRating: 5,
      customerFeedback: 'All 14 fire extinguishers tested and tagged with barcode stickers. Pressure gauges are in green zone.',
      signedAt: '17 Oct 2026, 10:15 AM',
      durationOnSite: '2 hours 10 minutes',
      gpsCoords: { lat: 17.4435, lng: 78.3772, accuracy: '± 2 meters (Geofenced)' },
      checklist: [
        { item: 'Weight and tare mass inspection for all units', done: true, time: '08:45 AM' },
        { item: 'Discharge horn and locking pin check', done: true, time: '09:10 AM' },
        { item: 'Hydrostatic pressure test certification', done: true, time: '09:40 AM' },
        { item: 'Barcoded digital NFC tag assignment', done: true, time: '10:05 AM' },
      ],
      partsUsed: [
        { name: 'EPDM Pressure Gaskets (Pack of 10)', code: 'GAS-EPDM10', qty: 1, cost: 420 },
        { name: 'NFC Tamper Evident Safety Seals', code: 'SEAL-NFC', qty: 14, cost: 280 },
      ],
      totalPartsCost: 700,
    }
  }
};

const DEMO_EXTRA_TASKS = [
  {
    id: 'demo-task-route-1',
    title: 'Client Presentation & Demo - Sharma Traders',
    description: 'Present Enterprise Workforce tracking demo and hardware beacon setup',
    priority: 'high',
    status: 'in_route',
    address: 'Nehru Place, New Delhi',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    assignee: 'Priya Patel',
  },
  {
    id: 'demo-task-prog-1',
    title: 'Solar Inverter Diagnostic & Firmware Flash',
    description: 'Diagnose error code E-04 on grid-tie rooftop solar inverter',
    priority: 'urgent',
    status: 'in_progress',
    address: 'Indiranagar, Bengaluru',
    due_date: new Date(Date.now() + 43200000).toISOString(),
    assignee: 'Amit Verma',
  }
];

export default function TasksBoard({ darkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [selectedProofTask, setSelectedProofTask] = useState(null);
  const [submittingProofTask, setSubmittingProofTask] = useState(null);
  const [selectedCertTask, setSelectedCertTask] = useState(null);
  const [selectedCustomerTask, setSelectedCustomerTask] = useState(null);
  const [selectedCustomerPortalTask, setSelectedCustomerPortalTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    assignedTo: EMPLOYEES[0],
    priority: 'medium',
    due: '',
    address: '',
    description: ''
  });

  const handleSubmitProofSuccess = (taskId, proofData) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed',
          completed_at: new Date().toISOString(),
          customer_name: proofData.customerName,
          customer_rating: proofData.customerRating,
          customer_feedback: proofData.customerFeedback,
          isVerified: true,
          verification_status: 'approved',
          proof: proofData
        };
      }
      return t;
    }));
  };

  const handleApproveProof = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      isVerified: true,
      verification_status: 'approved'
    } : t));
    if (selectedProofTask && selectedProofTask.id === taskId) {
      setSelectedProofTask(prev => ({ ...prev, isVerified: true, verification_status: 'approved' }));
    }
  };

  const handleRequestRevision = (taskId, notes) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'in_progress',
      isVerified: false,
      verification_status: 'revision_requested',
      revision_notes: notes
    } : t));
    if (selectedProofTask && selectedProofTask.id === taskId) {
      setSelectedProofTask(null);
    }
  };

  // Fetch live tasks from Supabase via backend API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const enriched = data.data.map(task => {
          const enrich = SAMPLE_ENRICHMENTS[task.title];
          return enrich ? { ...task, ...enrich } : task;
        });

        const hasInRoute = enriched.some(t => t.status === 'in_route');
        const hasInProgress = enriched.some(t => t.status === 'in_progress');
        const extras = [];
        if (!hasInRoute) extras.push(DEMO_EXTRA_TASKS[0]);
        if (!hasInProgress) extras.push(DEMO_EXTRA_TASKS[1]);

        setTasks([...enriched, ...extras]);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const socket = io('http://localhost:5000');
    socket.on('task_created', (newTask) => {
      setTasks(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)]);
    });
    socket.on('task_updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    });
    socket.on('task_proof_submitted', (completedTask) => {
      setTasks(prev => prev.map(t => t.id === completedTask.id ? { ...t, ...completedTask, status: 'completed' } : t));
    });
    socket.on('task_deleted', ({ id }) => {
      setTasks(prev => prev.filter(t => t.id !== id));
    });

    return () => socket.disconnect();
  }, []);

  // Create new task in Supabase
  const handleCreate = async () => {
    if (!form.title) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          assignedTo: form.assignedTo,
          address: form.address,
          dueDate: form.due ? new Date(form.due).toISOString() : null,
          priority: form.priority
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTasks(prev => [data.data, ...prev]);
        setShowModal(false);
        setForm({ title: '', assignedTo: EMPLOYEES[0], priority: 'medium', due: '', address: '', description: '' });
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSaving(false);
    }
  };

  // Change status (drag-drop simulation)
  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'completed') {
      const taskToComplete = tasks.find(t => t.id === taskId);
      if (taskToComplete) {
        setSubmittingProofTask(taskToComplete);
        return;
      }
    }
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks(); // revert on error
    }
  };

  return (
    <div className={`p-6 flex flex-col h-full ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b mb-6 ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className={`text-2xl sm:text-3xl font-display uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-950'}`}>Tasks Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Supabase</span>
            </span>
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            Assign, track, and manage field work orders in real-time
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTasks}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              darkMode 
                ? 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
            }`}
            title="Refresh from Supabase"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowRouteOptimizer(true)}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              darkMode
                ? 'border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10'
                : 'border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold shadow-xs'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Route &amp; Fuel Optimizer</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-sky-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /><span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 overflow-auto">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div 
              key={col.key} 
              className={`flex flex-col rounded-2xl border p-4 min-h-[350px] transition-colors ${
                darkMode 
                  ? 'bg-slate-900/40 border-slate-800/80' 
                  : 'bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className={`flex items-center space-x-2 mb-4 pb-2 border-b ${
                darkMode ? 'border-slate-800/60' : 'border-slate-200'
              }`}>
                <span className={`h-2 w-2 rounded-full ${col.dot}`}></span>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? col.color : 'text-slate-800 font-black'
                }`}>{col.label}</span>
                <span className={`ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  darkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
                }`}>
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3.5 rounded-xl border transition-all group ${
                      darkMode 
                        ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 hover:border-sky-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-bold leading-snug ${
                        darkMode ? 'text-white' : 'text-slate-950'
                      }`}>{task.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                        {task.priority || 'medium'}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-[11px] mb-2 line-clamp-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>{task.description}</p>
                    )}

                    {task.address && (
                      <div className={`flex items-center space-x-1.5 text-[11px] mb-1.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}>
                        <MapPin className="h-3 w-3 flex-shrink-0 text-slate-500" />
                        <span className="truncate">{task.address}</span>
                      </div>
                    )}

                    <div className={`flex items-center justify-between pt-2 border-t text-[10px] ${
                      darkMode ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-600 font-medium'
                    }`}>
                      <span>{task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No deadline'}</span>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`border rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-sky-500 cursor-pointer ${
                          darkMode 
                            ? 'bg-slate-900 border-slate-700 text-slate-300' 
                            : 'bg-white border-slate-300 text-slate-800 font-medium'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_route">In Route</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className={`mt-2 pt-2 border-t flex items-center justify-between ${
                      darkMode ? 'border-slate-800/60' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerTask(task)}
                          className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/20 rounded-md px-2 py-1 transition-all cursor-pointer"
                          title="Send WhatsApp or SMS Arrival / OTP Alert to Customer"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Notify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerPortalTask(task)}
                          className="flex items-center space-x-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-300 dark:border-sky-500/20 rounded-md px-2 py-1 transition-all cursor-pointer"
                          title="Open Real-time Customer Live GPS Tracking Experience"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Track Live</span>
                        </button>
                      </div>
                      <span className={`text-[10px] flex items-center space-x-1 truncate max-w-[90px] ${
                        darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}>
                        <User className="h-2.5 w-2.5 text-slate-500" />
                        <span className="truncate">{task.assignee || 'Assigned'}</span>
                      </span>
                    </div>

                    {task.verification_status === 'revision_requested' && (
                      <div className="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Revision: {task.revision_notes || 'Technician rework requested'}</span>
                      </div>
                    )}

                    {task.status !== 'completed' && (
                      <div className={`mt-2.5 pt-2 border-t ${
                        darkMode ? 'border-slate-800/80' : 'border-slate-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setSubmittingProofTask(task)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                            darkMode
                              ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 border border-sky-500/30 text-sky-300 hover:text-white'
                              : 'bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700'
                          }`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Submit Digital Proof &amp; Close</span>
                        </button>
                      </div>
                    )}

                    {task.status === 'completed' && (
                      <div className={`mt-2.5 pt-2 border-t space-y-1.5 ${
                        darkMode ? 'border-slate-800/80' : 'border-slate-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setSelectedProofTask(task)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                            task.isVerified || task.verification_status === 'approved'
                              ? (darkMode ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100')
                              : (darkMode ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25' : 'bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100')
                          }`}
                        >
                          <span className="flex items-center space-x-1.5">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>{task.isVerified || task.verification_status === 'approved' ? '✓ Verified Proof' : 'Inspect Proof of Work'}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-[10px] text-amber-500 dark:text-amber-400 font-bold">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span>{task.customer_rating || '5.0'}</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedCertTask(task)}
                          className={`w-full py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                            darkMode 
                              ? 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
                          }`}
                        >
                          <Printer className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                          <span>Official PDF Certificate</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-28 flex items-center justify-center text-[11px] text-slate-600 border border-dashed border-slate-800/60 rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Assign New Task (Supabase)</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. HVAC Maintenance"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Description</label>
                <textarea
                  rows="2"
                  placeholder="Task instructions or notes"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 resize-none ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Connaught Place, Delhi"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                      darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={form.due}
                    onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
                    className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                      darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.title}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg transition-all hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving to Supabase...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Route Optimizer & Fuel Calculator Modal */}
      <RouteOptimizerModal
        isOpen={showRouteOptimizer}
        onClose={() => setShowRouteOptimizer(false)}
        employeeName="Rahul Sharma"
        tasks={tasks}
      />

      {/* Proof-of-Work & Digital Signature Review Inspector */}
      <ProofInspectorModal
        isOpen={!!selectedProofTask}
        onClose={() => setSelectedProofTask(null)}
        task={selectedProofTask}
        onApprove={handleApproveProof}
        onRequestRevision={handleRequestRevision}
      />

      {/* Digital Proof-of-Work Submission Modal */}
      <SubmitProofModal
        isOpen={!!submittingProofTask}
        onClose={() => setSubmittingProofTask(null)}
        task={submittingProofTask}
        onSubmitSuccess={handleSubmitProofSuccess}
      />

      {/* Work Order PDF Certificate Modal */}
      <WorkOrderCertificateModal
        isOpen={!!selectedCertTask}
        onClose={() => setSelectedCertTask(null)}
        task={selectedCertTask}
      />

      {/* Customer Arrival & WhatsApp/SMS Dispatcher Modal */}
      <CustomerAlertDispatcherModal
        isOpen={!!selectedCustomerTask}
        onClose={() => setSelectedCustomerTask(null)}
        task={selectedCustomerTask}
      />

      {/* Real-time Customer Live GPS Tracking Portal Modal */}
      <CustomerTrackingPortalModal
        isOpen={!!selectedCustomerPortalTask}
        onClose={() => setSelectedCustomerPortalTask(null)}
        task={selectedCustomerPortalTask}
      />
    </div>
  );
}
