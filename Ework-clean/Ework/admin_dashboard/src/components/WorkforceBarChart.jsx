import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, ArrowUpRight, Award, Zap } from 'lucide-react';

const STAFF_DATA = [
  { name: 'Rahul S.', fullName: 'Rahul Sharma', role: 'Lead Technician', tasks: 42, onTime: 40, distance: 284, rating: 4.8, overtime: 14 },
  { name: 'Priya P.', fullName: 'Priya Patel', role: 'Sales Executive', tasks: 38, onTime: 34, distance: 195, rating: 4.6, overtime: 6 },
  { name: 'Sneha R.', fullName: 'Sneha Rao', role: 'Site Inspector', tasks: 31, onTime: 28, distance: 160, rating: 4.7, overtime: 0 },
  { name: 'Amit V.', fullName: 'Amit Verma', role: 'Delivery Agent', tasks: 29, onTime: 22, distance: 420, rating: 4.2, overtime: 2 },
  { name: 'Vikram S.', fullName: 'Vikram Singh', role: 'Field Engineer', tasks: 24, onTime: 20, distance: 210, rating: 4.4, overtime: 8 },
  { name: 'Deepa N.', fullName: 'Deepa Nair', role: 'Technician', tasks: 18, onTime: 14, distance: 110, rating: 3.9, overtime: 8 }
];

export default function WorkforceBarChart({ darkMode = false }) {
  const [metric, setMetric] = useState('tasks'); // 'tasks' | 'distance' | 'rating'
  const [hoveredStaff, setHoveredStaff] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Chart dimensions
  const width = 540;
  const height = 240;
  const padding = { top: 25, right: 20, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max scale determination
  let maxVal = 50;
  if (metric === 'distance') maxVal = 500;
  if (metric === 'rating') maxVal = 5.0;

  const getPrimaryVal = (s) => {
    if (metric === 'tasks') return s.tasks;
    if (metric === 'distance') return s.distance;
    return s.rating;
  };

  const getSecondaryVal = (s) => {
    if (metric === 'tasks') return s.onTime;
    return null;
  };

  const slotW = chartW / STAFF_DATA.length;
  const barW = metric === 'tasks' ? 14 : 22;

  // Grid tick marks
  const ticks = metric === 'rating' ? [1, 2, 3, 4, 5] : [0, 10, 20, 30, 40, 50].map(v => metric === 'distance' ? v * 10 : v);

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
              darkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-600 border-sky-200'
            }`}>
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Staff Productivity & Workload Distribution</h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Comparative performance across active field personnel
          </p>
        </div>

        {/* Metric Switcher Pills */}
        <div className={`flex items-center space-x-1 p-1 rounded-xl border self-start sm:self-auto ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'tasks', label: 'Tasks Done' },
            { id: 'distance', label: 'Mileage (km)' },
            { id: 'rating', label: 'Rating (★)' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metric === m.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Quick Summary */}
      <div className="flex items-center justify-between pt-3 pb-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-4 text-[11px]">
          {metric === 'tasks' ? (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-sky-600 to-sky-400"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Total Completed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">On-Time SLA</span>
              </div>
            </>
          ) : metric === 'distance' ? (
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Total Travel Km</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-amber-600 to-amber-400"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Customer Rating (out of 5.0)</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Hover bar for details</span>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[220px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id="skyBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="cyanBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="amberBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {ticks.map(val => {
            const y = padding.top + chartH - (val / maxVal) * chartH;
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
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}{metric === 'rating' ? '★' : ''}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {STAFF_DATA.map((s, idx) => {
            const centerX = padding.left + idx * slotW + slotW / 2;
            const pVal = getPrimaryVal(s);
            const sVal = getSecondaryVal(s);

            const pH = Math.max(4, (pVal / maxVal) * chartH);
            const pY = padding.top + chartH - pH;

            const isHovered = hoveredStaff && hoveredStaff.fullName === s.fullName;

            if (metric === 'tasks') {
              const sH = Math.max(4, (sVal / maxVal) * chartH);
              const sY = padding.top + chartH - sH;

              const gap = 3;
              const b1X = centerX - barW - gap / 2;
              const b2X = centerX + gap / 2;

              return (
                <g
                  key={s.fullName}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredStaff(s);
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredStaff(null)}
                  className="cursor-pointer group"
                >
                  {/* Subtle column highlight */}
                  <rect
                    x={centerX - slotW / 2 + 4}
                    y={padding.top}
                    width={slotW - 8}
                    height={chartH}
                    fill={isHovered ? 'rgba(56, 189, 248, 0.06)' : 'transparent'}
                    rx="8"
                    className="transition-colors"
                  />

                  {/* Primary Bar: Total Tasks */}
                  <rect
                    x={b1X}
                    y={pY}
                    width={barW}
                    height={pH}
                    fill="url(#skyBarGrad)"
                    rx="4"
                    filter={isHovered ? 'url(#barGlow)' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Primary Value Badge on top */}
                  <text
                    x={b1X + barW / 2}
                    y={pY - 5}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pVal}
                  </text>

                  {/* Secondary Bar: On-Time Tasks */}
                  <rect
                    x={b2X}
                    y={sY}
                    width={barW}
                    height={sH}
                    fill="url(#emeraldBarGrad)"
                    rx="4"
                    className="transition-all duration-300"
                  />
                  {/* Secondary Value Badge */}
                  <text
                    x={b2X + barW / 2}
                    y={sY - 5}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {sVal}
                  </text>

                  {/* X-Axis Name */}
                  <text
                    x={centerX}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    fill={isHovered ? (darkMode ? '#38bdf8' : '#2563eb') : (darkMode ? '#94a3b8' : '#334155')}
                    fontSize="11"
                    fontWeight={isHovered ? 'bold' : '600'}
                  >
                    {s.name}
                  </text>
                  <text
                    x={centerX}
                    y={height - padding.bottom + 30}
                    textAnchor="middle"
                    fill={darkMode ? '#64748b' : '#64748b'}
                    fontSize="8.5"
                  >
                    {Math.round((s.onTime / s.tasks) * 100)}% SLA
                  </text>
                </g>
              );
            }

            // Single bar mode (Distance or Rating)
            const bX = centerX - barW / 2;
            const gradId = metric === 'distance' ? 'url(#cyanBarGrad)' : 'url(#amberBarGrad)';
            const textColor = metric === 'distance' ? '#0891b2' : '#d97706';

            return (
              <g
                key={s.fullName}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredStaff(s);
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setHoveredStaff(null)}
                className="cursor-pointer group"
              >
                {/* Background highlight */}
                <rect
                  x={centerX - slotW / 2 + 4}
                  y={padding.top}
                  width={slotW - 8}
                  height={chartH}
                  fill={isHovered ? (darkMode ? 'rgba(56, 189, 248, 0.06)' : 'rgba(37, 99, 235, 0.05)') : 'transparent'}
                  rx="8"
                />

                <rect
                  x={bX}
                  y={pY}
                  width={barW}
                  height={pH}
                  fill={gradId}
                  rx="5"
                  className="transition-all duration-300"
                />
                <text
                  x={centerX}
                  y={pY - 5}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {metric === 'distance' ? `${pVal}k` : `${pVal}★`}
                </text>

                {/* X-Axis Label */}
                <text
                  x={centerX}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fill={isHovered ? (darkMode ? '#38bdf8' : '#2563eb') : (darkMode ? '#94a3b8' : '#334155')}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : '600'}
                >
                  {s.name}
                </text>
                <text
                  x={centerX}
                  y={height - padding.bottom + 30}
                  textAnchor="middle"
                  fill={darkMode ? '#64748b' : '#64748b'}
                  fontSize="8.5"
                >
                  {s.role.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredStaff && (
          <div className="absolute top-2 right-2 bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-sky-500/40 p-2.5 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-md pointer-events-none text-xs animate-in fade-in duration-150 z-20">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-1">
              <span>👤 {hoveredStaff.fullName}</span>
              <span className="text-[10px] text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-sky-500/20 font-bold">
                {hoveredStaff.role}
              </span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              <div>📋 Tasks: <strong className="text-slate-900 dark:text-white">{hoveredStaff.tasks} total</strong> (✓ {hoveredStaff.onTime} on-time)</div>
              <div>⚡ SLA Compliance: <strong className="text-emerald-700 dark:text-emerald-400">{Math.round((hoveredStaff.onTime / hoveredStaff.tasks) * 100)}%</strong></div>
              <div>🚗 Fleet Travel: <strong className="text-slate-900 dark:text-white">{hoveredStaff.distance} km</strong></div>
              <div>⭐ Customer Rating: <strong className="text-amber-600 dark:text-amber-400">{hoveredStaff.rating} / 5.0</strong></div>
              <div>⏱️ Logged Overtime: <strong className="text-slate-700 dark:text-slate-400">{hoveredStaff.overtime} hrs</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Award className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span>Top Volume: <strong className="text-slate-900 dark:text-white">Rahul Sharma</strong> (42 tasks completed)</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>91.4% Avg SLA Compliance</span>
        </div>
      </div>
    </div>
  );
}
