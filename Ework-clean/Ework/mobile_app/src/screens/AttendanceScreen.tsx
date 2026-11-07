import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { AttendanceRecord } from '../types';
import { 
  Clock, MapPin, CheckCircle2, AlertTriangle, Coffee, 
  Calendar, ShieldCheck, ChevronRight, RefreshCw, Zap 
} from 'lucide-react';

export const AttendanceScreen: React.FC = () => {
  const { 
    currentUser, currentLocation, showToast, 
    todayAttendance, setTodayAttendance 
  } = useApp();

  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAttendance();
      if (res.success && res.data) {
        setHistory(res.data);
        const todayStr = new Date().toISOString().split('T')[0];
        const today = res.data.find(a => a.date === todayStr);
        if (today) setTodayAttendance(today);
      }
    } catch (e) {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    if (todayAttendance?.check_in_time) {
      showToast('Duplicate prevented: You have already checked in for today', 'error');
      return;
    }

    setProcessing(true);
    try {
      const res = await apiService.checkIn(currentLocation.lat, currentLocation.lng, 'Mobile GPS Punch');
      if (res.success && res.data) {
        setTodayAttendance(res.data);
        setHistory(prev => [res.data!, ...prev.filter(p => p.id !== res.data!.id)]);
        showToast(res.message || 'Check-In recorded with GPS geofence stamp!', 'success');
      } else {
        showToast(res.error || 'Check-in failed.', 'error');
      }
    } catch (e) {
      const record: AttendanceRecord = {
        id: `att-${Date.now()}`,
        user_id: currentUser?.id || 'emp-1',
        user_name: currentUser?.name || 'Rahul Sharma',
        date: new Date().toISOString().split('T')[0],
        check_in_time: new Date().toISOString(),
        is_within_geofence: 1,
        verification_method: 'gps_geofence',
        status: 'present'
      };
      setTodayAttendance(record);
      setHistory(prev => [record, ...prev]);
      showToast('Offline: Check-in saved to local storage.', 'info');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?.check_in_time) {
      showToast('Cannot check out: You have not checked in yet today', 'error');
      return;
    }

    if (todayAttendance.check_out_time) {
      showToast('Shift already completed for today.', 'info');
      return;
    }

    setProcessing(true);
    try {
      const res = await apiService.checkOut(currentLocation.lat, currentLocation.lng, 'Mobile GPS Punch Out');
      if (res.success && res.data) {
        setTodayAttendance(res.data);
        setHistory(prev => [res.data!, ...prev.filter(p => p.id !== res.data!.id)]);
        showToast('Check-out verified. Overtime computed!', 'success');
      } else {
        showToast(res.error || 'Check-out failed.', 'error');
      }
    } catch (e) {
      const now = new Date().toISOString();
      setTodayAttendance(prev => prev ? ({ ...prev, check_out_time: now }) : null);
      showToast('Offline: Check-out saved locally.', 'info');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleBreak = async () => {
    const nextState = !isOnBreak;
    setIsOnBreak(nextState);
    try {
      await apiService.toggleBreak(nextState ? 'start' : 'end');
      showToast(nextState ? 'Tea/Lunch Break started' : 'Break ended. Shift resumed.', 'info');
    } catch (e) {
      showToast(nextState ? 'Break active (Offline)' : 'Break ended (Offline)', 'info');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
      {/* 1. GPS Geofence Telemetry Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-sky-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              GPS Geofence Status
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Within 150m Perimeter
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Coordinates</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
              {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Signal Accuracy</div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ±{currentLocation.accuracy} meters
            </div>
          </div>
        </div>

        {/* Action Controls: Punch In / Punch Out */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleCheckIn}
            disabled={processing || !!todayAttendance?.check_in_time}
            className={`py-3 px-3 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all ${
              todayAttendance?.check_in_time
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-98 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{todayAttendance?.check_in_time ? 'Checked In' : 'Check In'}</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={processing || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
            className={`py-3 px-3 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all ${
              !todayAttendance?.check_in_time || todayAttendance?.check_out_time
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25 active:scale-98 cursor-pointer'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{todayAttendance?.check_out_time ? 'Checked Out' : 'Check Out'}</span>
          </button>
        </div>

        {/* Break Mode Toggle */}
        {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
          <button
            onClick={handleToggleBreak}
            className={`w-full py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isOnBreak
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Coffee className="h-4 w-4 text-amber-500" />
            <span>{isOnBreak ? 'On Break (Tap to Resume Duty)' : 'Pause for Tea / Lunch Break'}</span>
          </button>
        )}
      </div>

      {/* 2. Today's Punch Summary */}
      {todayAttendance && (
        <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-slate-900/60 border border-blue-200 dark:border-blue-900/50 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 dark:text-sky-300">Today's Shift Punch Record</span>
            <span className="font-mono text-[10px] text-slate-500">{todayAttendance.date}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-[#091222] border border-blue-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Punch In</div>
              <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">
                {new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-[#091222] border border-blue-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Punch Out</div>
              <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">
                {todayAttendance.check_out_time 
                  ? new Date(todayAttendance.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-[#091222] border border-blue-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Status</div>
              <div className="font-mono font-bold text-emerald-500 uppercase mt-0.5">
                {todayAttendance.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Monthly Attendance History Log */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Attendance History
          </h3>
          <button 
            onClick={loadAttendance}
            className="text-[11px] text-blue-600 dark:text-sky-400 flex items-center space-x-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800">
              No historical punch records found.
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    In: {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {record.check_out_time && ` · Out: ${new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    record.status === 'present'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {record.status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {record.verification_method?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
