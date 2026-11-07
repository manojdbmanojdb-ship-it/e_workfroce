import React, { useState } from 'react';
import {
  BarChart2, Calendar, Clock, CheckCircle2, TrendingUp,
  Download, Share2, Award, Zap, Fuel, FileText, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const weeklyShifts = [
    { day: 'Mon', date: 'Nov 02', hours: 8.2, tasks: 4, distance: '14.2 km', onTime: true },
    { day: 'Tue', date: 'Nov 03', hours: 7.8, tasks: 3, distance: '11.8 km', onTime: true },
    { day: 'Wed', date: 'Nov 04', hours: 8.5, tasks: 5, distance: '18.4 km', onTime: true },
    { day: 'Thu', date: 'Nov 05', hours: 8.0, tasks: 4, distance: '12.0 km', onTime: true },
    { day: 'Fri', date: 'Nov 06', hours: 6.0, tasks: 2, distance: '7.8 km', onTime: true }
  ];

  const handleExport = () => {
    showToast('Exporting field performance summary PDF...', 'info');
    setTimeout(() => {
      showToast('Work report generated and saved to device downloads', 'success');
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'E-WorkForce Field Performance Report',
        text: 'E-WorkForce weekly attendance: 38.5 Hours logged, 18 tasks fulfilled (94% completion).'
      }).catch(() => {});
    } else {
      showToast('Weekly summary copied to clipboard', 'success');
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
              Productivity Index
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                title="Share Report"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                title="Export PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-black">Field Operations Summary</h2>
          <p className="text-xs text-indigo-200/80 mt-0.5">Verified duty telemetry & task resolution analytics</p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-indigo-500/20">
            <div>
              <span className="text-[10px] text-indigo-300 font-semibold uppercase">Total Hours</span>
              <p className="text-lg font-black text-white mt-0.5">38.5 hrs</p>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 font-semibold uppercase">Completed</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">18 / 19</p>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 font-semibold uppercase">Rating</span>
              <p className="text-lg font-black text-amber-400 mt-0.5">4.9 ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 p-1 rounded-full bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              period === 'week' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              period === 'month' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            This Month
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">Nov 02 - Nov 06</span>
      </div>

      {/* Visual Hours Bar Histogram */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Daily Shift Distribution</span>
          </h4>
          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Target 40h Met
          </span>
        </div>

        {/* Bar Chart Representation */}
        <div className="flex items-end justify-between gap-3 h-28 pt-4 px-2">
          {weeklyShifts.map((shift) => {
            const heightPercent = Math.min(100, Math.round((shift.hours / 10) * 100));
            return (
              <div key={shift.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {shift.hours}h
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden h-20">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg transition-all duration-500"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{shift.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Travel & Fuel Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-500">
            <Fuel className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Field Mileage</span>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">64.2 km</p>
            <span className="text-[10px] text-emerald-500">Verified by GPS</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Punctuality</span>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">100%</p>
            <span className="text-[10px] text-slate-400">Zero late check-ins</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Detailed Shift Log
        </h4>

        <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {weeklyShifts.map((s) => (
            <div key={s.date} className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-10">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">{s.day}</span>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{s.date.split(' ')[1]}</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {s.hours} Hours on Duty
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {s.tasks} tasks resolved • {s.distance} traveled
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-emerald-500 font-bold text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approved</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
