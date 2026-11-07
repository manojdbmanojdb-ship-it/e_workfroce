import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, MapPin, Clock, Plus, X,
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  User, ShieldCheck, Sparkles, Filter, Trash2, Send
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

const EMPLOYEES = [
  { name: 'Rahul Sharma', role: 'Senior Technician', avatar: '🔧' },
  { name: 'Priya Patel', role: 'Sales Executive', avatar: '💼' },
  { name: 'Amit Verma', role: 'Delivery Agent', avatar: '📦' },
  { name: 'Sneha Rao', role: 'Site Inspector', avatar: '📋' },
  { name: 'Vikram Singh', role: 'Field Engineer', avatar: '⚙️' },
  { name: 'Deepa Nair', role: 'Technician', avatar: '🛠️' },
];

const SITES = [
  'Delhi Corporate HQ',
  'Mumbai Tech Hub',
  'Bengaluru Depot',
  'Hyderabad Site',
  'Pune Depot',
  'Connaught Place Site #B'
];

const INITIAL_SHIFTS = [
  { id: 1, employee: 'Rahul Sharma', role: 'Senior Technician', site: 'Delhi Corporate HQ', date: '2026-10-12', day: 'Mon', start: '09:00', end: '18:00', status: 'completed' },
  { id: 2, employee: 'Priya Patel', role: 'Sales Executive', site: 'Mumbai Tech Hub', date: '2026-10-12', day: 'Mon', start: '10:00', end: '19:00', status: 'completed' },
  { id: 3, employee: 'Amit Verma', role: 'Delivery Agent', site: 'Bengaluru Depot', date: '2026-10-13', day: 'Tue', start: '08:00', end: '17:00', status: 'completed' },
  { id: 4, employee: 'Sneha Rao', role: 'Site Inspector', site: 'Hyderabad Site', date: '2026-10-14', day: 'Wed', start: '09:00', end: '18:00', status: 'completed' },
  
  // Rahul Sharma scheduled twice on Thursday (intentional demo conflict)
  { id: 5, employee: 'Rahul Sharma', role: 'Senior Technician', site: 'Delhi Corporate HQ', date: '2026-10-15', day: 'Thu', start: '09:00', end: '18:00', status: 'scheduled' },
  { id: 6, employee: 'Rahul Sharma', role: 'Senior Technician', site: 'Connaught Place Site #B', date: '2026-10-15', day: 'Thu', start: '13:00', end: '20:00', status: 'scheduled' },
  
  { id: 7, employee: 'Vikram Singh', role: 'Field Engineer', site: 'Pune Depot', date: '2026-10-16', day: 'Fri', start: '07:00', end: '16:00', status: 'scheduled' },
  { id: 8, employee: 'Priya Patel', role: 'Sales Executive', site: 'Mumbai Tech Hub', date: '2026-10-16', day: 'Fri', start: '10:00', end: '19:00', status: 'scheduled' },
  { id: 9, employee: 'Deepa Nair', role: 'Technician', site: 'Delhi Corporate HQ', date: '2026-10-17', day: 'Sat', start: '09:00', end: '18:00', status: 'scheduled' },
  { id: 10, employee: 'Amit Verma', role: 'Delivery Agent', site: 'Bengaluru Depot', date: '2026-10-17', day: 'Sat', start: '08:00', end: '17:00', status: 'scheduled' },
];

const DAYS_OF_WEEK = [
  { day: 'Mon', date: '2026-10-12', label: '12 Oct' },
  { day: 'Tue', date: '2026-10-13', label: '13 Oct' },
  { day: 'Wed', date: '2026-10-14', label: '14 Oct' },
  { day: 'Thu', date: '2026-10-15', label: '15 Oct' },
  { day: 'Fri', date: '2026-10-16', label: '16 Oct' },
  { day: 'Sat', date: '2026-10-17', label: '17 Oct' },
  { day: 'Sun', date: '2026-10-18', label: '18 Oct' },
];

const STATUS_STYLE = {
  scheduled: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  missed: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

export default function ShiftsPage({ darkMode = false }) {
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'cards'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'conflicts' | 'scheduled'
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Form state
  const [employee, setEmployee] = useState(EMPLOYEES[0].name);
  const [site, setSite] = useState(SITES[0]);
  const [shiftDate, setShiftDate] = useState('2026-10-17');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  // Detect schedule overlap conflicts
  const detectConflicts = (shiftList) => {
    const conflictMap = {};
    for (let i = 0; i < shiftList.length; i++) {
      for (let j = i + 1; j < shiftList.length; j++) {
        const a = shiftList[i];
        const b = shiftList[j];
        if (a.employee === b.employee && a.date === b.date && a.id !== b.id) {
          // Check time overlap: (StartA < EndB) and (EndA > StartB)
          if (a.start < b.end && a.end > b.start) {
            conflictMap[a.id] = true;
            conflictMap[b.id] = true;
          }
        }
      }
    }
    return conflictMap;
  };

  const conflicts = detectConflicts(shifts);
  const conflictCount = Object.keys(conflicts).length;

  const filteredShifts = shifts.filter(s => {
    if (filterType === 'conflicts') return conflicts[s.id];
    if (filterType === 'scheduled') return s.status === 'scheduled';
    return true;
  });

  const handleCreateShift = (e) => {
    e.preventDefault();
    const empObj = EMPLOYEES.find(e => e.name === employee);
    const dayObj = DAYS_OF_WEEK.find(d => d.date === shiftDate) || { day: 'Sat' };

    const newShift = {
      id: Date.now(),
      employee,
      role: empObj?.role || 'Technician',
      site,
      date: shiftDate,
      day: dayObj.day,
      start: startTime,
      end: endTime,
      status: 'scheduled'
    };

    const newShiftsList = [newShift, ...shifts];
    const newConflicts = detectConflicts(newShiftsList);

    setShifts(newShiftsList);
    setShowAddModal(false);

    if (newConflicts[newShift.id]) {
      soundService.playSosSiren();
      setSuccessToast(`⚠️ Warning: Overlapping shift conflict detected for ${employee}!`);
    } else {
      soundService.playSuccessChime();
      setSuccessToast(`✓ Shift assigned to ${employee} at ${site}!`);
    }

    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteShift = (id) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handlePublishRoster = () => {
    soundService.playSuccessChime();
    setSuccessToast('📡 Roster published! Notification dispatched to all 6 field staff devices.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className={`p-4 sm:p-6 flex flex-col h-full space-y-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4 ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className={`text-2xl sm:text-3xl font-display uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-950'}`}>Shift &amp; Schedule Manager</h1>
            {conflictCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 flex items-center space-x-1.5 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{conflictCount} Conflict(s) Detected</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Roster Conflict-Free</span>
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            Plan weekly rosters, auto-detect double bookings, and dispatch schedules
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className={`flex p-1 rounded-xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-sky-500 text-white shadow-sm' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-sky-500 text-white shadow-sm' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List Cards ({shifts.length})
            </button>
          </div>

          <button
            onClick={handlePublishRoster}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
            }`}
          >
            <Send className="h-3.5 w-3.5 text-sky-500" />
            <span>Publish Roster</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-sky-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-50/70 border-sky-200'}`}>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{shifts.length}</div>
          <div className="text-xs font-bold text-sky-700 dark:text-sky-300 mt-1">Total Scheduled Shifts</div>
        </div>
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'}`}>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{shifts.length * 9} hrs</div>
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1">Total Roster Coverage</div>
        </div>
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50/70 border-indigo-200'}`}>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{EMPLOYEES.length}</div>
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1">Assigned Technicians</div>
        </div>
        <div className={`p-4 rounded-2xl border ${
          conflictCount > 0 
            ? 'bg-amber-500/15 border-amber-500/30' 
            : darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`text-2xl font-black ${conflictCount > 0 ? 'text-amber-500 dark:text-amber-400' : darkMode ? 'text-slate-400' : 'text-slate-800'}`}>
            {conflictCount}
          </div>
          <div className={`text-xs font-bold mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Overlapping Conflicts</div>
        </div>
      </div>

      {/* Notification Toast */}
      {successToast && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in ${
          darkMode ? 'bg-slate-900 border-sky-500/40 text-sky-300' : 'bg-white border-sky-300 text-sky-800'
        }`}>
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: WEEKLY CALENDAR GRID MATRIX */}
      {viewMode === 'calendar' && (
        <div className={`rounded-2xl border overflow-hidden flex flex-col flex-1 shadow-sm ${
          darkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200 bg-white'
        }`}>
          
          {/* Week Header Row */}
          <div className={`grid grid-cols-7 border-b text-center ${
            darkMode ? 'border-slate-800 bg-[#070e1c]' : 'border-slate-200 bg-slate-100'
          }`}>
            {DAYS_OF_WEEK.map((col, idx) => (
              <div key={col.day} className={`p-3.5 border-r last:border-r-0 ${
                darkMode ? 'border-slate-800/80' : 'border-slate-200'
              } ${
                col.date === '2026-10-17' ? (darkMode ? 'bg-sky-500/10' : 'bg-sky-50') : ''
              }`}>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{col.day}</div>
                <div className={`text-sm font-black mt-0.5 ${
                  col.date === '2026-10-17' ? 'text-sky-500 font-bold' : darkMode ? 'text-white' : 'text-slate-950'
                }`}>
                  {col.label}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Day Columns */}
          <div className={`grid grid-cols-7 flex-1 min-h-[420px] divide-x ${
            darkMode ? 'divide-slate-800/80 bg-[#050b14]/50' : 'divide-slate-200 bg-white'
          }`}>
            {DAYS_OF_WEEK.map((col) => {
              const dayShifts = shifts.filter(s => s.date === col.date);
              const isToday = col.date === '2026-10-17';

              return (
                <div key={col.day} className={`p-2 space-y-2 flex flex-col ${isToday ? (darkMode ? 'bg-sky-500/[0.03]' : 'bg-sky-50/50') : ''}`}>
                  {dayShifts.map((shift) => {
                    const isConflict = conflicts[shift.id];
                    return (
                      <div
                        key={shift.id}
                        className={`p-2.5 rounded-xl border text-left transition-all relative group ${
                          isConflict
                            ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                            : shift.status === 'completed'
                            ? (darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-slate-100 border-slate-200 hover:border-slate-300')
                            : (darkMode ? 'bg-[#091528] border-sky-500/30 hover:border-sky-500/60' : 'bg-sky-50/80 border-sky-200 hover:border-sky-300')
                        }`}
                      >
                        {isConflict && (
                          <div className="flex items-center space-x-1 text-[9px] font-bold text-amber-400 mb-1">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0 animate-bounce" />
                            <span>DOUBLE BOOKING</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{shift.employee}</span>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-red-400 transition-opacity cursor-pointer"
                            title="Delete Shift"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className={`text-[10px] truncate mt-0.5 flex items-center space-x-1 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate">{shift.site}</span>
                        </div>

                        <div className={`flex items-center justify-between text-[10px] mt-2 pt-1.5 border-t ${
                          darkMode ? 'text-slate-400 border-slate-800/60' : 'text-slate-600 border-slate-200'
                        }`}>
                          <span className="font-mono">{shift.start} - {shift.end}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            STATUS_STYLE[shift.status] || STATUS_STYLE.scheduled
                          }`}>
                            {shift.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {dayShifts.length === 0 && (
                    <div className={`flex-1 flex items-center justify-center text-[11px] border border-dashed rounded-xl my-2 ${
                      darkMode ? 'text-slate-600 border-slate-800/60' : 'text-slate-400 border-slate-200'
                    }`}>
                      Off Duty
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIST CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            {['all', 'conflicts', 'scheduled'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === type
                    ? darkMode
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-xs'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : darkMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                }`}
              >
                {type === 'all' ? 'All Shifts' : type === 'conflicts' ? '⚠️ Conflicts Only' : 'Scheduled'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredShifts.map(shift => {
              const isConflict = conflicts[shift.id];
              return (
                <div
                  key={shift.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isConflict
                      ? darkMode
                        ? 'bg-amber-950/25 border-amber-500/50 shadow-xs'
                        : 'bg-amber-50 border-amber-300 shadow-xs'
                      : darkMode
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-xs text-slate-100'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 shadow-xs text-slate-900'
                  }`}
                >
                  {isConflict && (
                    <div className="mb-2 p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Overlapping Shift Conflict Detected!</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{shift.employee}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{shift.role}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[shift.status]}`}>
                      {shift.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /><span>{shift.site}</span></div>
                    <div className="flex items-center space-x-1.5"><CalendarIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /><span>{shift.date} ({shift.day})</span></div>
                    <div className="flex items-center space-x-1.5"><Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /><span>{shift.start} – {shift.end} (9 hours)</span></div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Shift</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE SHIFT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-[#091222] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              darkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Schedule Field Shift</h3>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign technician &amp; hours with conflict check</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="py-4 space-y-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Field Employee</label>
                <select
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  {EMPLOYEES.map(e => (
                    <option key={e.name} value={e.name}>{e.avatar} {e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Work Site / Branch</label>
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  {SITES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Shift Date</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono ${
                      darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono ${
                      darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  Confirm &amp; Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
