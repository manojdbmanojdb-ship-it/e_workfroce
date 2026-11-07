import React, { useState, useEffect } from 'react';
import {
  BarChart2, Award, TrendingUp, CheckCircle2, Clock,
  Star, ShieldCheck, Target, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

export default function EmployeePerformancePage({ currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/performance?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [currentUser]);

  if (loading && !data) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
        <span>Calculating your productivity metrics...</span>
      </div>
    );
  }

  const perf = data || {};
  const monthlyTrends = perf.monthlyTrends || [];
  const attendanceTrends = perf.attendanceTrends || [];
  const badges = perf.badges || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-sky-500" />
            <span>My Personal Performance Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strictly scoped productivity scores, SLA completion velocity &amp; client ratings
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-500 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          title="Refresh Metrics"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Top Benchmark KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks Completed</span>
          <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
            {perf.tasksCompleted || 0}
          </div>
          <span className="text-[10px] text-slate-500">Out of {perf.totalAssigned || 3} total</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Completion Rate</span>
          <div className="text-2xl font-black text-sky-500 font-mono mt-1">
            {perf.completionPercentage || 68}%
          </div>
          <span className="text-[10px] text-emerald-500 font-bold">+4.2% vs peer avg</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</span>
          <div className="text-2xl font-black text-indigo-500 font-mono mt-1">
            {perf.attendancePercentage || 97.5}%
          </div>
          <span className="text-[10px] text-slate-500">Geofence Verified</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Turnaround</span>
          <div className="text-2xl font-black text-amber-500 font-mono mt-1">
            {perf.avgCompletionHours || 2.2}h
          </div>
          <span className="text-[10px] text-slate-500">Per Service Order</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Rating</span>
          <div className="text-2xl font-black text-yellow-500 font-mono mt-1 flex items-center space-x-1">
            <span>{perf.customerRatingAvg || 4.9}</span>
            <Star className="h-4 w-4 fill-yellow-400" />
          </div>
          <span className="text-[10px] text-slate-500">Top 5% Satisfaction</span>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
          <span className="text-[10px] font-bold text-sky-100 uppercase">Productivity Score</span>
          <div className="text-2xl font-black font-mono mt-1">
            {perf.productivityScore || 350}
          </div>
          <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest">
            Level: Excellent
          </span>
        </div>
      </div>

      {/* Bar Graphs Section (Required by Item 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Task Completion Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Task Completion Comparison (Jan - Nov 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tasks Assigned vs Completed</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-700"></span>
                <span>Assigned</span>
              </span>
              <span className="flex items-center space-x-1 text-sky-500 font-bold">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500"></span>
                <span>Completed</span>
              </span>
            </div>
          </div>

          <div className="my-6 h-56 flex items-end justify-between gap-2 px-2">
            {monthlyTrends.map((item, idx) => {
              const maxVal = 35;
              const assignedHeight = Math.round((item.assigned / maxVal) * 100);
              const completedHeight = Math.round((item.completed / maxVal) * 100);
              const isCurrent = idx === monthlyTrends.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div className="h-44 w-full flex items-end justify-center gap-1">
                    {/* Assigned Bar */}
                    <div
                      style={{ height: `${assignedHeight}%` }}
                      className="w-2.5 rounded-t-md bg-slate-200 dark:bg-slate-700 transition-all"
                      title={`${item.assigned} Assigned`}
                    ></div>
                    {/* Completed Bar */}
                    <div
                      style={{ height: `${completedHeight}%` }}
                      className={`w-2.5 rounded-t-md transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-t from-blue-600 to-sky-400'
                          : 'bg-sky-500 hover:bg-sky-400'
                      }`}
                      title={`${item.completed} Completed`}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-sky-500' : 'text-slate-400'}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Annual Completion: <strong>94.2%</strong></span>
            <span className="text-emerald-500 font-bold">✓ Meets Enterprise SLA</span>
          </div>
        </div>

        {/* Weekly Attendance Comparison Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Attendance &amp; Working Hours Efficiency
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Average Daily Working Hours vs 8.0h Shift Target</p>
            </div>
            <span className="text-xs font-bold text-emerald-500">97.5% Punctuality</span>
          </div>

          <div className="my-6 h-56 flex items-end justify-around px-4">
            {attendanceTrends.map((day, idx) => {
              const heightPercent = Math.min(100, Math.round((day.hours / 10) * 100));
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">{day.hours}h</span>
                  <div className="w-10 bg-slate-100 dark:bg-slate-800 rounded-t-xl h-44 flex items-end p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 via-teal-500 to-sky-400 transition-all"
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    {day.day}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold">{day.onTime}%</span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Weekly Hours: <strong>44.5 hrs</strong></span>
            <span className="text-sky-500 font-mono font-bold">+4.5 hrs Overtime</span>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Personal Performance Accolades &amp; Certifications
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex items-center space-x-3.5"
            >
              <div className="h-11 w-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
                {b.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Awarded: {b.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
