import React from 'react';
import {
  X, User, ArrowLeftRight, Activity, CheckSquare, Clock,
  Calendar, MessageSquare, Receipt, Wrench, BarChart2,
  Bell, ShieldCheck, Wifi, AlertTriangle, LogOut,
  Sun, Moon, Building, HelpCircle, ChevronRight
} from 'lucide-react';

export default function UniversalMobileDrawer({
  isOpen = false,
  onClose,
  portalType = 'manager', // 'manager' | 'employee'
  currentUser,
  activeItem,
  onNavigate,
  onSwitchPortal,
  isManager = false,
  orgSubscription,
  onUpgradePlan,
  onSuperAdmin,
  onOpenSync,
  onOpenSos,
  onLogout,
  darkMode = false,
  onToggleTheme,
  unreadNotifsCount = 0
}) {
  if (!isOpen) return null;

  const managerModules = [
    { key: 'live', label: 'Live Tracking & Radar', icon: Activity, badge: 'Live' },
    { key: 'tasks', label: 'Tasks Board & Dispatch', icon: CheckSquare },
    { key: 'attendance', label: 'Attendance & Geofences', icon: Clock },
    { key: 'shifts', label: 'Shifts & Roster', icon: Calendar },
    { key: 'chat', label: 'Team Chat Channels', icon: MessageSquare },
    { key: 'expenses', label: 'Expense Claims & Audit', icon: Receipt },
    { key: 'assets', label: 'Assets & Equipment', icon: Wrench },
    { key: 'reports', label: 'Performance Analytics', icon: BarChart2 },
  ];

  const employeeModules = [
    { key: 'dashboard', label: 'Home Dashboard', icon: Activity },
    { key: 'tasks', label: 'My Assigned Tasks', icon: CheckSquare },
    { key: 'attendance', label: 'Attendance Clock-In', icon: Clock },
    { key: 'performance', label: 'My Performance Trends', icon: BarChart2 },
    { key: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifsCount },
    { key: 'messages', label: 'Messages & Chat', icon: MessageSquare },
    { key: 'profile', label: 'Employee Profile', icon: User },
  ];

  const activeModules = portalType === 'manager' ? managerModules : employeeModules;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`relative w-80 max-w-[85vw] h-full flex flex-col shadow-2xl z-10 transition-colors border-l ${
          darkMode
            ? 'bg-[#080d18] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)'
        }}
      >
        {/* Drawer Header: User Profile Brief & Close Button */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
              {currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '👤')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                {currentUser?.name || 'Staff User'}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold truncate">
                {currentUser?.designation || currentUser?.role || 'Authenticated'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            aria-label="Close Navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Dual-Portal Switcher (If manager authorized) */}
          {isManager && onSwitchPortal && (
            <button
              onClick={() => {
                onSwitchPortal();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="h-4 w-4" />
                <span>{portalType === 'manager' ? 'Switch to Staff Portal' : 'Switch to Manager Console'}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          )}

          {/* Module Navigation List */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {portalType === 'manager' ? 'Operations Modules' : 'My Workspace'}
            </div>
            <nav className="space-y-1">
              {activeModules.map(({ key, label, icon: Icon, badge, count }) => {
                const isActive = activeItem === key;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      onNavigate(key);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? darkMode
                          ? 'bg-blue-600/20 text-sky-400 border border-blue-500/30 font-bold shadow-xs'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                        : darkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>

                    {badge && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}

                    {count !== undefined && count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Organization & Subscription Information (Manager) */}
          {orgSubscription && (
            <div className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Building className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-xs font-bold truncate max-w-[140px] text-slate-900 dark:text-white">
                    {orgSubscription.organization?.name || 'Organization'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 uppercase">
                  {orgSubscription.subscription?.plan || 'Free'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Staff Limit: {orgSubscription.activeStaffCount || 1} / {orgSubscription.employeeLimit || 5} active
              </div>
              {orgSubscription.subscription?.plan === 'free' && onUpgradePlan && (
                <button
                  onClick={() => {
                    onUpgradePlan();
                    onClose();
                  }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}

          {/* Context Tools & System Shortcuts */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tools &amp; Settings
            </div>

            {/* Offline Sync & Connection Modal Trigger */}
            {onOpenSync && (
              <button
                onClick={() => {
                  onOpenSync();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  darkMode ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Wifi className="h-4 w-4 text-emerald-500" />
                  <span>Data Sync &amp; Telemetry</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            )}

            {/* Super Admin Console (If authorized) */}
            {(currentUser?.role === 'Super Admin' || currentUser?.email === 'superadmin@ework.com') && onSuperAdmin && (
              <button
                onClick={() => {
                  onSuperAdmin();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Super Admin Console</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            )}

            {/* Emergency SOS Panic Test (Manager) */}
            {portalType === 'manager' && onOpenSos && (
              <button
                onClick={() => {
                  onOpenSos();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Test SOS Panic Beacon</span>
              </button>
            )}

            {/* Theme Toggle Full Row */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
              darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {darkMode ? <Moon className="h-4 w-4 text-sky-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                <span>Dark Theme</span>
              </div>
              <button
                onClick={onToggleTheme}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Toggle Dark Mode"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    darkMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer: Sign Out Action */}
        <div className={`p-3 border-t ${
          darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
