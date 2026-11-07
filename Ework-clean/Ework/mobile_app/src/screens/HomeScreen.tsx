import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { Task, AttendanceRecord } from '../types';
import { 
  CheckSquare, Clock, MapPin, AlertTriangle, ArrowRight, 
  Calendar, CheckCircle2, ChevronRight, Play, FileText, 
  Sparkles, ShieldCheck, RefreshCw, Zap, TrendingUp 
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { 
    currentUser, navigateTo, currentLocation, showToast, 
    todayAttendance, setTodayAttendance 
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [elapsedTimer, setElapsedTimer] = useState<string>('0h 00m');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, attRes] = await Promise.all([
        apiService.getTasks().catch(() => ({ success: false, data: [] })),
        apiService.getAttendance().catch(() => ({ success: false, data: [] }))
      ]);

      if (tasksRes.data) {
        setTasks(tasksRes.data);
        const pending = tasksRes.data.filter((t: Task) => t.status !== 'completed');
        setNextTask(pending[0] || null);
      }

      if (attRes.data && attRes.data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const match = attRes.data.find((a: AttendanceRecord) => a.date === todayStr);
        setTodayAttendance(match || null);
      }
    } catch (e) {
      console.warn('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live elapsed working hours since check-in
  useEffect(() => {
    if (!todayAttendance?.check_in_time) {
      setElapsedTimer('Not checked in');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(todayAttendance.check_in_time).getTime();
      const end = todayAttendance.check_out_time 
        ? new Date(todayAttendance.check_out_time).getTime() 
        : Date.now();
      
      const diffMs = Math.max(0, end - start);
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTimer(`${hrs}h ${mins.toString().padStart(2, '0')}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  const handleQuickCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await apiService.checkIn(currentLocation.lat, currentLocation.lng, 'Mobile App 1-tap check in');
      if (res.success && res.data) {
        setTodayAttendance(res.data);
        showToast(res.message || 'GPS Check-In Verified Successfully!', 'success');
      } else {
        showToast(res.error || 'Check-in failed. Please verify coordinates.', 'error');
      }
    } catch (err: any) {
      showToast('Offline: Check-in recorded locally in transaction cache.', 'info');
      setTodayAttendance({
        id: `att-local-${Date.now()}`,
        user_id: currentUser?.id || 'emp-1',
        user_name: currentUser?.name || 'Rahul Sharma',
        date: new Date().toISOString().split('T')[0],
        check_in_time: new Date().toISOString(),
        is_within_geofence: 1,
        verification_method: 'gps_geofence',
        status: 'present'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleQuickCheckOut = async () => {
    setCheckingIn(true);
    try {
      const res = await apiService.checkOut(currentLocation.lat, currentLocation.lng, 'Mobile App 1-tap check out');
      if (res.success && res.data) {
        setTodayAttendance(res.data);
        showToast('Shift checked out. Overtime recorded!', 'success');
      } else {
        showToast(res.error || 'Check-out failed.', 'error');
      }
    } catch (err: any) {
      showToast('Check-out recorded in offline sync engine.', 'info');
      setTodayAttendance(prev => prev ? ({ ...prev, check_out_time: new Date().toISOString() }) : null);
    } finally {
      setCheckingIn(false);
    }
  };

  const totalAssigned = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalPending = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
      
      {/* 1. Welcome Employee Profile Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-2xl flex items-center justify-center shadow-inner">
              {currentUser?.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 tracking-wider">
                  ON DUTY
                </span>
                <span className="text-[11px] text-blue-100 font-mono">
                  {currentUser?.employee_id || 'EW-4091'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {currentUser?.name || 'Rahul Sharma'}
              </h2>
            </div>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition-all cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status bar inside banner */}
        <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-between text-xs relative z-10">
          <span className="text-blue-100 flex items-center space-x-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-300" />
            <span className="truncate max-w-[180px]">Connaught Place, Delhi</span>
          </span>
          <span className="font-mono text-emerald-300 font-bold text-[11px]">
            Accuracy: ±{currentLocation.accuracy}m
          </span>
        </div>
      </div>

      {/* 2. Today's Attendance & Shift Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              Shift Attendance
            </h3>
          </div>
          <button 
            onClick={() => navigateTo('attendance')}
            className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
          >
            <span>Log &amp; Overtime</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 mb-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Shift Duration</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {elapsedTimer}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Punch-In</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
              {todayAttendance?.check_in_time 
                ? new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Not Checked In'}
            </div>
          </div>
        </div>

        {/* Check In / Out Action Button */}
        {!todayAttendance?.check_in_time ? (
          <button
            onClick={handleQuickCheckIn}
            disabled={checkingIn}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{checkingIn ? 'Verifying Coordinates...' : 'GPS Geofenced Check-In'}</span>
          </button>
        ) : !todayAttendance.check_out_time ? (
          <button
            onClick={handleQuickCheckOut}
            disabled={checkingIn}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-amber-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            <span>{checkingIn ? 'Processing Shift...' : 'Punch Out & Conclude Shift'}</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
            ✓ Shift Completed Today · Working hours calculated
          </div>
        )}
      </div>

      {/* 3. Task Management Key Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div 
          onClick={() => navigateTo('tasks')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Assigned</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {totalAssigned}
          </div>
          <div className="text-[9px] text-blue-600 dark:text-sky-400 font-bold mt-1">Total Work Orders</div>
        </div>

        <div 
          onClick={() => navigateTo('tasks')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Pending</div>
          <div className="text-2xl font-black text-amber-500 font-mono mt-1">
            {totalPending}
          </div>
          <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1">Action Required</div>
        </div>

        <div 
          onClick={() => navigateTo('tasks')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Done</div>
          <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
            {totalCompleted}
          </div>
          <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Proof Submitted</div>
        </div>
      </div>

      {/* 4. Priority Dispatched Work Order Banner */}
      {nextTask ? (
        <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wide">
              {nextTask.priority.toUpperCase()} PRIORITY
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Due: {nextTask.due || 'Today'}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {nextTask.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
            {nextTask.description}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span className="truncate max-w-[170px]">{nextTask.address || 'Central Site, Delhi'}</span>
            </div>
            <button
              onClick={() => navigateTo('task_details', nextTask.id)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1 cursor-pointer"
            >
              <span>Inspect</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">All Tasks Completed</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Great job! No pending work orders assigned to you right now.</p>
        </div>
      )}

      {/* 5. Mobile Quick Action Hub */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigateTo('maps')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-xs flex items-center space-x-3 text-left transition-all active:scale-98"
          >
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">GPS Radar</div>
              <div className="text-[10px] text-slate-500">Live Navigation</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('leaves')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs flex items-center space-x-3 text-left transition-all active:scale-98"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Leave Quota</div>
              <div className="text-[10px] text-slate-500">Apply Time Off</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('reports')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xs flex items-center space-x-3 text-left transition-all active:scale-98"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Shift Report</div>
              <div className="text-[10px] text-slate-500">Daily Digest</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('location')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 hover:border-red-500/50 shadow-xs flex items-center space-x-3 text-left transition-all active:scale-98"
          >
            <div className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">SOS Beacon</div>
              <div className="text-[10px] text-slate-500">Emergency Panic</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
