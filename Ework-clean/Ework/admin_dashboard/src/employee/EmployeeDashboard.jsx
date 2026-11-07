import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, Play, Pause, ChevronRight,
  TrendingUp, Calendar as CalendarIcon, MapPin, Award, User,
  Bell, ArrowRight, ShieldCheck, CheckSquare, Sparkles, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

export default function EmployeeDashboard({ currentUser, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 10, 1)); // November 2026

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/dashboard-summary?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch employee dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentUser]);

  // Handle Quick Check-In / Check-Out from card
  const handleToggleAttendance = async () => {
    if (!data) return;
    try {
      setActionLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const isCheckedIn = data.attendanceStatus.isCheckedIn && !data.attendanceStatus.isCheckedOut;

      const endpoint = isCheckedIn
        ? `${API_BASE}/attendance/check-out`
        : `${API_BASE}/attendance/check-in`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lat: 28.6318,
          lng: 77.2170,
          notes: isCheckedIn ? 'Shift ended via quick punch' : 'Morning GPS check-in'
        })
      });
      const result = await res.json();
      if (result.success) {
        await fetchSummary();
      } else {
        alert(result.error || result.message || 'Action failed');
      }
    } catch (err) {
      console.error('Attendance toggle error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Break Toggle
  const handleToggleBreak = async () => {
    try {
      setActionLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/attendance/break`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const result = await res.json();
      if (result.success) {
        await fetchSummary();
      } else {
        alert(result.error || 'Break toggle failed');
      }
    } catch (err) {
      console.error('Break toggle error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your employee workspace...</p>
      </div>
    );
  }

  const employee = data?.employee || currentUser;
  const stats = data?.statistics || {};
  const attStatus = data?.attendanceStatus || {};
  const weeklyHours = data?.weeklyHours || [];
  const todayTasks = data?.todayTasks || [];
  const notifications = data?.recentNotifications || [];

  const isCheckedIn = attStatus.isCheckedIn && !attStatus.isCheckedOut;

  // Mini Calendar Calculations
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white">
            Welcome back, {employee?.name?.split(' ')[0] || 'Rahul'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span className="font-medium text-sky-600 dark:text-sky-400">{employee?.department || 'Field Services'}</span>
          </p>
        </div>

        {/* Quick Shift Badge */}
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 border ${
            isCheckedIn
              ? attStatus.isOnBreak
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              isCheckedIn
                ? attStatus.isOnBreak ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`}></span>
            <span>{isCheckedIn ? (attStatus.isOnBreak ? 'On Break' : 'On Duty (Shift Active)') : 'Shift Inactive'}</span>
          </div>

          <button
            onClick={fetchSummary}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Hero Widget Cards Grid (Concept layout from image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* 1. Profile & Day Progress Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 text-white">
                {employee?.avatar || '🔧'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {employee?.name || 'Rahul Sharma'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {employee?.designation || employee?.role} ({employee?.user_id || 'usr-102'})
                </p>
                <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Field Specialist</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Day Target</div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {stats.completedTasks || 0} / {stats.assignedTasks || 3} Tasks
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-500 stroke-current transition-all duration-700"
                  strokeDasharray={`${stats.completionRate || 68}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono">
                {stats.completionRate || 68}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Weekly Working Hours Bar Chart (Matching concept bar chart) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Logged Hours
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Standard 8.0h Shift Schedule</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              44.5h Total
            </span>
          </div>

          {/* Bar Chart Columns */}
          <div className="my-3 flex items-end justify-between h-24 px-1 gap-1.5">
            {weeklyHours.map((bar, idx) => {
              const heightPercent = Math.min(100, Math.round((bar.hours / 10) * 100));
              const isToday = idx === 3; // Thursday
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-500 mb-1">{bar.hours > 0 ? bar.hours : '-'}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-16 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-sky-400'
                          : bar.hours >= 8
                          ? 'bg-sky-500/80'
                          : bar.hours > 0
                          ? 'bg-amber-400/80'
                          : 'bg-transparent'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 ${isToday ? 'text-sky-500' : 'text-slate-400'}`}>
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            <span>View Full Attendance Roster</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 3. My Performance Radial Gauge Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                My Performance
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Quarterly Score Benchmark</p>
            </div>
            <Award className="h-4 w-4 text-amber-400" />
          </div>

          <div className="my-2 flex flex-col items-center justify-center">
            {/* Visual Dial Score representation */}
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-dashed border-sky-400/50 animate-[spin_12s_linear_infinite] flex items-center justify-center"></div>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-display tracking-tight text-slate-900 dark:text-white leading-none">
                  {stats.performanceScore || 350}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                  {stats.performanceTier || 'Excellent'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span>On-Time: <strong>96%</strong></span>
              <span>•</span>
              <span>Rating: <strong>4.9 ★</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('performance')}
            className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            <span>Go to Performance Trends</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 4. Attendance & Departure Control Card (Dark Glassmorphic Widget matching concept) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1528] to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-sky-400 flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Attendance &amp; Departure</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="mt-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">CHECKED IN</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {attStatus.checkInTime ? new Date(attStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:30 AM'}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-sky-400" />
                <span>Connaught Place (Geofenced)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleToggleAttendance}
                disabled={actionLoading}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                  isCheckedIn
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <span>{isCheckedIn ? 'Check Out' : 'Check In Now'}</span>
              </button>

              {isCheckedIn && (
                <button
                  onClick={handleToggleBreak}
                  disabled={actionLoading}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    attStatus.isOnBreak
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                  title={attStatus.isOnBreak ? 'Resume Work' : 'Take Break'}
                >
                  {attStatus.isOnBreak ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            <div className="text-[10px] text-center text-slate-400 font-mono">
              Duration Today: <span className="text-sky-300 font-bold">{stats.todayWorkHours || '9.9'} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Assigned Tasks</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.assignedTasks || 3}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Completed</div>
          <div className="text-xl font-black text-emerald-500 mt-1">{stats.completedTasks || 0}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">In Progress</div>
          <div className="text-xl font-black text-sky-500 mt-1">{stats.inProgressTasks || 1}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Actions</div>
          <div className="text-xl font-black text-amber-500 mt-1">{stats.pendingTasks || 2}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Attendance</div>
          <div className="text-xl font-black text-indigo-500 mt-1">{stats.attendanceRate || 98}%</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Performance</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.performanceScore || 350}</div>
        </div>
      </div>

      {/* Main Grid: Mini Calendar (Left) + Tasks Table (Center) + Urgent Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5">
        {/* Left Column: Mini Calendar (3 Cols on XL, 1 Col on LG) */}
        <div className="lg:col-span-1 xl:col-span-3 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  &larr;
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 my-2">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx} className="h-7 w-7"></div>;
                const isCurrentNov = currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 10;
                const isPresent = isCurrentNov && (day === 3 || day === 5);
                const isAbsent = isCurrentNov && day === 4;
                const isLate = isCurrentNov && day === 2;

                return (
                  <div
                    key={idx}
                    className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center font-medium text-[11px] transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                        : isAbsent
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold'
                        : isLate
                        ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px]">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Present</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Absent</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Late Arrival</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
          >
            Attendance Logs
          </button>
        </div>

        {/* Center Column: Today's Tasks (6 Cols on XL, 2 Cols on LG) */}
        <div className="lg:col-span-2 xl:col-span-6 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Assigned Tasks</h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                View All ({stats.assignedTasks || 3})
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending tasks for today. You're all caught up!
                </div>
              ) : (
                todayTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          t.priority === 'urgent' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          t.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center space-x-1.5">
                        <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{t.address || 'Delhi Site'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        t.status === 'in_progress' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        t.status === 'accepted' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30' :
                        t.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {t.status?.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => onNavigate('tasks')}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title="Open Task"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Open Tasks Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right Column: Urgent Announcements / Feed (3 Cols on XL, 1 Col on LG) */}
        <div className="lg:col-span-1 xl:col-span-3 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Announcements
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Stream</span>
            </div>

            <div className="space-y-3 mt-3">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNavigate('notifications')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 hover:border-sky-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-sm mt-0.5">
                      {n.type === 'task_assigned' ? '📋' : n.type === 'task_approved' ? '✅' : '📢'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('notifications')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
          >
            Notification Center ({data?.unreadNotificationsCount || 0} unread)
          </button>
        </div>
      </div>
    </div>
  );
}
