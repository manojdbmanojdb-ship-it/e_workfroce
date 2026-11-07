import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Clock, MapPin, AlertTriangle, Play, Pause,
  CheckSquare, Camera, Star, FileText, Send, X, Plus,
  Sparkles, ShieldCheck, Filter, RefreshCw, Upload
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

const PRIORITY_BADGES = {
  urgent: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  medium: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  low: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
};

const SAMPLE_FIELD_PHOTOS = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80'
];

export default function EmployeeTasksPage({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Proof form state
  const [proofForm, setProofForm] = useState({
    customerName: '',
    customerPhone: '',
    customerRating: 5,
    customerFeedback: '',
    completionNotes: '',
    photos: []
  });

  // Canvas for Digital Signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      let url = `${API_BASE}/tasks?userId=${userId}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (priorityFilter !== 'all') url += `&priority=${priorityFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch employee tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser, statusFilter, priorityFilter]);

  // Task Status Update (Accept, Start, Pause, Complete)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.user_id,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.data : t));
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Add Comment / Note to Task
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedTask) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.user_id,
          text: newNoteText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedTask = { ...selectedTask, notes: data.allNotes };
        setSelectedTask(updatedTask);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
        setNewNoteText('');
      }
    } catch (err) {
      console.error('Failed to add task note:', err);
    }
  };

  // Digital Signature Canvas Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  // Handle Photo Simulation Add
  const handleAddSamplePhoto = (url) => {
    setProofForm(prev => ({
      ...prev,
      photos: [...prev.photos, url]
    }));
  };

  // Submit Proof of Work
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setSubmittingProof(true);
      const signatureDataUrl = canvasRef.current ? canvasRef.current.toDataURL() : null;

      const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}/proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.user_id,
          proofPhotoUrls: proofForm.photos.length > 0 ? proofForm.photos : [SAMPLE_FIELD_PHOTOS[0]],
          signatureUrl: signatureDataUrl,
          customerName: proofForm.customerName || 'Vikram Malhotra',
          customerPhone: proofForm.customerPhone || '+91 98112-40912',
          customerRating: proofForm.customerRating,
          customerFeedback: proofForm.customerFeedback || 'Excellent engineering execution.',
          completionNotes: proofForm.completionNotes || 'Work performed per standard operating procedure.'
        })
      });

      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? data.data : t));
        setSelectedTask(data.data);
        setShowProofModal(false);
      }
    } catch (err) {
      console.error('Failed to submit proof:', err);
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-sky-500" />
            <span>My Field Tasks</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tasks strictly scoped to your technician assignment
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'assigned', 'accepted', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer capitalize border ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-sky-500 text-white border-transparent shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'All Tasks' : st.replace('_', ' ')}
            </button>
          ))}

          <button
            onClick={fetchTasks}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-500 transition-colors shadow-sm cursor-pointer ml-1"
            title="Refresh Tasks"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
          <span>Fetching your assignments...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No tasks match your filter</h3>
          <p className="text-xs text-slate-500">You're up to date on all service work orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isAccepted = task.status === 'accepted';
            const isAssigned = task.status === 'assigned';

            return (
              <div
                key={task.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-sky-500/40 transition-all group"
              >
                <div>
                  {/* Priority & Status Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium
                    }`}>
                      {task.priority} Priority
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      isCompleted ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                      isInProgress ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                      isAccepted ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors line-clamp-2">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {task.description || 'No description provided.'}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{task.address || 'Connaught Place Hub'}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                    </div>

                    {isCompleted && task.is_verified === 1 && (
                      <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] pt-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Proof of Work Signed &amp; Approved</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {isAssigned && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'accepted')}
                      className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accept Task</span>
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {isInProgress && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'on_hold')}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold cursor-pointer"
                        title="Pause Task"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowProofModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Upload Proof &amp; Finish</span>
                      </button>
                    </>
                  )}

                  {task.status === 'on_hold' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Resume Work</span>
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>View Proof Certificate</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedTask(task)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="View Details & Notes"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details & Notes Modal */}
      {selectedTask && !showProofModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  PRIORITY_BADGES[selectedTask.priority] || PRIORITY_BADGES.medium
                }`}>
                  {selectedTask.priority}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-750">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-750">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Location</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTask.address}</div>
                  <div className="text-[10px] font-mono text-sky-500 mt-0.5">
                    {selectedTask.destination_lat}°N, {selectedTask.destination_lng}°E
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-750">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Dispatch Authority</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTask.assigned_by}</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Authorized Dispatch</div>
                </div>
              </div>

              {/* Proof Photos & Customer Sign-off if completed */}
              {selectedTask.status === 'completed' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      ✓ Completed Proof of Work
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Completed: {selectedTask.completed_at ? new Date(selectedTask.completed_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  {selectedTask.customer_name && (
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Customer Sign-off: <strong>{selectedTask.customer_name}</strong> (Rating: {selectedTask.customer_rating} ★)
                      <p className="italic text-slate-500 mt-0.5">"{selectedTask.customer_feedback}"</p>
                    </div>
                  )}

                  {selectedTask.proof_photo_urls && selectedTask.proof_photo_urls.length > 0 && (
                    <div className="flex gap-2">
                      {selectedTask.proof_photo_urls.map((photo, i) => (
                        <img key={i} src={photo} alt="Work Proof" className="h-16 w-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
                  Service Notes &amp; Updates ({selectedTask.notes?.length || 0})
                </h4>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {(!selectedTask.notes || selectedTask.notes.length === 0) ? (
                    <p className="text-slate-400 italic text-[11px]">No notes added yet.</p>
                  ) : (
                    selectedTask.notes.map((n, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{n.author}</span>
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{n.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add progress note or site comment..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Proof of Work Modal */}
      {showProofModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1220] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Step 3: Verification</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Proof of Work</h3>
                <p className="text-xs text-slate-500">{selectedTask.title}</p>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              {/* Photo Upload Simulator */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Work Completion Photos (Geotagged)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_FIELD_PHOTOS.map((url, idx) => {
                    const isSelected = proofForm.photos.includes(url);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleAddSamplePhoto(url)}
                        className={`relative rounded-2xl overflow-hidden h-20 border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Tap photos to attach inspection imagery</p>
              </div>

              {/* Customer Sign-off Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={proofForm.customerName}
                    onChange={(e) => setProofForm({ ...proofForm, customerName: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={proofForm.customerPhone}
                    onChange={(e) => setProofForm({ ...proofForm, customerPhone: e.target.value })}
                    placeholder="+91 98112-40912"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Customer Rating */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Satisfaction Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProofForm({ ...proofForm, customerRating: star })}
                      className="p-1 cursor-pointer"
                    >
                      <Star className={`h-6 w-6 ${
                        star <= proofForm.customerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                    {proofForm.customerRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Client Digital Signature
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    Clear Canvas
                  </button>
                </div>
                <div className="border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 touch-none cursor-crosshair bg-white dark:bg-slate-950"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Sign inside the box with mouse or touch</p>
              </div>

              {/* Completion Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Engineering Completion Notes
                </label>
                <textarea
                  rows={2}
                  value={proofForm.completionNotes}
                  onChange={(e) => setProofForm({ ...proofForm, completionNotes: e.target.value })}
                  placeholder="Summary of repair, parts replaced, diagnostic checks..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{submittingProof ? 'Verifying & Submitting...' : 'Sign Off & Complete Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
