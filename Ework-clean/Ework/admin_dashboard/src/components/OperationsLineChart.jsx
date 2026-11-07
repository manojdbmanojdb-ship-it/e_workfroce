import React, { useState, useRef } from 'react';
import { TrendingUp, Activity, Calendar, Zap, Sparkles, Filter } from 'lucide-react';

const FULL_OCTOBER_DATA = [
  { day: 'Oct 01', date: '01 Oct 2026', weekday: 'Thu', tasks: 12, onTimeRate: 88, overtimeHours: 2.5, personnel: 22 },
  { day: 'Oct 02', date: '02 Oct 2026', weekday: 'Fri', tasks: 15, onTimeRate: 91, overtimeHours: 3.0, personnel: 23 },
  { day: 'Oct 03', date: '03 Oct 2026', weekday: 'Sat', tasks: 14, onTimeRate: 89, overtimeHours: 1.5, personnel: 20 },
  { day: 'Oct 04', date: '04 Oct 2026', weekday: 'Sun', tasks: 8,  onTimeRate: 94, overtimeHours: 0.5, personnel: 14 },
  { day: 'Oct 05', date: '05 Oct 2026', weekday: 'Mon', tasks: 16, onTimeRate: 87, overtimeHours: 4.0, personnel: 24 },
  { day: 'Oct 06', date: '06 Oct 2026', weekday: 'Tue', tasks: 18, onTimeRate: 90, overtimeHours: 3.5, personnel: 24 },
  { day: 'Oct 07', date: '07 Oct 2026', weekday: 'Wed', tasks: 21, onTimeRate: 93, overtimeHours: 5.0, personnel: 24 },
  { day: 'Oct 08', date: '08 Oct 2026', weekday: 'Thu', tasks: 19, onTimeRate: 92, overtimeHours: 4.2, personnel: 24 },
  { day: 'Oct 09', date: '09 Oct 2026', weekday: 'Fri', tasks: 17, onTimeRate: 88, overtimeHours: 2.8, personnel: 23 },
  { day: 'Oct 10', date: '10 Oct 2026', weekday: 'Sat', tasks: 22, onTimeRate: 95, overtimeHours: 5.5, personnel: 22 },
  { day: 'Oct 11', date: '11 Oct 2026', weekday: 'Sun', tasks: 10, onTimeRate: 96, overtimeHours: 1.0, personnel: 15 },
  { day: 'Oct 12', date: '12 Oct 2026', weekday: 'Mon', tasks: 18, onTimeRate: 89, overtimeHours: 3.2, personnel: 24 },
  { day: 'Oct 13', date: '13 Oct 2026', weekday: 'Tue', tasks: 20, onTimeRate: 91, overtimeHours: 4.0, personnel: 24 },
  { day: 'Oct 14', date: '14 Oct 2026', weekday: 'Wed', tasks: 24, onTimeRate: 96, overtimeHours: 6.2, personnel: 24 }, // Peak day
  { day: 'Oct 15', date: '15 Oct 2026', weekday: 'Thu', tasks: 21, onTimeRate: 94, overtimeHours: 4.8, personnel: 24 },
  { day: 'Oct 16', date: '16 Oct 2026', weekday: 'Fri', tasks: 19, onTimeRate: 93, overtimeHours: 3.9, personnel: 24 },
  { day: 'Oct 17', date: '17 Oct 2026', weekday: 'Sat', tasks: 16, onTimeRate: 95, overtimeHours: 2.4, personnel: 21 }, // Today
];

export default function OperationsLineChart({ darkMode = false }) {
  const [range, setRange] = useState('14d'); // '7d' | '14d' | 'all'
  const [showTasks, setShowTasks] = useState(true);
  const [showSLA, setShowSLA] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  // Slice dataset based on active range
  const data = range === '7d' 
    ? FULL_OCTOBER_DATA.slice(-7) 
    : range === '14d' 
      ? FULL_OCTOBER_DATA.slice(-14) 
      : FULL_OCTOBER_DATA;

  // Chart dimensions
  const width = 540;
  const height = 240;
  const padding = { top: 25, right: 35, bottom: 40, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Scales
  const maxTasks = 28;
  const minSLA = 80;
  const maxSLA = 100;

  const getX = (index) => padding.left + (index / (data.length - 1)) * chartW;
  const getYTasks = (val) => padding.top + chartH - (val / maxTasks) * chartH;
  const getYSLA = (val) => padding.top + chartH - ((val - minSLA) / (maxSLA - minSLA)) * chartH;

  // Smooth bezier curve generator
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const taskPoints = data.map((d, i) => ({ x: getX(i), y: getYTasks(d.tasks) }));
  const slaPoints = data.map((d, i) => ({ x: getX(i), y: getYSLA(d.onTimeRate) }));

  const taskCurve = createSmoothPath(taskPoints);
  const slaCurve = createSmoothPath(slaPoints);

  // Closed area paths for gradient glow
  const taskArea = `${taskCurve} L ${taskPoints[taskPoints.length - 1].x} ${padding.top + chartH} L ${taskPoints[0].x} ${padding.top + chartH} Z`;
  const slaArea = `${slaCurve} L ${slaPoints[slaPoints.length - 1].x} ${padding.top + chartH} L ${slaPoints[0].x} ${padding.top + chartH} Z`;

  // Handle Mouse Hover Scrubbing
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * width;
    
    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < data.length; i++) {
      const diff = Math.abs(getX(i) - relX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  // Key stats
  const totalCompleted = data.reduce((sum, d) => sum + d.tasks, 0);
  const avgSla = Math.round(data.reduce((sum, d) => sum + d.onTimeRate, 0) / data.length);
  const peakDay = [...data].sort((a, b) => b.tasks - a.tasks)[0];

  return (
    <div className={`p-5 rounded-2xl border shadow-xs flex flex-col h-full transition-colors ${
      darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Chart Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg border ${
              darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <Activity className="h-4 w-4" />
            </div>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Operations & SLA Trend Curve</h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Day-by-day work order completion velocity vs SLA reliability (%)
          </p>
        </div>

        {/* Range Switcher */}
        <div className={`flex items-center space-x-1 p-1 rounded-xl border self-start sm:self-auto ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: '7d', label: '7 Days' },
            { id: '14d', label: '14 Days' },
            { id: 'all', label: 'MTD (17d)' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => { setRange(r.id); setHoverIndex(null); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                range === r.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Series Toggles */}
      <div className="flex items-center justify-between pt-3 pb-1 text-xs">
        <div className="flex items-center space-x-3 text-[11px]">
          <button
            type="button"
            onClick={() => setShowTasks(!showTasks)}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              showTasks 
                ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 font-bold' 
                : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_#38bdf8]"></span>
            <span>Tasks Completed (Left Axis)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSLA(!showSLA)}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              showSLA 
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold' 
                : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399]"></span>
            <span>On-Time SLA % (Right Axis)</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:flex items-center space-x-2">
          <span>Avg: <strong className="text-blue-600 dark:text-sky-400">{Math.round(totalCompleted / data.length)} / day</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>SLA: <strong className="text-emerald-700 dark:text-emerald-400">{avgSla}%</strong></span>
        </div>
      </div>

      {/* SVG Interactive Curve */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="w-full h-auto max-h-[220px] overflow-visible select-none cursor-crosshair"
        >
          <defs>
            <linearGradient id="cyanLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38bdf8" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y1 Values */}
          {[0, 7, 14, 21, 28].map(val => {
            const y = getYTasks(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill={darkMode ? '#64748b' : '#475569'}
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis (SLA %) */}
          {[80, 85, 90, 95, 100].map(val => {
            const y = getYSLA(val);
            return (
              <text
                key={val}
                x={width - padding.right + 8}
                y={y + 3}
                textAnchor="start"
                fill={darkMode ? '#059669' : '#047857'}
                fontSize="9"
                fontFamily="monospace"
              >
                {val}%
              </text>
            );
          })}

          {/* Area Fills under curves */}
          {showTasks && (
            <path d={taskArea} fill="url(#cyanLineGradient)" className="transition-all duration-300" />
          )}
          {showSLA && (
            <path d={slaArea} fill="url(#emeraldLineGradient)" className="transition-all duration-300" />
          )}

          {/* Primary Line Curve (Tasks Completed) */}
          {showTasks && (
            <path
              d={taskCurve}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#lineGlow)"
              className="transition-all duration-300 dark:stroke-[#38bdf8]"
            />
          )}

          {/* Secondary Line Curve (On-Time SLA %) */}
          {showSLA && (
            <path
              d={slaCurve}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 2"
              className="transition-all duration-300 dark:stroke-[#34d399]"
            />
          )}

          {/* X-Axis Day Labels */}
          {data.map((d, i) => {
            // Show every label if 7d, every 2nd if 14d, every 3rd if 30d
            const shouldShow = range === '7d' || (range === '14d' && i % 2 === 0) || (i % 3 === 0) || i === data.length - 1;
            if (!shouldShow) return null;
            return (
              <text
                key={d.day}
                x={getX(i)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fill={hoverIndex === i ? (darkMode ? '#38bdf8' : '#2563eb') : (darkMode ? '#64748b' : '#475569')}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={hoverIndex === i ? 'bold' : 'normal'}
              >
                {d.day.replace('Oct ', '')} Oct
              </text>
            );
          })}

          {/* Interactive Hover Vertical Guideline & Indicator Dots */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartH}
                stroke={darkMode ? '#94a3b8' : '#94a3b8'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {showTasks && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getYTasks(activePoint.tasks)}
                  r="5.5"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#lineGlow)"
                  className="dark:fill-[#38bdf8]"
                />
              )}
              {showSLA && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getYSLA(activePoint.onTimeRate)}
                  r="5"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="dark:fill-[#34d399]"
                />
              )}
            </g>
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute top-2 pointer-events-none bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-emerald-500/40 p-2.5 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-md text-xs animate-in fade-in duration-100 z-20"
            style={{
              left: Math.min(Math.max(10, getX(hoverIndex) - 70), width - 150)
            }}
          >
            <div className="flex items-center justify-between gap-3 font-bold text-slate-900 dark:text-white mb-1">
              <span>📅 {activePoint.date} ({activePoint.weekday})</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 rounded border border-emerald-200 dark:border-emerald-500/20 font-bold">
                {activePoint.personnel} Active Staff
              </span>
            </div>
            <div className="space-y-0.5 text-[11px] font-mono">
              <div className="text-sky-700 dark:text-sky-300">
                📋 Tasks Completed: <strong className="text-slate-900 dark:text-white">{activePoint.tasks} orders</strong>
              </div>
              <div className="text-emerald-700 dark:text-emerald-300">
                ⚡ On-Time SLA: <strong className="text-slate-900 dark:text-white">{activePoint.onTimeRate}%</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                ⏱️ Overtime Logged: <strong className="text-slate-900 dark:text-white">{activePoint.overtimeHours} hrs</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
          <span>Peak Velocity: <strong className="text-slate-900 dark:text-white">{peakDay.date}</strong> ({peakDay.tasks} tasks, {peakDay.onTimeRate}% SLA)</span>
        </div>
        <div className="flex items-center space-x-1 text-blue-600 dark:text-sky-400 font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Total MTD: 158 tasks</span>
        </div>
      </div>
    </div>
  );
}
