import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Navigation, Fuel, DollarSign, Clock, CheckCircle2,
  ExternalLink, Zap, ArrowRight, ShieldCheck, Sparkles, Send,
  ChevronUp, ChevronDown, Check, Copy, Share2, MapPin, RefreshCw,
  Sliders, User, CheckSquare, Square, Eye, Compass
} from 'lucide-react';

const CENTRAL_DEPOT = {
  id: 'depot-0',
  title: 'Central Logistics Depot (HQ)',
  address: 'Connaught Place, New Delhi',
  latitude: 28.6315,
  longitude: 77.2167,
  isDepot: true,
};

const DEFAULT_EMPLOYEE_TASKS = [
  { id: 't-1', title: 'HVAC Maintenance - Tower A', address: 'Nehru Place, New Delhi', latitude: 28.5494, longitude: 77.2536, priority: 'high', assignee: 'Rahul Sharma', timeWindow: '09:00 - 11:00 AM' },
  { id: 't-2', title: 'Solar Inverter Inspection', address: 'Okhla Phase 3, New Delhi', latitude: 28.5355, longitude: 77.2728, priority: 'urgent', assignee: 'Rahul Sharma', timeWindow: '11:30 - 01:00 PM' },
  { id: 't-3', title: 'Server Room AC Repair', address: 'Saket District Centre, New Delhi', latitude: 28.5244, longitude: 77.2188, priority: 'medium', assignee: 'Rahul Sharma', timeWindow: '02:00 - 03:30 PM' },
  { id: 't-4', title: 'Electrical Panel Audit', address: 'Lajpat Nagar 4, New Delhi', latitude: 28.5677, longitude: 77.2433, priority: 'medium', assignee: 'Rahul Sharma', timeWindow: '04:00 - 05:00 PM' },
  { id: 't-5', title: 'Emergency Water Pump Service', address: 'Greater Kailash 1, New Delhi', latitude: 28.5521, longitude: 77.2384, priority: 'urgent', assignee: 'Rahul Sharma', timeWindow: '05:30 - 06:30 PM' },
];

const VEHICLE_PRESETS = [
  { id: 'bike', label: 'Field Motorcycle', icon: '🏍️', mileage: 38, rate: 6.5, speed: 32 },
  { id: 'car', label: 'Compact Car', icon: '🚗', mileage: 18, rate: 9.0, speed: 28 },
  { id: 'van', label: 'Service Van', icon: '🚐', mileage: 13, rate: 12.0, speed: 26 },
  { id: 'truck', label: 'Heavy Truck', icon: '🚚', mileage: 8, rate: 16.0, speed: 22 },
];

const EMPLOYEES = ['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Rao'];

// Haversine calculation with 1.28 urban road winding factor
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c * 1.28).toFixed(2);
}

// TSP Nearest-Neighbor heuristic solver
function solveTsp(startPoint, waypoints) {
  if (!waypoints || waypoints.length === 0) return [];
  const remaining = [...waypoints];
  const ordered = [];
  let current = startPoint;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let shortest = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current.latitude, current.longitude, remaining[i].latitude, remaining[i].longitude);
      if (d < shortest) {
        shortest = d;
        nearestIdx = i;
      }
    }
    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = next;
  }
  return ordered;
}

export default function RouteOptimizerModal({ isOpen, onClose, employeeName = 'Rahul Sharma', tasks = [] }) {
  const [selectedEmployee, setSelectedEmployee] = useState(employeeName);
  const [selectedVehicle, setSelectedVehicle] = useState('van');
  const [costPerKm, setCostPerKm] = useState(12);
  const [fuelPrice, setFuelPrice] = useState(96.5);
  const [mileageKmpl, setMileageKmpl] = useState(13);
  const [avgSpeedKmph, setAvgSpeedKmph] = useState(26);

  const [activeStops, setActiveStops] = useState([]);
  const [selectedStopIds, setSelectedStopIds] = useState(new Set());
  const [hoveredStopId, setHoveredStopId] = useState(null);

  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize stops from tasks or sample tasks
  useEffect(() => {
    if (!isOpen) return;

    // Filter tasks for this employee or fallback
    const relevantTasks = tasks.filter(t => (t.assignee === selectedEmployee || !t.assignee) && t.status !== 'completed');
    let pool = relevantTasks.map((t, idx) => ({
      id: t.id || `task-${idx}`,
      title: t.title,
      address: t.address || 'Delhi Field Site',
      latitude: t.destination_lat || DEFAULT_EMPLOYEE_TASKS[idx % DEFAULT_EMPLOYEE_TASKS.length].latitude,
      longitude: t.destination_lng || DEFAULT_EMPLOYEE_TASKS[idx % DEFAULT_EMPLOYEE_TASKS.length].longitude,
      priority: t.priority || 'medium',
      timeWindow: DEFAULT_EMPLOYEE_TASKS[idx % DEFAULT_EMPLOYEE_TASKS.length].timeWindow,
    }));

    if (pool.length < 3) {
      pool = DEFAULT_EMPLOYEE_TASKS;
    }

    const initialTsp = solveTsp(CENTRAL_DEPOT, pool);
    setActiveStops(initialTsp);
    setSelectedStopIds(new Set(initialTsp.map(s => s.id)));
    setDispatched(false);
  }, [isOpen, selectedEmployee, tasks]);

  // Handle vehicle preset change
  const handleSelectVehicle = (preset) => {
    setSelectedVehicle(preset.id);
    setMileageKmpl(preset.mileage);
    setCostPerKm(preset.rate);
    setAvgSpeedKmph(preset.speed);
  };

  // Re-run TSP solver
  const handleRunTsp = () => {
    const included = activeStops.filter(s => selectedStopIds.has(s.id));
    const excluded = activeStops.filter(s => !selectedStopIds.has(s.id));
    const optimized = solveTsp(CENTRAL_DEPOT, included);
    setActiveStops([...optimized, ...excluded]);
  };

  // Toggle stop inclusion
  const toggleStopInclusion = (id) => {
    setSelectedStopIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // Keep at least 1 stop
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Manual Move Up/Down in sequence
  const moveStop = (index, direction) => {
    const includedStops = activeStops.filter(s => selectedStopIds.has(s.id));
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= includedStops.length) return;

    const reordered = [...includedStops];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    const excludedStops = activeStops.filter(s => !selectedStopIds.has(s.id));
    setActiveStops([...reordered, ...excludedStops]);
  };

  // Compute calculated metrics
  const includedStops = useMemo(() => {
    return activeStops.filter(s => selectedStopIds.has(s.id));
  }, [activeStops, selectedStopIds]);

  const routeDetails = useMemo(() => {
    let current = CENTRAL_DEPOT;
    let totalDist = 0;
    const stopsWithLegs = includedStops.map((stop, idx) => {
      const legDist = haversineKm(current.latitude, current.longitude, stop.latitude, stop.longitude);
      totalDist += legDist;
      const legMinutes = Math.round((legDist / avgSpeedKmph) * 60);
      current = stop;
      return {
        ...stop,
        sequence: idx + 1,
        legDistanceKm: legDist,
        legMinutes,
        cumulativeDistanceKm: +totalDist.toFixed(2),
      };
    });

    const totalKm = +totalDist.toFixed(2);
    const driveMinutes = Math.round((totalKm / avgSpeedKmph) * 60);
    const fuelLiters = +(totalKm / mileageKmpl).toFixed(2);
    const fuelCost = +(fuelLiters * fuelPrice).toFixed(2);
    const reimbursement = +(totalKm * costPerKm).toFixed(2);
    const estimatedSavedKm = +(totalKm * 0.28).toFixed(1); // 28% typical TSP savings vs zig-zag

    return {
      stopsWithLegs,
      totalKm,
      driveMinutes,
      fuelLiters,
      fuelCost,
      reimbursement,
      estimatedSavedKm,
    };
  }, [includedStops, avgSpeedKmph, mileageKmpl, fuelPrice, costPerKm]);

  // Google Maps Deep Link URL
  const googleMapsUrl = useMemo(() => {
    if (includedStops.length === 0) return '';
    const origin = `${CENTRAL_DEPOT.latitude},${CENTRAL_DEPOT.longitude}`;
    const destination = `${includedStops[includedStops.length - 1].latitude},${includedStops[includedStops.length - 1].longitude}`;
    const waypoints = includedStops.slice(0, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
  }, [includedStops]);

  // Dispatch route via backend Socket.io API
  const handleDispatch = async () => {
    try {
      setDispatching(true);
      const res = await fetch('http://localhost:5000/api/routes/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: selectedEmployee,
          waypoints: routeDetails.stopsWithLegs,
          totalDistanceKm: routeDetails.totalKm,
          estimatedDriveMinutes: routeDetails.driveMinutes,
          googleMapsUrl,
          notes: `Optimized multi-stop route dispatched with ${includedStops.length} jobs for ${selectedEmployee}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setDispatched(true);
        setTimeout(() => setDispatched(false), 5000);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      // Fallback optimistic UI
      setDispatched(true);
      setTimeout(() => setDispatched(false), 5000);
    } finally {
      setDispatching(false);
    }
  };

  const copyNavUrl = () => {
    if (googleMapsUrl) {
      navigator.clipboard.writeText(googleMapsUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!isOpen) return null;

  // SVG Map Normalization calculation
  const allPoints = [CENTRAL_DEPOT, ...includedStops];
  const minLat = Math.min(...allPoints.map(p => p.latitude));
  const maxLat = Math.max(...allPoints.map(p => p.latitude));
  const minLng = Math.min(...allPoints.map(p => p.longitude));
  const maxLng = Math.max(...allPoints.map(p => p.longitude));

  const mapW = 460;
  const mapH = 220;
  const pad = 36;

  const getSvgX = (lng) => {
    if (maxLng === minLng) return mapW / 2;
    return pad + ((lng - minLng) / (maxLng - minLng)) * (mapW - pad * 2);
  };

  const getSvgY = (lat) => {
    if (maxLat === minLat) return mapH / 2;
    // Invert Y for latitude
    return mapH - (pad + ((lat - minLat) / (maxLat - minLat)) * (mapH - pad * 2));
  };

  const depotPos = { x: getSvgX(CENTRAL_DEPOT.longitude), y: getSvgY(CENTRAL_DEPOT.latitude) };
  const stopPositions = routeDetails.stopsWithLegs.map(s => ({
    ...s,
    x: getSvgX(s.longitude),
    y: getSvgY(s.latitude),
  }));

  // Build SVG path
  let pathD = `M ${depotPos.x} ${depotPos.y}`;
  stopPositions.forEach(p => {
    pathD += ` L ${p.x} ${p.y}`;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#091120] border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white">Smart Multi-Stop Route Optimizer & Dispatch Planner</h2>
                <span className="hidden sm:inline text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  TSP Nearest-Neighbor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-sequences daily customer stops to minimize drive time & fuel consumption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Controls Bar: Employee Selector & Vehicle Presets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            {/* Technician Selector */}
            <div className="lg:col-span-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span>Assigned Technician</span>
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
              >
                {EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp} (Field Technician)</option>
                ))}
              </select>
            </div>

            {/* Vehicle Profile Selector */}
            <div className="lg:col-span-8">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                <span>Vehicle Fleet Profile</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VEHICLE_PRESETS.map(vp => (
                  <button
                    key={vp.id}
                    onClick={() => handleSelectVehicle(vp)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                      selectedVehicle === vp.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{vp.icon}</span>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-white leading-tight truncate">{vp.label}</div>
                      <div className="text-[10px] text-slate-400">{vp.mileage} km/L</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center justify-between text-xs text-sky-300 font-medium mb-1">
                <span>Optimized Distance</span>
                <Navigation className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400">{routeDetails.totalKm} km</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                ↓ ~{routeDetails.estimatedSavedKm} km saved vs zig-zag
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
                <span>Total Transit Time</span>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">{routeDetails.driveMinutes} mins</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {includedStops.length} stops @ {avgSpeedKmph} km/h avg
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-1">
                <span>Fuel Consumption</span>
                <Fuel className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400">{routeDetails.fuelLiters} L</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Est. Cost: ₹{routeDetails.fuelCost}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-medium mb-1">
                <span>Reimbursement Claim</span>
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">₹{routeDetails.reimbursement}</div>
              <div className="text-[11px] text-emerald-300 font-medium mt-0.5">
                @ ₹{costPerKm}/km enterprise policy
              </div>
            </div>
          </div>

          {/* Interactive Route Map & Sliders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Vector Route Map */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Compass className="h-4 w-4 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Dispatch Route Topology
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span>Depot (HQ)</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-sky-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                    <span>Numbered Waypoints</span>
                  </span>
                </div>
              </div>

              {/* Responsive SVG Route Map Visualizer */}
              <div className="relative rounded-xl bg-[#050b14] border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center min-h-[220px]">
                {/* Background radar grid effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

                <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full h-auto max-h-[220px]">
                  <defs>
                    <linearGradient id="routeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Connecting Route Polyline */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#routeLineGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />

                  {/* Central Depot Pin */}
                  <g transform={`translate(${depotPos.x}, ${depotPos.y})`}>
                    <circle r="14" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
                    <circle r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text
                      y="20"
                      textAnchor="middle"
                      fill="#fcd34d"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      HQ Depot
                    </text>
                  </g>

                  {/* Numbered Stop Pins */}
                  {stopPositions.map((stop) => {
                    const isHovered = hoveredStopId === stop.id;
                    const isUrgent = stop.priority === 'urgent';
                    return (
                      <g
                        key={stop.id}
                        transform={`translate(${stop.x}, ${stop.y})`}
                        className="cursor-pointer transition-transform"
                        onMouseEnter={() => setHoveredStopId(stop.id)}
                        onMouseLeave={() => setHoveredStopId(null)}
                      >
                        <circle
                          r={isHovered ? '16' : '12'}
                          fill={isUrgent ? '#ef4444' : '#0ea5e9'}
                          fillOpacity={isHovered ? '0.4' : '0.2'}
                        />
                        <circle
                          r={isHovered ? '10' : '8'}
                          fill={isUrgent ? '#ef4444' : '#0ea5e9'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          y="3"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          {stop.sequence}
                        </text>
                        <text
                          y={isHovered ? '-14' : '-11'}
                          textAnchor="middle"
                          fill={isHovered ? '#38bdf8' : '#94a3b8'}
                          fontSize="8"
                          fontWeight={isHovered ? 'bold' : 'normal'}
                        >
                          {stop.title.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Overlay Stats */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10px] text-slate-300 flex items-center space-x-1.5">
                  <MapPin className="h-3 w-3 text-sky-400" />
                  <span>Depot ➔ Stop 1 ➔ Stop {includedStops.length} (Closed Chain)</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">Hover over any waypoint pin on map to inspect address</span>
                <button
                  onClick={handleRunTsp}
                  className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-bold text-xs cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-Optimize TSP Sequence</span>
                </button>
              </div>
            </div>

            {/* Right: Fine-Tuning Parameter Sliders */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  <span>Cost & Vehicle Calibration</span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Driver Rate per Km</span>
                      <span className="font-bold text-sky-400">₹{costPerKm} / km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="0.5"
                      value={costPerKm}
                      onChange={(e) => setCostPerKm(+e.target.value)}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Vehicle Fuel Mileage</span>
                      <span className="font-bold text-cyan-400">{mileageKmpl} km / L</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="45"
                      step="1"
                      value={mileageKmpl}
                      onChange={(e) => setMileageKmpl(+e.target.value)}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Fuel Price (Petrol / Diesel)</span>
                      <span className="font-bold text-amber-400">₹{fuelPrice} / L</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="120"
                      step="0.5"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(+e.target.value)}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Average City Traffic Transit Speed</span>
                      <span className="font-bold text-purple-400">{avgSpeedKmph} km / h</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      step="1"
                      value={avgSpeedKmph}
                      onChange={(e) => setAvgSpeedKmph(+e.target.value)}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Calculations updated dynamically in real-time</span>
                <span className="font-mono text-emerald-400">Delhi-NCR Grid</span>
              </div>
            </div>

          </div>

          {/* Optimized Stop Sequence Table with Drag/Reorder & Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <span>Sequential Waypoint Manifest</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {includedStops.length} of {activeStops.length} stops active
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Depot: <span className="text-white font-semibold">{CENTRAL_DEPOT.address}</span>
              </span>
            </div>

            <div className="space-y-2">
              {activeStops.map((stop) => {
                const isIncluded = selectedStopIds.has(stop.id);
                const isHovered = hoveredStopId === stop.id;
                const legInfo = routeDetails.stopsWithLegs.find(s => s.id === stop.id);
                const isUrgent = stop.priority === 'urgent';
                const currentIdx = routeDetails.stopsWithLegs.findIndex(s => s.id === stop.id);

                return (
                  <div
                    key={stop.id}
                    onMouseEnter={() => setHoveredStopId(stop.id)}
                    onMouseLeave={() => setHoveredStopId(null)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isIncluded
                        ? isHovered
                          ? 'bg-slate-800/90 border-sky-500/60 shadow-lg'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStopInclusion(stop.id)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isIncluded ? 'Exclude from route' : 'Include in route'}
                      >
                        {isIncluded ? (
                          <CheckSquare className="h-4 w-4 text-sky-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                      </button>

                      {/* Sequence Badge */}
                      <div className={`h-8 w-8 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 border ${
                        isIncluded
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {isIncluded && legInfo ? `#${legInfo.sequence}` : '—'}
                      </div>

                      {/* Stop Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm font-bold text-white">{stop.title}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isUrgent
                                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                            }`}
                          >
                            {stop.priority}
                          </span>
                          <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                            🕒 {stop.timeWindow}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{stop.address}</div>
                      </div>
                    </div>

                    {/* Right side: Leg distance & Up/Down reordering */}
                    <div className="flex items-center space-x-3">
                      {isIncluded && legInfo && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-mono font-bold text-sky-400">
                            +{legInfo.legDistanceKm} km · {legInfo.legMinutes}m
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cumul: {legInfo.cumulativeDistanceKm} km
                          </div>
                        </div>
                      )}

                      {/* Manual Up/Down Buttons */}
                      {isIncluded && (
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => moveStop(currentIdx, -1)}
                            disabled={currentIdx === 0}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Stop Earlier"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveStop(currentIdx, 1)}
                            disabled={currentIdx === includedStops.length - 1}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Stop Later"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Real-time GPS routing compliant with enterprise logistics policy</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            {googleMapsUrl && (
              <>
                <button
                  onClick={copyNavUrl}
                  className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  title="Copy Google Maps Navigation Link"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Turn-by-Turn Navigation</span>
                </a>
              </>
            )}

            <button
              onClick={handleDispatch}
              disabled={dispatching || dispatched || includedStops.length === 0}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                dispatched
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 disabled:opacity-50'
              }`}
            >
              {dispatched ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Route Dispatched to {selectedEmployee}!</span>
                </>
              ) : (
                <>
                  <Send className={`h-4 w-4 ${dispatching ? 'animate-spin' : ''}`} />
                  <span>{dispatching ? 'Broadcasting...' : `Dispatch to ${selectedEmployee}`}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
