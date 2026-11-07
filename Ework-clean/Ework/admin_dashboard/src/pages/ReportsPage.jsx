import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Star, Clock, CheckCircle2,
  Users, BarChart2, Download, Printer, Search, Award,
  Mail, Send, X, Sparkles
} from 'lucide-react';
import WorkforceBarChart from '../components/WorkforceBarChart';
import OperationsLineChart from '../components/OperationsLineChart';

const PERFORMANCE_DATA = [
  { name: 'Rahul Sharma', role: 'Technician', tasksCompleted: 42, onTime: 95, avgRating: 4.8, overtime: '14h', efficiency: 'high', distanceKm: 284 },
  { name: 'Priya Patel', role: 'Sales Executive', tasksCompleted: 38, onTime: 88, avgRating: 4.6, overtime: '6h', efficiency: 'high', distanceKm: 195 },
  { name: 'Sneha Rao', role: 'Site Inspector', tasksCompleted: 31, onTime: 90, avgRating: 4.7, overtime: '0h', efficiency: 'high', distanceKm: 160 },
  { name: 'Amit Verma', role: 'Delivery Agent', tasksCompleted: 29, onTime: 76, avgRating: 4.2, overtime: '2h', efficiency: 'medium', distanceKm: 420 },
  { name: 'Vikram Singh', role: 'Field Engineer', tasksCompleted: 18, onTime: 60, avgRating: 3.9, overtime: '8h', efficiency: 'low', distanceKm: 110 },
];

const EFF_STYLE = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 font-bold dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30',
  low: 'bg-red-50 text-red-700 border-red-200 font-bold dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
};

const KPI_METRICS = [
  {
    label: 'Total Tasks This Month',
    value: '158',
    icon: CheckCircle2,
    trend: '+12%',
    containerClass: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
    iconClass: 'text-sky-600 dark:text-sky-400',
    trendClass: 'text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10',
    valClass: 'text-sky-700 dark:text-sky-400',
    labelClass: 'text-sky-800 dark:text-sky-300'
  },
  {
    label: 'Avg Task Completion Rate',
    value: '87%',
    icon: TrendingUp,
    trend: '+4%',
    containerClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    trendClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10',
    valClass: 'text-emerald-700 dark:text-emerald-400',
    labelClass: 'text-emerald-800 dark:text-emerald-300'
  },
  {
    label: 'Avg Customer Rating',
    value: '4.6 ★',
    icon: Star,
    trend: '+0.2',
    containerClass: 'bg-amber-50 dark:bg-yellow-500/10 border-amber-200 dark:border-yellow-500/20',
    iconClass: 'text-amber-600 dark:text-yellow-400',
    trendClass: 'text-amber-700 dark:text-yellow-400 bg-amber-100 dark:bg-yellow-500/10',
    valClass: 'text-amber-700 dark:text-yellow-400',
    labelClass: 'text-amber-800 dark:text-yellow-300'
  },
  {
    label: 'Active Field Personnel',
    value: '24',
    icon: Users,
    trend: 'Stable',
    containerClass: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    trendClass: 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10',
    valClass: 'text-indigo-700 dark:text-indigo-400',
    labelClass: 'text-indigo-800 dark:text-indigo-300'
  }
];

export default function ReportsPage({ darkMode = false }) {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('October 2026');
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [digestData, setDigestData] = useState(null);
  const [sendingDigest, setSendingDigest] = useState(false);

  const handleTriggerDigest = async () => {
    try {
      setSendingDigest(true);
      const res = await fetch('http://localhost:5000/api/notifications/daily-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: 'operations-director@ework.enterprise'
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDigestData(json.data);
        setShowDigestModal(true);
      }
    } catch (err) {
      console.error('Failed to trigger daily digest:', err);
    } finally {
      setSendingDigest(false);
    }
  };

  const filtered = PERFORMANCE_DATA.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Employee,Role,Tasks Completed,On-Time Rate,Avg Rating,Overtime Hours,Travel Distance (km),Efficiency Tier'];
    const rows = filtered.map(r =>
      `"${r.name}","${r.role}","${r.tasksCompleted}","${r.onTime}%","${r.avgRating}","${r.overtime}","${r.distanceKm} km","${r.efficiency.toUpperCase()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ework_performance_report_${period.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/90 dark:border-slate-800/80 mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white">Performance Analytics & Audits</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
              {period}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Workforce productivity, SLA compliance, overtime, and customer satisfaction audits</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerDigest}
            disabled={sendingDigest}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-sky-200 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            <span>{sendingDigest ? 'Compiling Digest...' : '📧 Trigger Email Digest'}</span>
          </button>
          <button
            onClick={exportCSV}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              darkMode
                ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Download className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Top MVP Performer Banner */}
      <div className="p-4 mb-6 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-emerald-50 dark:from-blue-900/40 dark:via-sky-900/20 dark:to-emerald-950/30 border border-sky-200 dark:border-sky-500/30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Top Field Performer of the Month</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">Rahul Sharma · 42 Tasks Completed (95% On-Time, 4.8 ★)</div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            Gold Tier Certified
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {KPI_METRICS.map(({ label, value, icon: Icon, trend, containerClass, iconClass, trendClass, valClass, labelClass }) => (
          <div key={label} className={`p-4 rounded-2xl border shadow-xs ${containerClass}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-5 w-5 ${iconClass}`} />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendClass}`}>{trend}</span>
            </div>
            <div className={`text-2xl font-black ${valClass}`}>{value}</div>
            <div className={`text-[11px] mt-1 leading-snug font-medium ${labelClass}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Visual Analytics & Executive Chart Dashboard (Bar & Line Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WorkforceBarChart darkMode={darkMode} />
        <OperationsLineChart darkMode={darkMode} />
      </div>

      {/* Search and Period Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['October 2026', 'Quarter 3', 'Year-to-Date'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === p
                  ? darkMode
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold'
                  : darkMode
                    ? 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-xs border ${
              darkMode
                ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Performance Audit Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
        darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center space-x-2">
            <BarChart2 className={`h-4 w-4 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Staff Productivity & SLA Leaderboard</span>
          </div>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{filtered.length} Employees Filtered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                darkMode ? 'border-slate-800 bg-slate-900/90 text-slate-400' : 'border-slate-200 bg-slate-100/90 text-slate-700'
              }`}>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Tasks Done</th>
                <th className="px-4 py-3 text-left">On-Time SLA</th>
                <th className="px-4 py-3 text-left">Client Rating</th>
                <th className="px-4 py-3 text-left">Mileage (km)</th>
                <th className="px-4 py-3 text-left">Overtime</th>
                <th className="px-4 py-3 text-left">Efficiency Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.name}
                  className={`border-b transition-colors ${
                    darkMode
                      ? `border-slate-800/50 hover:bg-slate-800/40 ${i % 2 === 0 ? '' : 'bg-slate-950/20'}`
                      : `border-slate-100 hover:bg-slate-50/80 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                    <div className="text-[10px] text-slate-500">{row.role}</div>
                  </td>
                  <td className="px-4 py-3 text-blue-600 dark:text-sky-400 font-bold font-mono">{row.tasksCompleted}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.onTime >= 90 ? 'bg-emerald-500' : row.onTime >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${row.onTime}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{row.onTime}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-amber-500 dark:text-yellow-400 font-bold font-mono">{row.avgRating} ★</td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{row.distanceKm} km</td>
                  <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{row.overtime}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${EFF_STYLE[row.efficiency]}`}>
                      {row.efficiency.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Shift Email Digest Modal */}
      {showDigestModal && digestData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
            darkMode ? 'bg-[#091120] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Manager Shift Report Digest</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Delivered via Email & Webhook
                    </span>
                  </div>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    To: <span className="text-sky-500 font-mono font-medium">{digestData.recipient}</span> · Sent: {new Date(digestData.sentAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDigestModal(false)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Digest Key Metrics Row */}
            <div className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3 ${
              darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-lg font-black text-emerald-500 dark:text-emerald-400">{digestData.stats.presentCount}/{digestData.stats.totalEmployees}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Staff Present</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                <div className="text-lg font-black text-sky-500 dark:text-sky-400">{digestData.stats.tasksCompleted}/{digestData.stats.tasksTotal}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Tasks Completed</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-lg font-black text-amber-500 dark:text-amber-400">{digestData.stats.totalReimbursement}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Fuel Claims</div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <div className="text-lg font-black text-cyan-500 dark:text-cyan-400">{digestData.stats.fuelSavedKm}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Fuel Distance Saved</div>
              </div>
            </div>

            {/* Email HTML Preview Frame */}
            <div className={`p-4 overflow-y-auto flex-1 ${darkMode ? 'bg-[#050b14]' : 'bg-slate-50'}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>Responsive HTML Email Render Preview</span>
              </div>
              <div
                className={`rounded-xl border p-2 overflow-hidden ${
                  darkMode ? 'border-slate-800 bg-[#050b14]' : 'border-slate-200 bg-white'
                }`}
                dangerouslySetInnerHTML={{ __html: digestData.html }}
              />
            </div>

            {/* Footer */}
            <div className={`p-3 border-t flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100'
            }`}>
              <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Scheduled automated cron: Every day at 20:00 IST
              </span>
              <button
                onClick={() => setShowDigestModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
