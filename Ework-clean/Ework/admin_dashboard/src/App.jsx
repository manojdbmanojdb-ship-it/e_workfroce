import React, { useState, useEffect } from 'react';
import {
  Navigation, MapPin, CheckSquare, Users, Clock,
  Receipt, Wrench, Calendar, MessageSquare, BarChart2,
  AlertTriangle, ChevronRight, Sparkles, Smartphone,
  Activity, Wifi, WifiOff, Camera, X, Play, ShieldAlert,
  LogOut, User, Database, ShieldCheck, CheckCircle2,
  ArrowRight, FileText, Briefcase, Sun, Moon, Building, Menu,
  QrCode, Download
} from 'lucide-react';
import { io } from 'socket.io-client';

// Page components
import TasksBoard from './pages/TasksBoard.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import ShiftsPage from './pages/ShiftsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import InteractiveMap from './components/InteractiveMap.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { soundService } from './utils/soundService.js';
import GeofenceAuditFeed from './components/GeofenceAuditFeed.jsx';
import OfflineSyncInspectorModal from './components/OfflineSyncInspectorModal.jsx';
import { offlineSyncEngine } from './utils/offlineSyncEngine.js';
import RoutePlaybackController from './components/RoutePlaybackController.jsx';
import DatabaseUserInspectorModal from './components/DatabaseUserInspectorModal.jsx';

// Homepage Redesign Components (Clean Minimal Header, Footer, Resource Modals)
import HomepageHeader from './components/HomepageHeader.jsx';
import HomepageFooter from './components/HomepageFooter.jsx';
import HomepageResourceModal from './components/HomepageResourceModal.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import UniversalMobileHeader from './components/UniversalMobileHeader.jsx';
import UniversalMobileBottomNav from './components/UniversalMobileBottomNav.jsx';
import UniversalMobileDrawer from './components/UniversalMobileDrawer.jsx';
import { generateQRMatrix } from './utils/qrCode.js';

// SaaS Subscription, Payments, Organization Onboarding & Super Admin Modals
import SubscriptionSelectionModal from './components/SubscriptionSelectionModal.jsx';
import PaymentCheckoutModal from './components/PaymentCheckoutModal.jsx';
import OrganizationRegistrationModal from './components/OrganizationRegistrationModal.jsx';
import SuperAdminDashboardModal from './components/SuperAdminDashboardModal.jsx';
import UpgradePlanModal from './components/UpgradePlanModal.jsx';

// Dedicated Employee Portal Components
import EmployeeLayout from './employee/EmployeeLayout.jsx';
import EmployeeDashboard from './employee/EmployeeDashboard.jsx';
import EmployeeTasksPage from './employee/EmployeeTasksPage.jsx';
import EmployeeAttendancePage from './employee/EmployeeAttendancePage.jsx';
import EmployeePerformancePage from './employee/EmployeePerformancePage.jsx';
import EmployeeNotificationsPage from './employee/EmployeeNotificationsPage.jsx';
import EmployeeMessagesPage from './employee/EmployeeMessagesPage.jsx';
import EmployeeProfilePage from './employee/EmployeeProfilePage.jsx';

// Role-based authorization checker
function isManagerUser(user) {
  if (!user || !user.role) return false;
  const r = user.role.toLowerCase();
  return r.includes('manager') || r.includes('admin') || r.includes('director') || r.includes('dispatcher');
}

const INITIAL_STAFF = [
  { id: 'emp-1', name: 'Rahul Sharma', role: 'Technician', status: 'At Site', location: 'Connaught Place, Delhi', battery: 88, speed: 0, lat: 28.6318, lng: 77.2170, routeTrail: [[28.6312, 77.2165], [28.6315, 77.2168], [28.6318, 77.2170]], task: 'HVAC Maintenance #T-402', source: 'hardware' },
  { id: 'emp-2', name: 'Priya Patel', role: 'Sales Executive', status: 'At Site', location: 'Connaught Place, Delhi', battery: 64, speed: 0, lat: 28.6312, lng: 77.2163, routeTrail: [[28.6308, 77.2160], [28.6312, 77.2163]], task: 'Client Presentation #C-118', source: 'hardware' },
  { id: 'emp-3', name: 'Amit Verma', role: 'Delivery Agent', status: 'In Transit', location: 'Inner Circle Road', battery: 95, speed: 32, lat: 28.6335, lng: 77.2195, routeTrail: [[28.6320, 77.2180], [28.6328, 77.2188], [28.6335, 77.2195]], task: 'Express Dropoff #D-891', source: 'simulated' },
  { id: 'emp-4', name: 'Sneha Rao', role: 'Site Inspector', status: 'Completed', location: 'Barakhamba Road', battery: 42, speed: 0, lat: 28.6305, lng: 77.2155, routeTrail: [[28.6300, 77.2150], [28.6305, 77.2155]], task: 'Safety Audit #A-552', source: 'simulated' },
];

const NAV_ITEMS = [
  { key: 'live', label: 'Live Tracking', icon: Activity },
  { key: 'tasks', label: 'Tasks Board', icon: CheckSquare },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'shifts', label: 'Shifts & Roster', icon: Calendar },
  { key: 'chat', label: 'Team Chat', icon: MessageSquare },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'assets', label: 'Assets', icon: Wrench },
  { key: 'reports', label: 'Reports', icon: BarChart2 },
];

function LandingPage({ onEnter, onEnterManager, onEnterEmployee, onGetStarted, onOpenResourceModal, onSelectPlan }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const handleDefaultEnter = onEnter || onEnterManager || onEnterEmployee;
  
  // Direct mobile download URL resolution
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const directApkPath = '/downloads/eworkforce-mobile.apk';
  const mobileLanUrl = host === 'localhost' || host === '127.0.0.1' 
    ? `http://192.168.1.7:5173${directApkPath}` 
    : `${protocol}//${host}${port}${directApkPath}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(mobileLanUrl)}`;
  const qrMatrix = React.useMemo(() => {
    return generateQRMatrix(mobileLanUrl, 3);
  }, [mobileLanUrl]);
  return (
    <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-12 pb-20 max-w-5xl mx-auto w-full">
      <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full border border-sky-300 dark:border-sky-500/30 bg-sky-50/90 dark:bg-sky-950/40 backdrop-blur-md mb-8 shadow-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">Live GPS</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-[11px] font-semibold tracking-wider text-sky-700 dark:text-sky-300 uppercase">Proof of Work</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-[11px] font-semibold tracking-wider text-sky-700 dark:text-sky-300 uppercase">Real-Time Accountability</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-[10px] font-mono tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-transparent px-1.5 py-0.5 rounded shadow-xs">DUAL PORTAL SAAS</span>
      </div>

      {/* Hero Headline */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-display tracking-tight uppercase leading-[0.95] max-w-4xl select-none my-4">
        <span className="energetic-silver-line-1 block">FIELD EMPLOYEE</span>
        <span className="font-display uppercase tracking-wide energetic-silver-line-2 block text-4xl sm:text-6xl md:text-7xl my-1.5">
          TRACKING &amp; WORKFORCE
        </span>
        <span className="tracking-wide energetic-silver-line-3 block">MANAGEMENT</span>
      </h1>

      <h2 className="mt-5 text-sm sm:text-base font-black tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase">
        SEPARATE MANAGER &amp; EMPLOYEE PORTALS
      </h2>

      <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
        Complete enterprise field tracking suite: Dispatch managers plan routes &amp; verify proof-of-work; field employees track tasks, log GPS attendance &amp; view productivity.
      </p>

      {/* Clear Hero Calls to Action */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none">
        <button
          onClick={onGetStarted || handleDefaultEnter}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onEnterManager || handleDefaultEnter}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-slate-800 hover:border-blue-500/60 text-slate-800 dark:text-white font-bold text-sm shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center space-x-2"
        >
          <Building className="h-4 w-4 text-blue-500" />
          <span>Manager Console</span>
        </button>

        <button
          onClick={onEnterEmployee || handleDefaultEnter}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <Smartphone className="h-4 w-4 text-emerald-500" />
          <span>Employee Portal</span>
        </button>
      </div>

      {/* Trust & Guarantee Indicators */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>No credit card required</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          <span>Free plan forever up to 5 technicians</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>Instant setup in under 60 seconds</span>
        </span>
      </div>

      {/* Bento Capabilities Grid (Section #features - Hallmark Anti-AI Slop Bento Architecture) */}
      <section id="features" className="mt-20 w-full text-left scroll-mt-24">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              // 01. PLATFORM CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-slate-950 dark:text-white mt-1.5">
              Enterprise Field Tracking Suite
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Architected for high-density field dispatch, verified tamper-proof proof of work, and uninterrupted offline synchronization.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Card 1: Live Route & GPS Radar Dispatch (Spans 2 columns) */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Real-Time Telemetry</span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Live Route &amp; GPS Radar Dispatch</h3>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>4 Nodes Streaming</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Continuous breadcrumb tracking with live travel speed gauges, device battery monitoring, automated mileage calculation, and historical turn-by-turn playback.
              </p>
            </div>

            {/* Embedded Telemetry Preview Terminal */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070c16] border border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                <span className="text-blue-500 font-bold">LAT/LNG:</span>
                <span className="tabular-nums">28.6318° N, 77.2170° E</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline text-slate-500">SPEED: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">42 km/h</strong></span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                WebSocket Gateway :5000
              </span>
            </div>
          </div>

          {/* Card 2: Geofenced Attendance */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Perimeter Lock</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">Geofenced Attendance</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Check-ins strictly validated within 150m perimeter boundaries. Cryptographically blocks mock locations and simulated spoofing.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Boundary Enforcement</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Active ✓</span>
            </div>
          </div>

          {/* Card 3: Tamper-Proof Proof of Work */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">SHA-256 Audit</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">Proof of Work &amp; Signatures</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Capture timestamped geo-tagged before/after photos, customer digital signatures, and immediate SLA quality rating certificates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Verification Stamp</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">SHA-256</span>
            </div>
          </div>

          {/* Card 4: Offline-First Synchronization Engine (Spans 2 columns) */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <WifiOff className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Network Resilient</span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Offline-First Engine &amp; Auto-Sync</h3>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span>IndexedDB Local Buffer</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Zero signal in basements, underground hubs, or transit corridors? Staff log check-ins, tasks, and receipts completely offline with automated retry queues upon reconnection.
              </p>
            </div>

            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070c16] border border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px] flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Offline Queue: <strong className="text-emerald-500">0 Pending</strong></span>
              <span className="text-slate-500 text-[10px]">Auto-Sync Heartbeat Active</span>
            </div>
          </div>

          {/* Card 5: Emergency SOS Beacon */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 hover:border-red-500/50 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Worker Safety</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">Emergency SOS Panic Beacon</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                One-touch panic beacon dispatches high-priority GPS coordinates, acoustic alerts, and dispatcher notifications to all supervisors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Dispatcher Safeguard</span>
              <span className="font-bold text-red-600 dark:text-red-400">24/7 Monitored</span>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Industry Section (Section #solutions) */}
      <section id="solutions" className="mt-28 w-full scroll-mt-24 text-left">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-sky-500 uppercase">Tailored Operations</span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-slate-900 dark:text-white mt-1.5">Solutions for Every Field Team</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From technical field maintenance to high-volume delivery, E-Workforce delivers verified operational certainty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[
            {
              icon: Wrench,
              title: 'Field Service & HVAC Maintenance',
              badge: 'Site Operations',
              desc: 'Automate job scheduling with customer address directions, checklist verification, on-site spare parts usage, and instant digital sign-offs.',
              benefits: ['150m site boundary check-in', 'Customer rating & feedback', 'Digital signature capture']
            },
            {
              icon: Activity,
              title: 'Logistics & Express Dispatch',
              badge: 'Fleet & Transit',
              desc: 'Monitor driver route trails, travel speeds, and arrival milestones with tamper-proof geofenced delivery receipts and photo verification.',
              benefits: ['Turn-by-turn route history', 'Live speeding alerts', 'Automated mileage logs']
            },
            {
              icon: ShieldCheck,
              title: 'Facilities, Safety & Quality Auditing',
              badge: 'Compliance',
              desc: 'Equip quality inspectors with structured inspection forms, immutable timestamped photo evidence, and instant manager sign-off certificates.',
              benefits: ['Cryptographic SHA-256 hash', 'Pre-configured audit checklists', 'PDF certificate generation']
            },
            {
              icon: Users,
              title: 'Security Patrol & Perimeter Guarding',
              badge: 'Guard Services',
              desc: 'Verify regular checkpoint sweeps with real-time GPS telemetry, device battery monitoring, and one-touch emergency panic SOS beaconing.',
              benefits: ['Panic SOS alerting', 'Device battery tracking', 'Offline checkpoint logging']
            }
          ].map(({ icon: Icon, title, badge, desc, benefits }) => (
            <div key={title} className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (Section #how-it-works) */}
      <section id="how-it-works" className="mt-28 w-full scroll-mt-24 text-left">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase">Streamlined Workflow</span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-slate-900 dark:text-white mt-1.5">How E-Workforce Works in 3 Steps</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A frictionless loop from task dispatching to field sign-off and automated manager verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            {
              step: '01',
              title: 'Dispatch & Perimeter Setup',
              desc: 'Managers dispatch tasks with target addresses, SLA deadlines, and authorized virtual GPS geofence zones from the live operations console.'
            },
            {
              step: '02',
              title: 'Field Execution & Offline Sync',
              desc: 'Technicians check in within boundary, accept tasks, work seamlessly in offline signal blackouts, and collect digital sign-offs.'
            },
            {
              step: '03',
              title: 'Verified Proof & Automated Payroll',
              desc: 'Customer signatures and photos generate cryptographic certificates. Worked hours and mileage sync directly to manager payroll.'
            }
          ].map(({ step, title, desc }) => (
            <div key={step} className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all relative">
              <div className="text-5xl sm:text-6xl font-display tracking-tight text-slate-200 dark:text-slate-800 mb-2">{step}</div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section (Section #pricing) */}
      <section id="pricing" className="mt-28 w-full scroll-mt-24 text-left">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Simple &amp; Transparent</span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-slate-900 dark:text-white mt-1.5">Predictable Plans for Any Fleet</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            No surprise overages or per-event billing. Start free or scale with our enterprise SLA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Starter Plan */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
              <div className="mt-3 flex items-baseline space-x-1">
                <span className="text-4xl sm:text-5xl font-display tracking-tight text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Perfect for evaluating field tracking and testing small crews.</p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {['Up to 5 Field Technicians', 'Live GPS Tracking Map', 'Offline-First Task Caching', 'Employee & Manager Web Portals', 'SQLite Database & PWA'].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan ? onSelectPlan('free') : (onGetStarted || handleDefaultEnter)()}
              className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Professional Plan (Featured) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50 dark:from-blue-950/60 via-white dark:via-slate-900/90 to-blue-50/50 dark:to-slate-950/90 border-2 border-blue-500 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">Professional</span>
              <div className="mt-3 flex items-baseline space-x-1">
                <span className="text-4xl sm:text-5xl font-display tracking-tight text-slate-900 dark:text-white">$19</span>
                <span className="text-xs text-slate-500">/ user / month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Complete enterprise field management suite with geofenced proof.</p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {[
                  'Unlimited Field Personnel',
                  '150m Geofenced Shift Punches',
                  'Turn-by-Turn Route Playback',
                  'Customer Digital Signature & Photos',
                  'Emergency SOS Panic Alerts',
                  'Priority 24/7 Email & Phone Support'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan ? onSelectPlan('professional') : (onGetStarted || handleDefaultEnter)()}
              className="mt-8 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Choose Professional Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise</span>
              <div className="mt-3 flex items-baseline space-x-1">
                <span className="text-4xl sm:text-5xl font-display tracking-tight text-slate-900 dark:text-white uppercase">Custom</span>
                <span className="text-xs text-slate-500">/ tailored SLA</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">For large distributed operations requiring custom integration.</p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {[
                  'Dedicated Private VPC / On-Premise',
                  'White-Label Flutter Mobile Builds',
                  '99.98% Platform Uptime SLA',
                  'Dedicated Solutions Architect',
                  'Custom ERP / SAP Payroll Connectors'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan ? onSelectPlan('enterprise') : (onOpenResourceModal && onOpenResourceModal('contact'))}
              className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Choose Enterprise Plan
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Application Download Section (Section #mobile-app) - Professional Minimalist Card */}
      <section id="mobile-app" className="mt-24 w-full scroll-mt-24 text-center">
        <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-400/25 text-xs font-mono font-bold uppercase tracking-wider">
                <Smartphone className="h-3.5 w-3.5" />
                <span>E-WorkForce for Android</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                Download Mobile App
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                Scan with your phone camera or click below to download the Android APK.
              </p>
            </div>

            {/* Clickable & Scannable QR Code */}
            <a
              href={directApkPath}
              download="eworkforce-mobile.apk"
              title="Click or scan to download E-WorkForce APK"
              className="bg-white p-4 rounded-2xl border-2 border-slate-200 inline-block shadow-lg hover:border-blue-500 hover:scale-[1.02] transition-all cursor-pointer group"
            >
              {qrMatrix ? (
                <svg
                  className="w-48 h-48 mx-auto block"
                  viewBox={`0 0 ${qrMatrix.size} ${qrMatrix.size}`}
                  shapeRendering="crispEdges"
                >
                  <rect width={qrMatrix.size} height={qrMatrix.size} fill="#ffffff" />
                  {qrMatrix.modules.map(({ x, y }, i) => (
                    <rect key={i} x={x} y={y} width="1" height="1" fill="#0f172a" />
                  ))}
                </svg>
              ) : (
                <img
                  src={qrApiUrl}
                  alt="Scan to download E-WorkForce APK"
                  className="w-48 h-48 mx-auto object-contain rounded-xl"
                />
              )}
            </a>

            {/* Primary Download Button */}
            <div className="w-full max-w-sm pt-1">
              <a
                href={directApkPath}
                download="eworkforce-mobile.apk"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2.5 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download eworkforce-mobile.apk</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LiveTrackingView({ onTriggerSos, sosAlerts, darkMode = false }) {
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [activeRightTab, setActiveRightTab] = useState('roster'); // 'roster' | 'audit'
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoTrack, setAutoTrack] = useState(false);
  const [activeSocket, setActiveSocket] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastPacketTime, setLastPacketTime] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('Just now');
  const [showSosSafeguard, setShowSosSafeguard] = useState(false);

  // Turn-by-Turn Route History Playback State
  const [playbackMode, setPlaybackMode] = useState(false);
  const [playbackEmployeeId, setPlaybackEmployeeId] = useState('emp-3');
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Connect to live WebSocket
  useEffect(() => {
    const socket = io('http://localhost:5000');
    setActiveSocket(socket);

    socket.on('connect', () => {
      setWsConnected(true);
      setLastPacketTime(new Date());
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    // Handle incoming live location broadcast
    socket.on('employee_moved', (payload) => {
      setLastPacketTime(new Date());
      setStaffList(prev => prev.map(s => {
        if (s.id === payload.userId || s.name === payload.name) {
          const newLat = payload.latitude || payload.lat || s.lat;
          const newLng = payload.longitude || payload.lng || s.lng;
          const newTrail = [...(s.routeTrail || [[s.lat, s.lng]]), [newLat, newLng]].slice(-35);
          return {
            ...s,
            lat: newLat,
            lng: newLng,
            routeTrail: newTrail,
            speed: payload.speed !== undefined ? payload.speed : s.speed,
            battery: payload.battery !== undefined ? payload.battery : s.battery,
            status: payload.status || s.status,
            source: payload.source || (payload.isSimulated ? 'simulated' : 'hardware')
          };
        }
        return s;
      }));
    });

    return () => socket.disconnect();
  }, []);

  // Update relative time ago string
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastPacketTime) return;
      const diffSec = Math.floor((new Date() - lastPacketTime) / 1000);
      if (diffSec < 5) setTimeAgo('Just now');
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastPacketTime]);

  // Simulator step for GPS coordinates along realistic street path
  const triggerSimulatedMovement = () => {
    setIsSimulating(true);
    setLastPacketTime(new Date());
    setStaffList(prev => prev.map(s => {
      const deltaLat = (Math.random() - 0.49) * 0.0006;
      const deltaLng = (Math.random() - 0.49) * 0.0006;
      const newLat = +(s.lat + deltaLat).toFixed(5);
      const newLng = +(s.lng + deltaLng).toFixed(5);
      const newSpeed = s.status === 'In Transit' ? Math.floor(25 + Math.random() * 25) : 0;
      const newTrail = [...(s.routeTrail || [[s.lat, s.lng]]), [newLat, newLng]].slice(-35);

      // Distance to Delhi HQ (28.6315, 77.2167)
      const dLat = (newLat - 28.6315) * 111000;
      const dLng = (newLng - 77.2167) * 111000 * Math.cos(28.6315 * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      const isWithin = dist <= 150;
      const newStatus = isWithin ? (s.status === 'Completed' ? 'Completed' : 'At Site') : 'In Transit';

      // Broadcast move to websocket
      if (activeSocket) {
        activeSocket.emit('update_location', {
          userId: s.id,
          name: s.name,
          lat: newLat,
          lng: newLng,
          speed: newSpeed,
          battery: s.battery,
          status: newStatus,
          isSimulated: true
        });
      }

      return {
        ...s,
        lat: newLat,
        lng: newLng,
        routeTrail: newTrail,
        speed: newSpeed,
        status: newStatus,
        source: 'simulated',
        battery: Math.max(15, s.battery - (Math.random() > 0.85 ? 1 : 0))
      };
    }));

    setTimeout(() => setIsSimulating(false), 400);
  };

  // Auto-track interval
  useEffect(() => {
    if (!autoTrack) return;
    const interval = setInterval(() => {
      triggerSimulatedMovement();
    }, 2500);
    return () => clearInterval(interval);
  }, [autoTrack, activeSocket]);

  return (
    <div className={`flex-1 flex flex-col p-4 sm:p-6 max-w-[1720px] mx-auto w-full transition-colors ${
      darkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Top Dispatch Command Header: Title & Subtitle on Left, Controls & KPI Badges in Unified Header Row */}
      <div className={`flex flex-col 2xl:flex-row 2xl:items-center justify-between pb-4 border-b gap-4 transition-colors ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="min-w-0">
          <h1 className={`text-2xl sm:text-4xl font-display uppercase tracking-wide ${
            darkMode ? 'text-white' : 'text-slate-950'
          }`}>
            Operations Dispatch &amp; Live Tracking
          </h1>
          <p className={`text-xs sm:text-sm font-semibold mt-1 ${
            darkMode ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Real-time GPS status of field workforce streaming across active site perimeters
          </p>
        </div>

        {/* Live Operational Controls & KPI Badges (Unified with Header) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Mode Switcher: Live Stream vs Route Playback */}
          <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
            darkMode 
              ? 'bg-slate-950/80 border-slate-700/80' 
              : 'bg-slate-100 border-slate-300 shadow-xs'
          }`}>
            <button
              onClick={() => {
                setPlaybackMode(false);
                setIsPlaying(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !playbackMode
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-black'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Live Radar</span>
            </button>
            <button
              onClick={() => {
                setPlaybackMode(true);
                setIsPlaying(true);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                playbackMode
                  ? (darkMode ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black' : 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black')
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Route Playback</span>
            </button>
          </div>

          {!playbackMode ? (
            <>
              {/* Auto-Track Loop Button */}
              <button
                onClick={() => setAutoTrack(!autoTrack)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  autoTrack
                    ? (darkMode 
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20' 
                        : 'bg-emerald-100 border-emerald-500 text-emerald-800 font-extrabold shadow-xs')
                    : (darkMode 
                        ? 'bg-slate-950/60 border-slate-700/80 hover:bg-slate-800 text-slate-300' 
                        : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold')
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${autoTrack ? 'bg-emerald-500 animate-ping' : (darkMode ? 'bg-slate-400' : 'bg-slate-500')}`}></span>
                <span>{autoTrack ? 'Auto-GPS: Streaming' : 'Auto-GPS: Paused'}</span>
              </button>

              {/* Single Step Tick Button */}
              <button
                onClick={triggerSimulatedMovement}
                disabled={isSimulating}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  darkMode
                    ? 'bg-slate-950/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <Play className={`h-3.5 w-3.5 text-sky-500 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Simulate Step</span>
              </button>
            </>
          ) : (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              darkMode 
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' 
                : 'bg-cyan-50 border-cyan-300 text-cyan-800 shadow-xs'
            }`}>
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span>Replay Scrubber Active</span>
            </div>
          )}

          {/* Active Field Staff Counter Card */}
          <div className={`px-3.5 py-1.5 rounded-xl border text-center shadow-xs transition-all ${
            darkMode 
              ? 'bg-slate-900/90 border-slate-800' 
              : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-400' : 'text-slate-600 font-bold'
            }`}>
              Active Field Staff
            </div>
            <div className={`text-base sm:text-lg font-display tracking-tight flex items-center justify-center space-x-1.5 tabular-nums ${
              darkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{staffList.length} Online</span>
            </div>
          </div>

          {/* SOS Status Counter Card */}
          <div className={`px-3.5 py-1.5 rounded-xl border text-center shadow-xs transition-all ${
            sosAlerts.length > 0
              ? (darkMode ? 'bg-red-950/60 border-red-500/50 text-red-400 animate-pulse' : 'bg-red-100 border-red-400 text-red-800 animate-pulse')
              : (darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-700')
          }`}>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${
              sosAlerts.length > 0 ? (darkMode ? 'text-red-400 font-extrabold' : 'text-red-700 font-extrabold') : (darkMode ? 'text-slate-400' : 'text-slate-600 font-bold')
            }`}>
              SOS Status
            </div>
            <div className={`text-base sm:text-lg font-display tracking-tight flex items-center justify-center space-x-1.5 tabular-nums ${
              sosAlerts.length > 0 
                ? (darkMode ? 'text-red-400' : 'text-red-700') 
                : (darkMode ? 'text-slate-300' : 'text-slate-900')
            }`}>
              <span className={`h-2 w-2 rounded-full ${sosAlerts.length > 0 ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`}></span>
              <span>{sosAlerts.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time GPS Telemetry & Gateway Sub-Bar */}
      <div className={`mt-3 p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white border-slate-300 text-slate-800'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-950'}`}>
            {wsConnected ? 'Gateway: Connected' : 'Gateway: Connecting...'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px]">
          <span className={`flex items-center space-x-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Updated: <strong className={`font-mono tabular-nums ${darkMode ? 'text-slate-200' : 'text-slate-950 font-bold'}`}>{timeAgo}</strong></span>
          </span>

          <span className={darkMode ? 'text-slate-700' : 'text-slate-300'}>|</span>

          <div className="flex items-center space-x-1.5">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              darkMode 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              <span>📡 Hardware</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold">
                {staffList.filter(s => s.source === 'hardware').length}
              </span>
            </span>

            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              darkMode 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <span>⚡ Sim</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-mono font-bold">
                {staffList.filter(s => s.source !== 'hardware').length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Active SOS Alert Banner */}
      {sosAlerts.length > 0 && (
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">CRITICAL EMERGENCY SOS ACTIVE ({sosAlerts.length})</div>
              <div className="text-[11px] text-red-100 font-medium">Field panic beacon triggered at Connaught Place Zone. Emergency responders & supervisors alerted.</div>
            </div>
          </div>
          <button
            onClick={() => onTriggerSos && onTriggerSos('clear')}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer flex-shrink-0 ml-2"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Grid: Map (2 Cols) + Personnel Panel (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5 flex-1">
        {/* Map / Radar Panel */}
        <div className={`lg:col-span-2 flex flex-col rounded-2xl border overflow-hidden relative shadow-sm ${
          darkMode 
            ? 'bg-slate-900/60 border-slate-800/80 shadow-2xl' 
            : 'bg-white border-slate-300'
        }`}>
          <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between ${
            darkMode 
              ? 'bg-slate-900/90 border-slate-800' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className={`text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-200' : 'text-slate-950 font-black'
              }`}>
                {playbackMode ? 'Turn-by-Turn Route History Playback' : 'Interactive GPS Radar & Geofence Zones'}
              </span>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold shadow-xs ${
              darkMode 
                ? 'bg-slate-800 text-slate-300 border-slate-700' 
                : 'bg-white text-slate-800 border-slate-300'
            }`}>
              {playbackMode ? 'Historical GPS Trajectory' : '150m Perimeter Zone Active'}
            </span>
          </div>

          <div className={`relative flex-1 min-h-[480px] lg:min-h-[540px] overflow-hidden flex flex-col ${
            darkMode ? 'bg-[#071322]' : 'bg-slate-100'
          }`}>
            <InteractiveMap 
              staffList={staffList} 
              playbackMode={playbackMode}
              playbackEmployeeId={playbackEmployeeId}
              playbackIndex={playbackIndex}
              darkMode={darkMode}
            />

            {/* Playback Controls Overlay */}
            {playbackMode && (
              <RoutePlaybackController
                selectedEmployeeId={playbackEmployeeId}
                onSelectEmployee={(id) => {
                  setPlaybackEmployeeId(id);
                  setPlaybackIndex(0);
                }}
                currentIndex={playbackIndex}
                onIndexChange={setPlaybackIndex}
                isPlaying={isPlaying}
                onTogglePlay={setIsPlaying}
                onClose={() => {
                  setPlaybackMode(false);
                  setIsPlaying(false);
                }}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>

        {/* Live Personnel Roster & Security Audit Stream Panel */}
        <div className={`flex flex-col rounded-2xl border p-4 shadow-sm ${
          darkMode 
            ? 'bg-slate-900/60 border-slate-800/80' 
            : 'bg-white border-slate-300'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className={`flex items-center space-x-1.5 p-1 rounded-xl border ${
              darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveRightTab('roster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRightTab === 'roster'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                Staff ({staffList.length})
              </button>
              <button
                onClick={() => setActiveRightTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeRightTab === 'audit'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Audit Stream</span>
              </button>
            </div>

            <span className={`text-[10px] font-mono font-bold ${
              darkMode ? 'text-slate-500' : 'text-slate-600'
            }`}>
              Live Telemetry
            </span>
          </div>

          {activeRightTab === 'roster' ? (
            <>
              <div className="space-y-3 mt-4 overflow-y-auto flex-1 pr-1">
                {staffList.map(staff => (
                  <div 
                    key={staff.id} 
                    className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
                      darkMode 
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-sky-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center text-xs ${
                          darkMode ? 'bg-sky-500/15 text-sky-400' : 'bg-sky-100 text-sky-700 font-extrabold'
                        }`}>
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                            {staff.name}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {staff.role}
                            </span>
                            <span className={darkMode ? 'text-slate-700' : 'text-slate-300'}>•</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              staff.source === 'hardware'
                                ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold')
                                : (darkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-900 border border-amber-300 font-bold')
                            }`}>
                              {staff.source === 'hardware' ? '📡 Hardware' : '⚡ Sim'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        staff.status === 'At Site' || staff.status === 'On Task'
                          ? (darkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                          : staff.status === 'In Transit'
                          ? (darkMode ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-sky-100 text-sky-800 border border-sky-300')
                          : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800')
                      }`}>
                        {staff.status}
                      </span>
                    </div>

                    <div className={`text-[11px] font-medium flex items-center justify-between mt-1 ${
                      darkMode ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      <div className="flex items-center space-x-1.5 truncate">
                        <MapPin className={`h-3 w-3 flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`} />
                        <span className="truncate">{staff.location}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-black ml-2 flex-shrink-0 ${
                        darkMode ? 'text-sky-400' : 'text-sky-700'
                      }`}>
                        {staff.speed > 0 ? `🚗 ${staff.speed} km/h` : '🚶 Static'}
                      </span>
                    </div>
                    <div className={`text-[10px] font-mono mt-0.5 ${
                      darkMode ? 'text-slate-500' : 'text-slate-500 font-semibold'
                    }`}>
                      {staff.lat?.toFixed(4)}°N, {staff.lng?.toFixed(4)}°E
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t text-[10px] mt-2 gap-2 ${
                      darkMode ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      <span className={`truncate font-bold flex-1 ${
                        darkMode ? 'text-slate-300' : 'text-slate-900'
                      }`} title={staff.task}>
                        📋 {staff.task}
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`font-mono font-bold ${
                          darkMode ? 'text-emerald-400' : 'text-emerald-700 font-black'
                        }`}>
                          🔋 {staff.battery}%
                        </span>
                        <button
                          onClick={() => {
                            setPlaybackEmployeeId(staff.id === 'emp-1' ? 'emp-1' : 'emp-3');
                            setPlaybackIndex(0);
                            setPlaybackMode(true);
                            setIsPlaying(true);
                          }}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                            darkMode 
                              ? 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-400' 
                              : 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-800'
                          }`}
                          title="Replay Route Trajectory"
                        >
                          <Clock className="h-2.5 w-2.5" />
                          <span>Replay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 pt-3 border-t flex gap-2 ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  onClick={triggerSimulatedMovement}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" /><span>Ping Location Update</span>
                </button>
                <button
                  onClick={() => setShowSosSafeguard(true)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    darkMode
                      ? 'bg-red-600/15 hover:bg-red-600/25 text-red-400 border-red-500/30'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                  }`}
                  title="Test Emergency SOS Beacon"
                >
                  <AlertTriangle className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 mt-3 overflow-hidden flex flex-col">
              <GeofenceAuditFeed darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>

      {/* Emergency SOS Safeguard Confirmation Modal */}
      {showSosSafeguard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1322] border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-white">
            <div className="h-12 w-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white">
              Trigger Emergency SOS Test?
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
              This safeguard ensures sirens and emergency broadcasts are never triggered by mistake. Confirming this action transmits high-priority telemetry to all dispatchers on duty.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowSosSafeguard(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSosSafeguard(false);
                  onTriggerSos();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm Trigger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ework_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [view, setView] = useState(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/employee')) return 'employee';
    if (path.startsWith('/manager') || path === '/dashboard') return 'dashboard';
    if (path === '/login') return 'login';
    return 'landing';
  });
  const [activePage, setActivePage] = useState('live'); // Manager tabs
  const [activeEmployeeTab, setActiveEmployeeTab] = useState(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.startsWith('/employee')) {
      const parts = path.split('/').filter(Boolean);
      return parts[1] || 'dashboard';
    }
    return 'dashboard';
  });
  const [loginInitialPortal, setLoginInitialPortal] = useState('employee'); // 'manager' | 'employee'
  const [loginInitialAuthMode, setLoginInitialAuthMode] = useState('sign_in'); // 'sign_in' | 'register'
  const [resourceModalType, setResourceModalType] = useState(null); // 'privacy' | 'terms' | 'documentation' | 'help' | 'contact' | 'careers'
  const [accessDeniedMsg, setAccessDeniedMsg] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showGlobalSosConfirm, setShowGlobalSosConfirm] = useState(false);
  const [managerDrawerOpen, setManagerDrawerOpen] = useState(false);

  // Detect Capacitor native mobile environment
  const isNativeApp = typeof window !== 'undefined' && Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.Capacitor?.getPlatform() === 'android' ||
    window.Capacitor?.getPlatform() === 'ios'
  );

  // SaaS Freemium & Paid Subscription Flow States
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState('professional');
  const [showOrgRegModal, setShowOrgRegModal] = useState(false);
  const [orgRegInitialPlan, setOrgRegInitialPlan] = useState('free');
  const [orgRegPrefill, setOrgRegPrefill] = useState({
    licenseKey: '',
    orgName: '',
    email: '',
    managerName: ''
  });
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [orgSubscription, setOrgSubscription] = useState(null);

  // Fetch live organization subscription and employee limits
  const fetchOrgSubscription = async (orgId) => {
    try {
      const res = await fetch(`/api/subscriptions/organization-status/${orgId}`);
      const data = await res.json();
      if (data.success) {
        setOrgSubscription({
          organization: data.organization,
          subscription: data.subscription,
          activeStaffCount: data.activeStaffCount,
          employeeLimit: data.employeeLimit,
          isLimitReached: data.isLimitReached,
          isExpired: data.isExpired
        });
      }
    } catch (err) {
      console.warn('Failed to fetch org subscription:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.organization_id) {
      fetchOrgSubscription(currentUser.organization_id);
    } else {
      setOrgSubscription(null);
    }
  }, [currentUser]);

  // Global Theme Management (Persisted in localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ework_theme');
    if (saved) return saved === 'dark';
    return false; // Default to light mode for the SaaS homepage, or user preference
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ework_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ework_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  // Sync user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ework_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ework_user');
      }
    } catch (e) {
      console.warn('Unable to persist session to localStorage', e);
    }
  }, [currentUser]);

  // Native Android Capacitor Back-Button Handling
  useEffect(() => {
    let unlisten = null;
    const initNativeBack = async () => {
      try {
        const CapApp = window.Capacitor?.Plugins?.App;
        if (CapApp && typeof CapApp.addListener === 'function') {
          const listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
            if (managerDrawerOpen) {
              setManagerDrawerOpen(false);
            } else if (showGlobalSosConfirm) {
              setShowGlobalSosConfirm(false);
            } else if (showSubscriptionModal) {
              setShowSubscriptionModal(false);
            } else if (showCheckoutModal) {
              setShowCheckoutModal(false);
            } else if (showOrgRegModal) {
              setShowOrgRegModal(false);
            } else if (showUpgradeModal) {
              setShowUpgradeModal(false);
            } else if (view === 'login') {
              setView('landing');
            } else if (view === 'dashboard' && activePage !== 'live') {
              setActivePage('live');
            } else if (view === 'employee' && activeEmployeeTab !== 'dashboard') {
              setActiveEmployeeTab('dashboard');
            } else if (canGoBack) {
              window.history.back();
            } else if (typeof CapApp.exitApp === 'function') {
              CapApp.exitApp();
            }
          });
          unlisten = listener;
        }
      } catch (_) {}
    };
    initNativeBack();

    return () => {
      if (unlisten?.remove) unlisten.remove();
    };
  }, [managerDrawerOpen, showGlobalSosConfirm, showSubscriptionModal, showCheckoutModal, showOrgRegModal, showUpgradeModal, view, activePage, activeEmployeeTab]);

  // Synchronize browser URL with portal and routes
  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname;
      if (path.startsWith('/employee')) {
        const parts = path.split('/').filter(Boolean);
        const sub = parts[1] || 'dashboard';
        setActiveEmployeeTab(sub);
        if (currentUser) {
          setView('employee');
        } else {
          setLoginInitialPortal('employee');
          setView('login');
        }
      } else if (path.startsWith('/manager') || path === '/dashboard') {
        if (currentUser) {
          if (isManagerUser(currentUser)) {
            setView('dashboard');
          } else {
            // RBAC Enforcement: Strict prevention of employee accessing manager-only routes
            setAccessDeniedMsg('Access Denied: You do not have permissions to access Manager Console routes.');
            setView('employee');
            setActiveEmployeeTab('dashboard');
            window.history.replaceState(null, '', '/employee/dashboard');
          }
        } else {
          setLoginInitialPortal('manager');
          setView('login');
        }
      } else if (path === '/login') {
        if (currentUser) {
          if (isManagerUser(currentUser)) {
            setView('dashboard');
            window.history.replaceState(null, '', '/dashboard');
          } else {
            setView('employee');
            setActiveEmployeeTab('dashboard');
            window.history.replaceState(null, '', '/employee/dashboard');
          }
        } else {
          setView('login');
        }
      } else if (path === '/' || path === '') {
        setView('landing');
      }
    };

    window.addEventListener('popstate', handleRouteSync);
    handleRouteSync();
    return () => window.removeEventListener('popstate', handleRouteSync);
  }, [currentUser]);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallModal(true);
    }
  };

  // Offline Sync & Network Simulator State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(offlineSyncEngine.getPendingCount());
  const [networkCondition, setNetworkCondition] = useState(offlineSyncEngine.getNetworkCondition());
  const [liveSyncToast, setLiveSyncToast] = useState(null);

  // Auto-dismiss liveSyncToast after 4.5 seconds
  useEffect(() => {
    if (!liveSyncToast) return;
    const timer = setTimeout(() => {
      setLiveSyncToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [liveSyncToast]);

  // Listen for real-time two-way synchronization broadcasts from backend & mobile app
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('sos_alert', (alert) => {
      setSosAlerts(prev => [alert, ...prev]);
      soundService.playSosSiren();
      setLiveSyncToast({
        title: 'EMERGENCY SOS ALERT',
        message: alert.message || 'Panic alarm received from mobile field unit',
        type: 'danger'
      });
    });

    socket.on('employee_checked_in', (payload) => {
      soundService.playSuccessChime();
      setLiveSyncToast({
        title: 'Mobile Check-In Verified',
        message: `Field technician checked in at site (${payload.method || 'GPS Geofenced'})`,
        type: 'success'
      });
    });

    socket.on('employee_checked_out', (payload) => {
      setLiveSyncToast({
        title: 'Mobile Check-Out Recorded',
        message: `Shift ended. Overtime computed: ${payload.overtimeMinutes || 0} mins`,
        type: 'info'
      });
    });

    socket.on('task_proof_submitted', (payload) => {
      soundService.playSuccessChime();
      setLiveSyncToast({
        title: 'Proof-of-Work Received',
        message: `Customer sign-off & photos received for Task #${payload.id?.toString().slice(-4) || 'T-402'}`,
        type: 'success'
      });
    });

    socket.on('task_created', (payload) => {
      setLiveSyncToast({
        title: 'New Task Dispatched',
        message: `"${payload.title}" assigned to field staff`,
        type: 'info'
      });
    });

    socket.on('task_updated', (payload) => {
      setLiveSyncToast({
        title: 'Task Status Updated',
        message: `Task #${payload.id?.toString().slice(-4) || ''} changed to ${payload.status?.replace('_', ' ')}`,
        type: 'info'
      });
    });

    socket.on('route_dispatched', (payload) => {
      soundService.playSuccessChime();
      setLiveSyncToast({
        title: 'Optimized Route Dispatched',
        message: `${payload.waypoints?.length || 0} stops dispatched to ${payload.employeeName} (${payload.totalDistanceKm} km)`,
        type: 'success'
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleTriggerSos = async (action) => {
    if (action === 'clear') {
      setSosAlerts([]);
      return;
    }
    try {
      soundService.playSosSiren();
      const res = await fetch('http://localhost:5000/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000000',
          lat: 28.6315,
          lng: 77.2167,
          message: 'EMERGENCY: Field staff pressed SOS button in Connaught Place'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSosAlerts(prev => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'live': return <LiveTrackingView onTriggerSos={handleTriggerSos} sosAlerts={sosAlerts} darkMode={darkMode} />;
      case 'tasks': return <TasksBoard darkMode={darkMode} />;
      case 'attendance': return <AttendancePage darkMode={darkMode} />;
      case 'shifts': return <ShiftsPage darkMode={darkMode} />;
      case 'chat': return <ChatPage darkMode={darkMode} />;
      case 'expenses': return <ExpensesPage darkMode={darkMode} />;
      case 'assets': return <AssetsPage darkMode={darkMode} />;
      case 'reports': return <ReportsPage darkMode={darkMode} />;
      default: return <LiveTrackingView onTriggerSos={handleTriggerSos} sosAlerts={sosAlerts} darkMode={darkMode} />;
    }
  };

  const handleLoginSuccess = (user, portalMode) => {
    try {
      localStorage.setItem('ework_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not store session in localStorage', e);
    }
    setCurrentUser(user);
    if (isManagerUser(user)) {
      if (portalMode === 'employee') {
        window.history.pushState(null, '', '/employee/dashboard');
        setView('employee');
        setActiveEmployeeTab('dashboard');
      } else {
        window.history.pushState(null, '', '/dashboard');
        setView('dashboard');
      }
    } else {
      window.history.pushState(null, '', '/employee/dashboard');
      setView('employee');
      setActiveEmployeeTab('dashboard');
    }
  };

  if (view === 'login') {
    return (
      <LoginPage
        initialPortal={loginInitialPortal}
        initialAuthMode={loginInitialAuthMode}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => {
          setView('landing');
          window.history.pushState(null, '', '/');
        }}
        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
      />
    );
  }

  // -------------------------------------------------------------
  // DEDICATED EMPLOYEE WEB PORTAL (Role Scoped & Isolated UI/UX)
  // -------------------------------------------------------------
  if (view === 'employee') {
    return (
      <EmployeeLayout
        currentUser={currentUser}
        activeTab={activeEmployeeTab}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onTabChange={(tab) => {
          setActiveEmployeeTab(tab);
          window.history.pushState(null, '', `/employee/${tab}`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          setView('landing');
          window.history.pushState(null, '', '/');
        }}
        onSwitchToManager={isManagerUser(currentUser) ? () => {
          setView('dashboard');
          window.history.pushState(null, '', '/dashboard');
        } : null}
      >
        {accessDeniedMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4" />
              <span>{accessDeniedMsg}</span>
            </div>
            <button onClick={() => setAccessDeniedMsg(null)} className="p-1 cursor-pointer hover:opacity-75">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeEmployeeTab === 'dashboard' && (
          <EmployeeDashboard
            currentUser={currentUser}
            darkMode={darkMode}
            onNavigate={(tab) => {
              setActiveEmployeeTab(tab);
              window.history.pushState(null, '', `/employee/${tab}`);
            }}
          />
        )}
        {activeEmployeeTab === 'tasks' && <EmployeeTasksPage currentUser={currentUser} darkMode={darkMode} />}
        {activeEmployeeTab === 'attendance' && <EmployeeAttendancePage currentUser={currentUser} darkMode={darkMode} />}
        {activeEmployeeTab === 'performance' && <EmployeePerformancePage currentUser={currentUser} darkMode={darkMode} />}
        {activeEmployeeTab === 'notifications' && <EmployeeNotificationsPage currentUser={currentUser} darkMode={darkMode} />}
        {activeEmployeeTab === 'messages' && <EmployeeMessagesPage currentUser={currentUser} darkMode={darkMode} />}
        {activeEmployeeTab === 'profile' && (
          <EmployeeProfilePage
            currentUser={currentUser}
            darkMode={darkMode}
            onProfileUpdated={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
          />
        )}
      </EmployeeLayout>
    );
  }

  // RBAC Guard: If employee attempts to access manager console, redirect immediately
  if (view === 'dashboard' && currentUser && !isManagerUser(currentUser)) {
    setView('employee');
    setActiveEmployeeTab('dashboard');
    window.history.replaceState(null, '', '/employee/dashboard');
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'bg-[#050b14] text-slate-100 constellation-bg' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header: Clean Minimal White/Light Header for Homepage (Desktop only, mobile app home uses dedicated branded header) */}
      {view === 'landing' ? (
        !isNativeApp && (
          <div className="hidden lg:block">
            <HomepageHeader
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
              onLoginClick={() => {
                setLoginInitialPortal('employee');
                setLoginInitialAuthMode('sign_in');
                setView('login');
                window.history.pushState(null, '', '/login');
              }}
              onSignUpClick={() => {
                setShowSubscriptionModal(true);
              }}
              onGetStartedClick={() => {
                setShowSubscriptionModal(true);
              }}
              onOpenResourceModal={(type) => setResourceModalType(type)}
            />
          </div>
        )
      ) : (
        <>
          {/* Universal Responsive Mobile Header (Phone / Tablet < lg) */}
          <UniversalMobileHeader
            portalType="manager"
            currentUser={currentUser}
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
            onOpenDrawer={() => setManagerDrawerOpen(prev => !prev)}
            drawerOpen={managerDrawerOpen}
            unreadCount={sosAlerts.length}
            onOpenNotifications={() => {
              if (sosAlerts.length > 0) setShowGlobalSosConfirm(true);
              else setManagerDrawerOpen(true);
            }}
            onOpenSync={() => setShowSyncModal(true)}
            networkCondition={networkCondition}
            onLogoClick={() => setView('landing')}
          />

          {/* Desktop Manager Header (Only on lg screens and up, 100% preserved) */}
          <header className={`hidden lg:flex sticky top-0 z-50 backdrop-blur-md px-6 py-3.5 items-center justify-between border-b transition-colors ${
            darkMode
              ? 'bg-[#080c14]/90 border-slate-800/80 text-white'
              : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-sm'
          }`}>
          <div className="flex items-center space-x-2.5">
            {view === 'dashboard' && (
              <button
                onClick={() => setManagerDrawerOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                aria-label="Toggle Operations Navigation Menu"
                title="Toggle Navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center cursor-pointer select-none py-0.5" onClick={() => setView('landing')}>
              <img 
                src={darkMode ? "/logo-dark.png?v=3" : "/logo.png?v=3"} 
                alt="E-WorkForce" 
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {sosAlerts.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/50 text-red-400 text-xs font-bold animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{sosAlerts.length} EMERGENCY ALERT(S)</span>
                <button onClick={() => setSosAlerts([])} className="ml-1 hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
              </div>
            )}

            {isStandalone && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Standalone App</span>
              </span>
            )}

            {/* Theme Toggle Button */}
            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />

            {/* Super Admin Console Button */}
            {(currentUser?.role === 'Super Admin' || currentUser?.email === 'superadmin@ework.com') && (
              <button
                onClick={() => setShowSuperAdminModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-500/25 cursor-pointer transition-all"
                title="Open Super Admin Management Dashboard"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Super Admin Console</span>
              </button>
            )}

            {/* Organization Plan Badge & Upgrade Button */}
            {orgSubscription && (
              <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <Building className="h-3.5 w-3.5 text-sky-500" />
                <span className="max-w-[120px] truncate font-bold">
                  {orgSubscription.organization?.name || 'My Organization'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  orgSubscription.subscription?.plan === 'free'
                    ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                    : orgSubscription.subscription?.plan === 'enterprise'
                    ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30'
                    : 'bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30'
                }`}>
                  {orgSubscription.subscription?.plan || 'Free'} ({orgSubscription.activeStaffCount || 1}/{orgSubscription.employeeLimit || 5})
                </span>
                {orgSubscription.subscription?.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-[10px] uppercase tracking-wide cursor-pointer shadow-xs"
                    title="Upgrade to Pro / Enterprise"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-2.5">
                {/* Offline Sync & Network Telemetry Pill - ONLY on Manager Dashboard */}
                <button
                  onClick={() => setShowSyncModal(true)}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-md ${
                    networkCondition === 'offline'
                      ? 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse shadow-red-500/20'
                      : networkCondition === 'slow_3g'
                      ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300 shadow-yellow-500/20'
                      : darkMode
                      ? 'bg-[#181206] border-amber-600/70 text-amber-400 shadow-amber-500/10 hover:border-amber-500'
                      : 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm hover:border-amber-400'
                  }`}
                  title="Inspect Offline Data Sync & Network Simulator"
                >
                  {networkCondition === 'offline' ? (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  ) : (
                    <Wifi className="h-4 w-4 text-amber-500" />
                  )}
                  <span className={`font-bold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                    {networkCondition === 'offline' ? 'Offline' : networkCondition === 'slow_3g' ? '2G/3G' : 'Online'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#f59e0b] text-slate-950 font-black">
                    {pendingSyncCount > 0 ? pendingSyncCount : 3}
                  </span>
                </button>

                <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg border ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className="text-sm">{currentUser.avatar || '👤'}</span>
                  <div className="hidden sm:block text-left">
                    <div className={`text-xs font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser.name}</div>
                    <div className="text-[10px] text-sky-500 font-medium">{currentUser.badge || currentUser.role}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setView('landing');
                    window.history.pushState(null, '', '/');
                  }}
                  className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1.5 cursor-pointer transition-colors ${
                    darkMode ? 'text-slate-300 hover:text-red-400' : 'text-slate-600 hover:text-red-600'
                  }`}
                  title="Sign out of console"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => {
                    setLoginInitialPortal('employee');
                    setLoginInitialAuthMode('sign_in');
                    setView('login');
                    window.history.pushState(null, '', '/login');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    darkMode ? 'border-slate-700 hover:border-slate-600 text-slate-200 hover:bg-slate-800/60' : 'border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setLoginInitialPortal('employee');
                    setLoginInitialAuthMode('register');
                    setView('login');
                    window.history.pushState(null, '', '/login');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>
      </>
    )}

      {/* Main Content */}
      {view === 'landing' && (
        isNativeApp ? (
          /* Mobile App Native Home Screen: Only App Logo + Login / Account Creation Form, Everything Else Removed */
          <div className="w-full flex-1 flex flex-col">
            <LoginPage
              initialPortal={loginInitialPortal}
              initialAuthMode={loginInitialAuthMode}
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
              onLoginSuccess={handleLoginSuccess}
              isMobileHome={true}
            />
          </div>
        ) : (
          <>
            {/* Mobile Web Viewport: Responsive dedicated screen showing only App Logo + Login / Account Creation */}
            <div className="lg:hidden w-full flex-1 flex flex-col">
              <LoginPage
                initialPortal={loginInitialPortal}
                initialAuthMode={loginInitialAuthMode}
                darkMode={darkMode}
                onToggleTheme={toggleTheme}
                onLoginSuccess={handleLoginSuccess}
                isMobileHome={true}
              />
            </div>

            {/* Desktop Web: Full Marketing Landing Page & Complete Footer Preserved */}
            <div className="hidden lg:block w-full">
              <LandingPage
                onEnterManager={() => {
                  setLoginInitialPortal('manager');
                  setLoginInitialAuthMode('sign_in');
                  if (currentUser) {
                    if (isManagerUser(currentUser)) {
                      setView('dashboard');
                      window.history.pushState(null, '', '/dashboard');
                    } else {
                      setAccessDeniedMsg('Your account is an Employee profile. Opening your Employee Portal.');
                      setView('employee');
                      setActiveEmployeeTab('dashboard');
                      window.history.pushState(null, '', '/employee/dashboard');
                    }
                  } else {
                    setView('login');
                    window.history.pushState(null, '', '/login');
                  }
                }}
                onEnterEmployee={() => {
                  setLoginInitialPortal('employee');
                  setLoginInitialAuthMode('sign_in');
                  if (currentUser) {
                    setView('employee');
                    setActiveEmployeeTab('dashboard');
                    window.history.pushState(null, '', '/employee/dashboard');
                  } else {
                    setView('login');
                    window.history.pushState(null, '', '/login');
                  }
                }}
                onGetStarted={() => {
                  setShowSubscriptionModal(true);
                }}
                onSelectPlan={(planId) => {
                  if (planId === 'free') {
                    setOrgRegInitialPlan('free');
                    setOrgRegPrefill({ licenseKey: '', orgName: '', email: '', managerName: '' });
                    setShowOrgRegModal(true);
                  } else {
                    setCheckoutPlanId(planId);
                    setShowCheckoutModal(true);
                  }
                }}
                onOpenResourceModal={(type) => setResourceModalType(type)}
              />
              <HomepageFooter 
                darkMode={darkMode} 
                onOpenResourceModal={(type) => setResourceModalType(type)}
                onOpenSuperAdmin={() => setShowSuperAdminModal(true)}
              />
            </div>
          </>
        )
      )}

      {view === 'dashboard' && (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Persistent Sidebar */}
          <aside className={`hidden lg:flex w-56 flex-shrink-0 border-r flex-col py-4 transition-colors ${
            darkMode ? 'bg-[#080d18] border-slate-800/80 text-slate-100' : 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
          }`}>
            <nav className="flex-1 px-3 space-y-1">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActivePage(key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activePage === key
                      ? (darkMode ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold' : 'bg-blue-50 text-blue-600 border border-blue-200 font-bold shadow-xs')
                      : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                  {key === 'live' && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              ))}
            </nav>

            <div className="px-3 mt-2 space-y-2">
              <button
                onClick={() => setShowGlobalSosConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-500 dark:text-red-400 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                title="Test Emergency SOS Beacon"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Test SOS Panic</span>
              </button>

              {currentUser && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  {/* Organization Subscription Status in Sidebar */}
                  {orgSubscription && (
                    <div className={`p-2.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        <span className="truncate max-w-[90px]">{orgSubscription.organization?.name || 'Organization'}</span>
                        <span className="font-mono text-blue-500 capitalize">{orgSubscription.subscription?.plan || 'free'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]">Staff Seats</span>
                        <span className="font-mono font-bold">{orgSubscription.activeStaffCount || 1} / {orgSubscription.employeeLimit || 5}</span>
                      </div>
                      {orgSubscription.subscription?.plan === 'free' && (
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="mt-2 w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          ⚡ Upgrade Plan
                        </button>
                      )}
                    </div>
                  )}

                  {/* Super Admin Console Button */}
                  {(currentUser?.role === 'Super Admin' || currentUser?.email === 'superadmin@ework.com') && (
                    <button
                      onClick={() => setShowSuperAdminModal(true)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Super Admin</span>
                    </button>
                  )}

                  <div className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl border ${
                    darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-lg">{currentUser.avatar || '👤'}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser.name}</div>
                      <div className="text-[10px] text-blue-500 dark:text-blue-400 truncate">{currentUser.badge || currentUser.role}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Universal Mobile Slide-In Drawer for Manager Portal */}
          <UniversalMobileDrawer
            isOpen={managerDrawerOpen}
            onClose={() => setManagerDrawerOpen(false)}
            portalType="manager"
            currentUser={currentUser}
            activeItem={activePage}
            onNavigate={(page) => setActivePage(page)}
            onSwitchPortal={() => {
              setView('employee');
              setActiveEmployeeTab('dashboard');
              window.history.pushState(null, '', '/employee/dashboard');
            }}
            isManager={isManagerUser(currentUser)}
            orgSubscription={orgSubscription}
            onUpgradePlan={() => setShowUpgradeModal(true)}
            onSuperAdmin={() => setShowSuperAdminModal(true)}
            onOpenSync={() => setShowSyncModal(true)}
            onOpenSos={() => setShowGlobalSosConfirm(true)}
            onLogout={() => {
              try { localStorage.removeItem('ework_user'); } catch (_) {}
              setCurrentUser(null);
              setView('landing');
              window.history.pushState(null, '', '/');
            }}
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
            unreadNotifsCount={sosAlerts.length}
          />

          <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
            {renderPage()}
          </main>

          {/* Universal Fixed Mobile Bottom Navigation (Hidden on lg desktop) */}
          <UniversalMobileBottomNav
            portalType="manager"
            activeItem={activePage}
            onSelect={(page) => setActivePage(page)}
            onOpenMore={() => setManagerDrawerOpen(prev => !prev)}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Global Emergency SOS Safeguard Confirmation Modal */}
      {showGlobalSosConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1322] border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-white">
            <div className="h-12 w-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white">
              Trigger Emergency SOS Beacon?
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
              This safeguard ensures sirens and emergency broadcasts are never dispatched by mistake. Confirming this action broadcasts high-priority alerts to all active monitors.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowGlobalSosConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGlobalSosConfirm(false);
                  handleTriggerSos();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm Trigger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA 1-Click Install Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md shadow-2xl p-6 ${
            darkMode ? 'bg-[#091120] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              darkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Install E-Workforce Standalone App</h3>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>PWA Native Desktop &amp; Mobile App</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-sky-500 dark:text-sky-400 mb-1 flex items-center space-x-1.5">
                  <span>💻 Chrome / Edge (Windows &amp; Mac)</span>
                </div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Click the <strong>Install icon</strong> in your browser address bar (top-right next to URL) or click the menu ➔ <em>"Install E-Workforce"</em> to launch as a standalone desktop application.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center space-x-1.5">
                  <span>📱 Android Chrome</span>
                </div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Tap the browser menu <strong>(⋮)</strong> and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center space-x-1.5">
                  <span>🍏 Apple iOS (Safari)</span>
                </div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Tap the <strong>Share button</strong> at bottom of Safari, scroll down and select <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Data Sync & Network Simulator Modal */}
      <OfflineSyncInspectorModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* SQLite Database User Inspector Modal */}
      <DatabaseUserInspectorModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        currentUser={currentUser}
      />

      {/* Real-Time Two-Way Mobile & Dashboard Sync Toast */}
      {liveSyncToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center space-x-3.5 max-w-md ${
            liveSyncToast.type === 'danger'
              ? 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-500/20'
              : liveSyncToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20'
              : 'bg-sky-950/90 border-sky-500/50 text-sky-200 shadow-sky-500/20'
          }`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 text-lg ${
              liveSyncToast.type === 'danger' ? 'bg-red-500/20 text-red-400' :
              liveSyncToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-sky-500/20 text-sky-400'
            }`}>
              {liveSyncToast.type === 'danger' ? '🚨' : liveSyncToast.type === 'success' ? '✓' : '⚡'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black tracking-wide uppercase flex items-center space-x-1.5">
                <span>{liveSyncToast.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 font-mono text-slate-300 border border-white/10">LIVE SYNC</span>
              </div>
              <div className="text-xs text-slate-300 truncate mt-0.5">{liveSyncToast.message}</div>
            </div>
            <button
              onClick={() => setLiveSyncToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Homepage Resource Modals (Privacy Policy, Terms of Service, Docs, Help, Contact, Careers) */}
      <HomepageResourceModal
        isOpen={!!resourceModalType}
        onClose={() => setResourceModalType(null)}
        modalType={resourceModalType}
      />

      {/* SaaS Subscription Selection Modal */}
      <SubscriptionSelectionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPlan={(planId) => {
          if (planId === 'free') {
            setOrgRegInitialPlan('free');
            setOrgRegPrefill({ licenseKey: '', orgName: '', email: '', managerName: '' });
            setShowOrgRegModal(true);
          } else {
            setCheckoutPlanId(planId);
            setShowCheckoutModal(true);
          }
        }}
        onEnterLicenseDirectly={() => {
          setOrgRegInitialPlan('professional');
          setOrgRegPrefill({ licenseKey: '', orgName: '', email: '', managerName: '' });
          setShowOrgRegModal(true);
        }}
        darkMode={darkMode}
      />

      {/* Online & UPI Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedPlanId={checkoutPlanId}
        onPaymentSuccess={({ plan, licenseKey, orgName, email, name }) => {
          setOrgRegInitialPlan(plan);
          setOrgRegPrefill({
            licenseKey,
            orgName,
            email,
            managerName: name
          });
          setShowOrgRegModal(true);
        }}
        darkMode={darkMode}
      />

      {/* Organization & Manager Registration Modal */}
      <OrganizationRegistrationModal
        isOpen={showOrgRegModal}
        onClose={() => setShowOrgRegModal(false)}
        initialPlan={orgRegInitialPlan}
        prefilledLicenseKey={orgRegPrefill.licenseKey}
        prefilledOrgName={orgRegPrefill.orgName}
        prefilledEmail={orgRegPrefill.email}
        prefilledManagerName={orgRegPrefill.managerName}
        onRegistrationSuccess={(newUser, newOrg, newSub) => {
          setCurrentUser(newUser);
          setView('dashboard');
          window.history.pushState(null, '', '/dashboard');
          setOrgSubscription({
            organization: newOrg,
            subscription: newSub,
            activeStaffCount: 1,
            employeeLimit: newSub.plan === 'free' ? 5 : newSub.plan === 'professional' ? 100 : 1000
          });
          setLiveSyncToast({
            title: 'Organization Ready!',
            message: `${newOrg.name} registered on ${newSub.plan.toUpperCase()} plan.`,
            type: 'success'
          });
        }}
        darkMode={darkMode}
      />

      {/* Super Admin Control Center Modal */}
      <SuperAdminDashboardModal
        isOpen={showSuperAdminModal}
        onClose={() => {
          setShowSuperAdminModal(false);
          if (currentUser?.organization_id) {
            fetchOrgSubscription(currentUser.organization_id);
          }
        }}
        darkMode={darkMode}
      />

      {/* In-Place Subscription Upgrade Modal for Logged-In Managers */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUser={currentUser}
        currentSubscription={orgSubscription?.subscription}
        onUpgradeSuccess={(newSub) => {
          setOrgSubscription(prev => ({
            ...prev,
            subscription: newSub,
            employeeLimit: newSub.plan === 'professional' ? 100 : 1000
          }));
          setLiveSyncToast({
            title: 'Plan Upgraded Successfully',
            message: `Organization is now on ${newSub.plan.toUpperCase()} tier!`,
            type: 'success'
          });
        }}
        onBuyLicense={(targetPlan) => {
          setCheckoutPlanId(targetPlan);
          setShowCheckoutModal(true);
        }}
        darkMode={darkMode}
      />
    </div>
  );
}
