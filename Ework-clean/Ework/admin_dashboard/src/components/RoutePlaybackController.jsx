import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, FastForward, Navigation, MapPin, 
  Activity, Clock, Gauge, Shield, User, ChevronRight, Fuel, Building2, 
  CheckCircle2, X 
} from 'lucide-react';
import { ROUTE_HISTORY_DATA } from '../data/mockRouteHistory.js';
import { soundService } from '../utils/soundService.js';

export default function RoutePlaybackController({ 
  selectedEmployeeId = 'emp-3', 
  onSelectEmployee,
  currentIndex, 
  onIndexChange,
  isPlaying, 
  onTogglePlay,
  onClose,
  darkMode = false
}) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x
  const [showStopsList, setShowStopsList] = useState(false);

  const routeData = ROUTE_HISTORY_DATA[selectedEmployeeId] || ROUTE_HISTORY_DATA['emp-3'];
  const points = routeData.points;
  const currentPoint = points[currentIndex] || points[0];

  // Playback timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      onIndexChange(prev => {
        if (prev >= points.length - 1) {
          onTogglePlay(false);
          soundService.playSuccessChime();
          return points.length - 1;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, points.length, onIndexChange, onTogglePlay]);

  const progressPercent = Math.round((currentIndex / Math.max(points.length - 1, 1)) * 100);

  // Jump to specific stop
  const jumpToStop = (stop) => {
    const targetIdx = points.findIndex(p => p.stopId === stop.id || (p.lat === stop.lat && p.lng === stop.lng));
    if (targetIdx !== -1) {
      onIndexChange(targetIdx);
    }
  };

  const handleRewind = () => {
    onIndexChange(0);
    onTogglePlay(false);
  };

  return (
    <div className={`absolute bottom-3 left-3 right-3 z-[1000] backdrop-blur-md rounded-2xl shadow-2xl p-4 flex flex-col space-y-3 max-w-4xl mx-auto border transition-colors ${
      darkMode 
        ? 'bg-slate-900/95 border-slate-700/80 text-slate-100' 
        : 'bg-white/95 border-slate-300 text-slate-900 shadow-xl'
    }`}>
      
      {/* Top Row: Staff Switcher & Trip Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            darkMode ? 'bg-sky-500/20 border border-sky-500/30 text-sky-400' : 'bg-sky-100 text-sky-700 font-extrabold'
          }`}>
            {routeData.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>{routeData.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                darkMode ? 'bg-slate-800 text-sky-400 border-slate-700' : 'bg-slate-100 text-sky-700 border-slate-300 font-bold'
              }`}>
                {routeData.vehicle}
              </span>
            </div>
            <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
              Shift Route · {routeData.date} · {routeData.totalDistanceKm} km total
            </p>
          </div>
        </div>

        {/* Staff Toggle Pills & Close */}
        <div className="flex items-center space-x-2">
          {Object.keys(ROUTE_HISTORY_DATA).map(id => {
            const r = ROUTE_HISTORY_DATA[id];
            return (
              <button
                key={id}
                onClick={() => {
                  onSelectEmployee(id);
                  onIndexChange(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedEmployeeId === id
                    ? (darkMode ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm' : 'bg-sky-100 text-sky-800 border border-sky-300 font-bold shadow-xs')
                    : (darkMode ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950')
                }`}
              >
                {r.name.split(' ')[0]}
              </button>
            );
          })}

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ml-2 cursor-pointer transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
            title="Exit Route Playback"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center Row: Live Scrubber Needle & Telemetry */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-semibold">
            <Navigation className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className={`font-mono ${darkMode ? 'text-cyan-300' : 'text-cyan-700 font-bold'}`}>{currentPoint.time}</span>
            <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>|</span>
            <span className={`truncate max-w-xs ${darkMode ? 'text-slate-200' : 'text-slate-800 font-bold'}`}>{currentPoint.street}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className={`font-bold ${currentPoint.speed > 0 ? (darkMode ? 'text-emerald-400' : 'text-emerald-700 font-black') : (darkMode ? 'text-amber-400' : 'text-amber-700 font-black')}`}>
              {currentPoint.speed > 0 ? `🚗 ${currentPoint.speed} km/h` : '🛑 Stop / Idle'}
            </span>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600 font-bold'}>{progressPercent}%</span>
          </div>
        </div>

        {/* Scrub Slider with Speed Heatmap Background */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={points.length - 1}
            value={currentIndex}
            onChange={(e) => onIndexChange(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
              darkMode ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          />
        </div>

        {/* Speed Profile Sparkline Bar */}
        <div className="h-4 w-full flex items-end space-x-0.5 pt-0.5 opacity-80">
          {points.map((pt, idx) => {
            const h = Math.max(3, Math.round((pt.speed / (routeData.maxSpeedKmh || 60)) * 14));
            const isActive = idx <= currentIndex;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-xs transition-all ${
                  idx === currentIndex
                    ? 'bg-cyan-500 scale-y-125 shadow-sm shadow-cyan-400'
                    : isActive
                    ? 'bg-sky-600'
                    : (darkMode ? 'bg-slate-800' : 'bg-slate-200')
                }`}
                style={{ height: `${h}px` }}
                title={`${pt.time}: ${pt.speed} km/h (${pt.street})`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls: Playback buttons & Stop Markers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        
        {/* Play / Pause / Speed buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRewind}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Rewind to Start"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Play Route</span>
              </>
            )}
          </button>

          {/* Speed Multipliers */}
          <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-sky-500 text-white shadow-xs'
                    : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowStopsList(!showStopsList)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showStopsList
                ? (darkMode ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-sky-100 border-sky-400 text-sky-800')
                : (darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950')
            }`}
          >
            <span>{routeData.stops.length} Waypoints</span>
          </button>
        </div>

        {/* Summary Metric Badges */}
        <div className={`flex items-center space-x-3 text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
          <div>Avg: <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-950'}`}>{routeData.avgSpeedKmh} km/h</span></div>
          <div>Max: <span className={`font-bold ${darkMode ? 'text-amber-400' : 'text-amber-700 font-black'}`}>{routeData.maxSpeedKmh} km/h</span></div>
          <div>Idle: <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{routeData.idleDurationMin}m</span></div>
        </div>

      </div>

      {/* Accordion: Stops Breakdown */}
      {showStopsList && (
        <div className={`pt-2 border-t mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {routeData.stops.map((stop, i) => (
            <button
              key={stop.id}
              onClick={() => jumpToStop(stop)}
              className={`p-2.5 rounded-xl border text-left transition-all group cursor-pointer ${
                darkMode ? 'bg-slate-950/80 border-slate-800 hover:border-sky-500/40' : 'bg-slate-50 border-slate-200 hover:border-sky-400 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold truncate ${darkMode ? 'text-white group-hover:text-sky-300' : 'text-slate-950 group-hover:text-sky-700'}`}>
                  {i + 1}. {stop.name}
                </span>
                <span className={`text-[10px] font-mono ${darkMode ? 'text-cyan-400' : 'text-cyan-700 font-black'}`}>{stop.time}</span>
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {stop.notes}
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
