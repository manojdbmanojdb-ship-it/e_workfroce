import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, CheckSquare, Clock, BarChart2, Bell,
  MessageSquare, User, LogOut, ShieldCheck,
  ChevronRight, Menu, X, ArrowLeftRight, Sparkles, Navigation
} from 'lucide-react';
import { io } from 'socket.io-client';
import ThemeToggle from '../components/ThemeToggle.jsx';
import UniversalMobileHeader from '../components/UniversalMobileHeader.jsx';
import UniversalMobileBottomNav from '../components/UniversalMobileBottomNav.jsx';
import UniversalMobileDrawer from '../components/UniversalMobileDrawer.jsx';

const NAV_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/employee/dashboard' },
  { key: 'tasks', label: 'My Tasks', icon: CheckSquare, route: '/employee/tasks' },
  { key: 'attendance', label: 'Attendance', icon: Clock, route: '/employee/attendance' },
  { key: 'performance', label: 'Performance', icon: BarChart2, route: '/employee/performance' },
  { key: 'notifications', label: 'Notifications', icon: Bell, route: '/employee/notifications' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, route: '/employee/messages' },
  { key: 'profile', label: 'My Profile', icon: User, route: '/employee/profile' },
];

export default function EmployeeLayout({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  onSwitchToManager,
  darkMode: externalDarkMode,
  onToggleTheme,
  children
}) {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    return localStorage.getItem('ework_theme') === 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(3);
  const [liveToast, setLiveToast] = useState(null);

  const darkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;
  const toggleTheme = onToggleTheme || (() => {
    const next = !internalDarkMode;
    setInternalDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ework_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ework_theme', 'light');
    }
  });

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ework_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ework_theme', 'light');
    }
  }, [darkMode]);

  // Fetch unread count from backend
  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employee/dashboard-summary?userId=${currentUser.user_id || currentUser.id}`);
      const data = await res.json();
      if (data.success && data.data?.unreadNotificationsCount !== undefined) {
        setUnreadNotifsCount(data.data.unreadNotificationsCount);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [currentUser, activeTab]);

  // Real-time socket updates for Employee Portal
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('task_created', (task) => {
      if (task.assigned_to === currentUser?.name || task.assigned_to_id === currentUser?.user_id) {
        setUnreadNotifsCount(prev => prev + 1);
        setLiveToast({
          title: 'New Task Assigned',
          message: task.title,
          type: 'info'
        });
      }
    });

    socket.on('task_updated', (task) => {
      if (task.assigned_to === currentUser?.name || task.assigned_to_id === currentUser?.user_id) {
        setLiveToast({
          title: 'Task Status Updated',
          message: `"${task.title}" is now ${task.status?.replace('_', ' ')}`,
          type: 'success'
        });
      }
    });

    socket.on('new_message', (msg) => {
      if (msg.recipient_id === currentUser?.user_id || msg.recipient_id === 'team') {
        setLiveToast({
          title: `Message from ${msg.sender_name}`,
          message: msg.content,
          type: 'info'
        });
      }
    });

    return () => socket.disconnect();
  }, [currentUser]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!liveToast) return;
    const timer = setTimeout(() => setLiveToast(null), 4000);
    return () => clearTimeout(timer);
  }, [liveToast]);

  const isManagerUser = currentUser?.role && (
    currentUser.role.toLowerCase().includes('manager') ||
    currentUser.role.toLowerCase().includes('admin') ||
    currentUser.role.toLowerCase().includes('director')
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-[#060c18] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Universal Responsive Mobile Header (Phone / Tablet < lg) */}
      <UniversalMobileHeader
        portalType="employee"
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenDrawer={() => setMobileMenuOpen(prev => !prev)}
        drawerOpen={mobileMenuOpen}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => onTabChange('notifications')}
        onLogoClick={() => onTabChange('dashboard')}
      />

      {/* Top Tablet/Desktop Header (Only on lg screens, 100% preserved) */}
      <header className={`hidden lg:flex sticky top-0 z-40 h-16 sm:h-20 transition-colors backdrop-blur-xl border-b ${
        darkMode ? 'bg-[#081224]/95 border-slate-800/80 shadow-lg shadow-black/25' : 'bg-white/95 border-slate-200/90 shadow-sm'
      }`}>
        <div className="max-w-[1720px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6 w-full">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
            <img 
              src="/logo-dark.png?v=3" 
              alt="E-WorkForce" 
              className="h-9 sm:h-11 w-auto object-contain hidden dark:block"
            />
            <img 
              src="/logo.png?v=3" 
              alt="E-WorkForce" 
              className="h-9 sm:h-11 w-auto object-contain block dark:hidden"
            />
            <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 tracking-wider">
              STAFF PORTAL
            </span>
          </div>

          {/* Navigation Pill Bar (Desktop Capsule) */}
          <nav className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-inner flex-shrink-0 gap-1.5 xl:gap-2.5">
            {NAV_TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => onTabChange(key)}
                  className={`flex items-center space-x-2 px-3.5 xl:px-4 py-2 rounded-full text-xs transition-all cursor-pointer relative whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-white hover:shadow-xs dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                  <span className="xl:hidden">{label.replace('My ', '')}</span>
                  {key === 'notifications' && unreadNotifsCount > 0 && (
                    <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 flex-shrink-0"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
            {/* Dark / Light Toggle */}
            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} compact={true} />

            {/* Notification Bell Pill */}
            <button
              onClick={() => onTabChange('notifications')}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer border ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center shadow-sm">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Switch to Manager Dashboard button (if manager) */}
            {isManagerUser && onSwitchToManager && (
              <button
                onClick={onSwitchToManager}
                className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Switch to Management Dispatch Console"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Manager Console</span>
              </button>
            )}

            {/* User Profile Pill */}
            <button
              onClick={() => onTabChange('profile')}
              className={`flex items-center space-x-2 p-1 sm:pr-3 rounded-full border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {currentUser?.avatar || '👤'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[90px] xl:max-w-[120px]">
                  {currentUser?.name || 'Rahul Sharma'}
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium truncate max-w-[90px] xl:max-w-[120px]">
                  {currentUser?.designation || currentUser?.role || 'Field Staff'}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign Out of Employee Portal"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Universal Mobile Slide-In Drawer (Clean, non-overlapping, accessible) */}
      <UniversalMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        portalType="employee"
        currentUser={currentUser}
        activeItem={activeTab}
        onNavigate={(tab) => onTabChange(tab)}
        onSwitchPortal={isManagerUser && onSwitchToManager ? onSwitchToManager : null}
        isManager={isManagerUser}
        onLogout={onLogout}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Content View Container (With safe bottom margin to prevent navigation overlap) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 lg:pb-8 relative z-0">
        {children}
      </main>

      {/* Universal Fixed Mobile Bottom Navigation */}
      <UniversalMobileBottomNav
        portalType="employee"
        activeItem={activeTab}
        onSelect={(tab) => onTabChange(tab)}
        onOpenMore={() => setMobileMenuOpen(prev => !prev)}
        darkMode={darkMode}
      />

      {/* Real-Time Toast Notification */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center space-x-3.5 max-w-sm bg-slate-900/95 border-sky-500/40 text-white shadow-sky-500/15">
            <div className="h-9 w-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base flex-shrink-0">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase text-sky-400 tracking-wide">{liveToast.title}</div>
              <div className="text-xs text-slate-300 truncate mt-0.5">{liveToast.message}</div>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
