import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Calendar, BarChart3, Radio, Bell, Settings, 
  Moon, Sun, LogOut, ChevronRight, ShieldCheck, UserCheck 
} from 'lucide-react';
import type { ScreenType } from '../types';

interface QuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDrawer: React.FC<QuickDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, navigateTo, logout, darkMode, toggleTheme, unreadCount } = useApp();

  if (!isOpen) return null;

  const handleNav = (screen: ScreenType) => {
    navigateTo(screen);
    onClose();
  };

  const MENU_ITEMS = [
    { label: 'Leave Management', icon: Calendar, screen: 'leaves' as ScreenType, badge: 'Quota: 28d' },
    { label: 'Work Reports & Shifts', icon: BarChart3, screen: 'reports' as ScreenType, badge: 'Weekly' },
    { label: 'Location & SOS Radar', icon: Radio, screen: 'location' as ScreenType, badge: 'Active' },
    { label: 'Notifications', icon: Bell, screen: 'notifications' as ScreenType, badge: unreadCount > 0 ? `${unreadCount} new` : undefined },
    { label: 'Application Settings', icon: Settings, screen: 'settings' as ScreenType },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#070e1b] h-full shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250 z-10 safe-top safe-bottom">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 uppercase">
              Field Staff Suite
            </span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20">
              {currentUser?.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'Rahul Sharma'}
              </h2>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium truncate">
                {currentUser?.designation || currentUser?.role || 'Senior Field Tech'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {currentUser?.employee_id || 'EW-4091'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          {MENU_ITEMS.map(({ label, icon: Icon, screen, badge }) => (
            <button
              key={screen}
              onClick={() => handleNav(screen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-98 transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold">{label}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-slate-700">
                    {badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Theme Switcher Row */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              {darkMode ? <Moon className="h-4 w-4 text-sky-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>{darkMode ? 'Dark Obsidian Theme' : 'Light Clean Theme'}</span>
            </span>
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-[11px] shadow-sm"
            >
              Switch
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of Mobile App</span>
          </button>
        </div>

      </div>
    </div>
  );
};
