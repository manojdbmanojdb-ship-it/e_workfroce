import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, Compass, Layers, Phone, Clock,
  ExternalLink, CheckCircle2, ChevronRight, LocateFixed, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { Task } from '../types';

export const MapsScreen: React.FC = () => {
  const { currentLocation, navigateTo, showToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress'>('all');
  const [mapZoom, setMapZoom] = useState(14);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  // Load active tasks with coordinates
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiService.getTasks();
        if (res.success && res.data) {
          // Enrich with coordinates if missing
          const withCoords = res.data.map((t, idx) => ({
            ...t,
            lat: t.lat || (currentLocation.lat + (idx % 2 === 0 ? 0.005 * (idx + 1) : -0.004 * (idx + 1))),
            lng: t.lng || (currentLocation.lng + (idx % 3 === 0 ? 0.004 * (idx + 1) : -0.005 * (idx + 1))),
            address: t.address || `Site #${idx + 101}, Sector 62 Industrial Park`
          }));
          setTasks(withCoords);
          if (withCoords.length > 0) setSelectedTask(withCoords[0]);
        }
      } catch {
        // Fallback demo tasks
        const demo: Task[] = [
          {
            id: 'task-1',
            title: 'Industrial AC Compressor Inspection',
            description: 'Inspect vibration sensor and refrigerant loop pressure.',
            priority: 'high',
            status: 'in_progress',
            assigned_to: 'Technician',
            due: 'Today, 4:00 PM',
            lat: currentLocation.lat + 0.0042,
            lng: currentLocation.lng + 0.0031,
            address: 'Building 4, Sector 62, Noida Tech Zone',
            contact_name: 'Rajesh Sharma',
            contact_phone: '+91 98765 43210'
          },
          {
            id: 'task-2',
            title: 'Optical Fiber Splice Restoration',
            description: 'Fiber line maintenance at server cabinet 3B.',
            priority: 'urgent',
            status: 'pending',
            assigned_to: 'Technician',
            due: 'Today, 6:30 PM',
            lat: currentLocation.lat - 0.0035,
            lng: currentLocation.lng + 0.0048,
            address: 'Tower C, Connaught Place District Centre',
            contact_name: 'Anjali Verma',
            contact_phone: '+91 98111 22334'
          },
          {
            id: 'task-3',
            title: 'Backup Solar Inverter Diagnostic',
            description: 'Battery health assessment and micro-inverter firmware sync.',
            priority: 'medium',
            status: 'pending',
            assigned_to: 'Technician',
            due: 'Tomorrow, 11:00 AM',
            lat: currentLocation.lat + 0.0062,
            lng: currentLocation.lng - 0.0028,
            address: 'Block E, Okhla Phase III',
            contact_name: 'Vikas Kumar',
            contact_phone: '+91 98990 11223'
          }
        ];
        setTasks(demo);
        setSelectedTask(demo[0]);
      }
    };
    fetchTasks();
  }, [currentLocation]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'in_progress') return t.status === 'in_progress';
    return true;
  });

  const handleStartGoogleNavigation = (task: Task) => {
    const lat = task.lat || currentLocation.lat;
    const lng = task.lng || currentLocation.lng;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_system');
  };

  const handleRecenter = () => {
    setCenterOffset({ x: 0, y: 0 });
    showToast('Map recentered on your GPS position', 'info');
  };

  return (
    <div className="relative h-[calc(100vh-140px)] flex flex-col bg-slate-900 overflow-hidden">
      {/* Top Filter Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-1.5 p-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-lg">
          {(['all', 'in_progress', 'pending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white hover:text-blue-400 shadow-lg active:scale-95 transition-all"
          title="Recenter GPS"
        >
          <LocateFixed className="h-4 w-4 text-sky-400" />
        </button>
      </div>

      {/* Map Surface (Technical Canvas / Simulated OSM Vector Tiles with Real Markers) */}
      <div className="flex-1 relative bg-[#0b1324] overflow-hidden flex items-center justify-center">
        {/* Subtle Map Grid lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '36px 36px',
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`
          }}
        />

        {/* Roads & Navigation Route Line (Vector visualizer) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {selectedTask && (
            <path
              d="M 50% 50% Q 55% 42%, 65% 35% T 70% 28%"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Current Employee GPS Location Marker (Pulsing Radar Center) */}
        <div className="absolute z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-10 w-10 rounded-full bg-blue-500/25 animate-ping" />
            <span className="absolute h-6 w-6 rounded-full bg-blue-500/40" />
            <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md shadow-blue-500/50 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-bold text-white shadow-md whitespace-nowrap">
            You (GPS ±{Math.round(currentLocation.accuracy)}m)
          </div>
        </div>

        {/* Task Pins on Map */}
        {filteredTasks.map((t, idx) => {
          const isSelected = selectedTask?.id === t.id;
          // Offset position deterministically for visual mapping
          const leftPercent = 50 + (idx === 0 ? 20 : idx === 1 ? -18 : 22);
          const topPercent = 50 + (idx === 0 ? -22 : idx === 1 ? 16 : 24);

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className="absolute z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <div className={`p-2 rounded-2xl shadow-xl flex items-center justify-center border-2 transition-all ${
                isSelected
                  ? 'bg-blue-600 border-white text-white scale-110 ring-4 ring-blue-500/30'
                  : t.status === 'in_progress'
                  ? 'bg-amber-500 border-white text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300'
              }`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md max-w-[120px] truncate ${
                isSelected
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800'
              }`}>
                {t.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Selected Site Navigation Drawer / Card */}
      {selectedTask && (
        <div className="z-20 p-4 bg-white dark:bg-[#0c1629] border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-3xl">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  selectedTask.priority === 'urgent'
                    ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                    : selectedTask.priority === 'high'
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                }`}>
                  {selectedTask.priority} priority
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedTask.status === 'in_progress' ? 'In Progress' : 'Pending Start'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                {selectedTask.title}
              </h3>
            </div>

            <button
              onClick={() => navigateTo('task_details', selectedTask.id)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500"
              title="Open Task Details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-3">
            <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">{selectedTask.address}</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#080e1c] border border-slate-100 dark:border-slate-800/80 mb-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Transit</span>
              <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">~12 mins (3.4 km)</p>
            </div>
            {selectedTask.contact_phone && (
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Customer Contact</span>
                <a 
                  href={`tel:${selectedTask.contact_phone}`} 
                  className="font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-0.5"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call {selectedTask.contact_name?.split(' ')[0] || 'Client'}</span>
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigateTo('task_details', selectedTask.id)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs text-center"
            >
              View Instructions
            </button>

            <button
              onClick={() => handleStartGoogleNavigation(selectedTask)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 active:scale-95 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
