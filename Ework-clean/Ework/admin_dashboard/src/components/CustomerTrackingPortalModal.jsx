import React, { useState, useEffect, useRef } from 'react';
import {
  X, MapPin, Phone, MessageSquare, Star, ShieldCheck,
  Clock, Navigation, CheckCircle2, Copy, Check, ExternalLink,
  ChevronRight, Smartphone, AlertCircle, Sparkles, Award, UserCheck,
  Printer
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

// Simulated realistic street coordinates from depot towards Connaught Place, Delhi
const ROUTE_WAYPOINTS = [
  { lat: 28.6250, lng: 77.2080, eta: 14, dist: '2.8 km', speed: 28 },
  { lat: 28.6268, lng: 77.2105, eta: 11, dist: '2.1 km', speed: 32 },
  { lat: 28.6285, lng: 77.2130, eta: 8,  dist: '1.5 km', speed: 25 },
  { lat: 28.6300, lng: 77.2150, eta: 5,  dist: '0.8 km', speed: 18 },
  { lat: 28.6312, lng: 77.2165, eta: 2,  dist: '0.2 km', speed: 12 },
  { lat: 28.6318, lng: 77.2170, eta: 0,  dist: '0.0 km (Arrived)', speed: 0 },
];

export default function CustomerTrackingPortalModal({ isOpen, onClose, task }) {
  const [waypointIndex, setWaypointIndex] = useState(1);
  const [journeyStatus, setJourneyStatus] = useState('in_transit'); // 'in_transit' | 'arrived' | 'completed'
  const [deviceFrame, setDeviceFrame] = useState('mobile'); // 'mobile' | 'desktop'
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [customerComment, setCustomerComment] = useState('');
  const timerRef = useRef(null);

  // Auto-advance technician movement simulator along the street
  useEffect(() => {
    if (!isOpen || !task || journeyStatus !== 'in_transit') return;

    timerRef.current = setInterval(() => {
      setWaypointIndex(prev => {
        if (prev < ROUTE_WAYPOINTS.length - 1) {
          const next = prev + 1;
          if (next === ROUTE_WAYPOINTS.length - 1) {
            setJourneyStatus('arrived');
            soundService.playSuccessChime();
          }
          return next;
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, [isOpen, task, journeyStatus]);

  if (!isOpen || !task) return null;

  const otpCode = '4921';
  const technicianName = task.assignee || 'Rahul Sharma';
  const customerName = task.customer_name || 'Vikram Malhotra';
  const serviceTitle = task.title || 'HVAC Compressor Inspection #T-402';
  const destinationAddress = task.address || 'Connaught Place, Block B, New Delhi';

  const currentWp = ROUTE_WAYPOINTS[waypointIndex] || ROUTE_WAYPOINTS[0];

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleSimulateArrive = () => {
    setWaypointIndex(ROUTE_WAYPOINTS.length - 1);
    setJourneyStatus('arrived');
    soundService.playSuccessChime();
  };

  const handleSimulateComplete = () => {
    setWaypointIndex(ROUTE_WAYPOINTS.length - 1);
    setJourneyStatus('completed');
    soundService.playSuccessChime();
  };

  const handleReset = () => {
    setWaypointIndex(0);
    setJourneyStatus('in_transit');
    setRatingSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`relative bg-[#070e1b] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all duration-300 ${
        deviceFrame === 'mobile' ? 'w-full max-w-[440px] h-[92vh]' : 'w-full max-w-5xl h-[90vh]'
      }`}>
        
        {/* Top Control Bar (Admin / Simulator perspective) */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white">Live Customer Tracking Portal</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
              ework.app/t/{task.id?.toString().slice(-4) || '402'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setDeviceFrame('mobile')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  deviceFrame === 'mobile' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Mobile Viewport"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeviceFrame('desktop')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  deviceFrame === 'desktop' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Desktop Viewport"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Simulation Quick Triggers */}
            {journeyStatus === 'in_transit' && (
              <button
                onClick={handleSimulateArrive}
                className="px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 text-[10px] font-bold transition-all cursor-pointer"
              >
                Simulate Arrival
              </button>
            )}

            {journeyStatus === 'arrived' && (
              <button
                onClick={handleSimulateComplete}
                className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-bold transition-all cursor-pointer"
              >
                Simulate Job Done
              </button>
            )}

            {journeyStatus === 'completed' && (
              <button
                onClick={handleReset}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
              >
                Restart Demo
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Portal Body (Emulating Customer View) */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#050b14] text-white">

          {/* Customer Header Branding */}
          <div className="p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
                E
              </div>
              <div>
                <div className="text-xs font-black tracking-wide text-white uppercase flex items-center space-x-1.5">
                  <span>Ework Service Portal</span>
                  <span className="text-[9px] px-1.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">LIVE</span>
                </div>
                <div className="text-[10px] text-slate-400">Order #{task.id?.toString().slice(-4) || 'T-402'} • {serviceTitle}</div>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                journeyStatus === 'in_transit' ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' :
                journeyStatus === 'arrived' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {journeyStatus === 'in_transit' ? '🚗 Technician In Route' :
                 journeyStatus === 'arrived' ? '📍 Arrived At Your Site' :
                 '✓ Work Completed'}
              </span>
            </div>
          </div>

          {/* SIMULATED LIVE GPS MAP VIEW */}
          <div className="relative h-64 sm:h-72 w-full bg-[#081220] overflow-hidden border-b border-slate-800">
            {/* Realistic Dark Map Graphic (SVG Vectors) */}
            <svg className="w-full h-full object-cover opacity-80" viewBox="0 0 600 350" preserveAspectRatio="none">
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#081220" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Background Glow */}
              <rect width="600" height="350" fill="#060c18" />
              <circle cx="450" cy="180" r="180" fill="url(#mapGlow)" />

              {/* City Street Grid Lines */}
              <g stroke="#1e293b" strokeWidth="1.5" strokeOpacity="0.7">
                <line x1="0" y1="60" x2="600" y2="60" />
                <line x1="0" y1="140" x2="600" y2="140" />
                <line x1="0" y1="220" x2="600" y2="220" />
                <line x1="0" y1="300" x2="600" y2="300" />

                <line x1="80" y1="0" x2="80" y2="350" />
                <line x1="180" y1="0" x2="180" y2="350" />
                <line x1="300" y1="0" x2="300" y2="350" />
                <line x1="420" y1="0" x2="420" y2="350" />
                <line x1="530" y1="0" x2="530" y2="350" />

                {/* Diagonal Boulevards */}
                <line x1="40" y1="340" x2="360" y2="20" stroke="#334155" strokeWidth="2.5" />
                <line x1="200" y1="340" x2="560" y2="40" stroke="#334155" strokeWidth="3" />
              </g>

              {/* Roundabout (Connaught Place Inner Circle) */}
              <circle cx="460" cy="180" r="55" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
              <circle cx="460" cy="180" r="75" stroke="#334155" strokeWidth="2" fill="none" />

              {/* Route Trajectory Polyline */}
              <path
                d="M 120 280 Q 220 250 300 210 T 460 180"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 4"
              />

              {/* Destination Pin (Customer Home) */}
              <g transform="translate(460, 180)">
                <circle r="18" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="12" fill="#10b981" />
                <circle r="4" fill="#ffffff" />
                <text x="16" y="4" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  YOUR SITE
                </text>
              </g>

              {/* Moving Vehicle Pin (Rahul Sharma) */}
              {(() => {
                const fraction = waypointIndex / (ROUTE_WAYPOINTS.length - 1);
                // Linear interpolate between start (120, 280) and end (460, 180)
                const curX = 120 + (460 - 120) * fraction;
                const curY = 280 + (180 - 280) * fraction;

                return (
                  <g transform={`translate(${curX}, ${curY})`}>
                    <circle r="22" fill="#0ea5e9" fillOpacity="0.25" className="animate-pulse" />
                    <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                    <text x="0" y="4" textAnchor="middle" fontSize="10">🚗</text>
                  </g>
                );
              })()}
            </svg>

            {/* Live ETA Card Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-xl flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
                <Navigation className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Arrival</div>
                <div className="text-sm font-black text-white flex items-center space-x-1.5">
                  <span>{currentWp.eta > 0 ? `${currentWp.eta} Minutes` : 'Technician Arrived!'}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">({currentWp.dist})</span>
                </div>
              </div>
            </div>

            {/* Live Speed Watermark */}
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-300">
              <span className="text-emerald-400 font-bold">● GPS LOCKED</span> • {currentWp.speed} km/h • ±3m
            </div>
          </div>

          {/* CONTENT DETAILS SECTION */}
          <div className="p-4 sm:p-5 space-y-4">

            {/* 1. SECURITY ARRIVAL OTP BOX */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center space-x-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Entry Security Verification PIN</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Share this 4-digit PIN with <strong className="text-white">{technicianName}</strong> only upon arrival.
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-xl font-mono font-black text-sky-300 tracking-widest">
                  {otpCode}
                </div>
                <button
                  onClick={handleCopyOtp}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedOtp ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 2. TECHNICIAN PROFILE & CREDENTIALS */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt={technicianName}
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-sky-500/50 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{technicianName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center space-x-0.5">
                      <Star className="h-2.5 w-2.5 fill-amber-300" />
                      <span>4.9 (342 jobs)</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Senior HVAC & Electrical Systems Engineer</div>
                  <div className="flex items-center space-x-2 text-[10px] text-emerald-400 mt-1">
                    <span className="flex items-center space-x-0.5"><ShieldCheck className="h-3 w-3" /><span>ID #T-882 Verified</span></span>
                    <span>•</span>
                    <span className="text-slate-400">Vehicle: DL-3C-AZ-9912</span>
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowCallModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Rahul</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Opening WhatsApp direct chat with Rahul Sharma (+91 98112-40912)...`)}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>

            {/* 3. STEP-BY-STEP SERVICE TIMELINE */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Work Order Status Timeline
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: 'Work Order Confirmed & Scheduled', time: '09:00 AM', done: true },
                  { title: `Assigned to ${technicianName}`, time: '09:12 AM', done: true },
                  {
                    title: 'Technician En Route with GPS Tracking',
                    time: '09:20 AM',
                    done: journeyStatus !== 'in_transit' || waypointIndex > 0,
                    active: journeyStatus === 'in_transit'
                  },
                  {
                    title: 'On-Site Diagnostic & Repair Work',
                    time: journeyStatus === 'in_transit' ? 'Pending' : 'In Progress',
                    done: journeyStatus === 'completed',
                    active: journeyStatus === 'arrived'
                  },
                  {
                    title: 'Customer Sign-off & Digital Certificate',
                    time: journeyStatus === 'completed' ? '11:02 AM' : 'Pending',
                    done: journeyStatus === 'completed'
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      step.done
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : step.active
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-600 border border-slate-700'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${step.done || step.active ? 'text-white' : 'text-slate-500'}`}>
                        {step.title}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {step.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. COMPLETED JOB REVIEW & RATING (WHEN COMPLETED) */}
            {journeyStatus === 'completed' && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">How was your service with Rahul?</div>
                      <div className="text-[10px] text-slate-400">Rate your experience to complete the work order.</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCustomerRating(s)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star className={`h-5 w-5 ${s <= customerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {!ratingSubmitted ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerComment}
                      onChange={e => setCustomerComment(e.target.value)}
                      placeholder="Add any feedback for Rahul (optional)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playSuccessChime();
                        setRatingSubmitted(true);
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Submit Customer Rating
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
                    ✓ Thank you for rating! Rating of {customerRating}★ saved.
                  </div>
                )}
              </div>
            )}

            {/* Destination Address Card */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-400">
              <MapPin className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Service Destination:</span> {destinationAddress}
              </div>
            </div>

          </div>

          {/* Footer Branding */}
          <div className="p-3 bg-slate-950 border-t border-slate-900 text-center text-[10px] text-slate-600">
            Powered by Ework Real-Time Workforce Dispatched Platform • Encrypted & Geofenced
          </div>

        </div>

      </div>

      {/* Simulated Phone Call Dialog */}
      {showCallModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
              <Phone className="h-8 w-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Calling {technicianName}...</div>
              <div className="text-xs text-slate-400 mt-0.5">+91 98112-40912</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-mono">Simulated VoIP Call Connected</div>
            </div>
            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
