import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Bell, AlertTriangle, ShieldCheck, Wifi, WifiOff, Menu } from 'lucide-react';
import type { ScreenType } from '../types';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenMenu?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showBack, onBack, onOpenMenu }) => {
  const { navigateTo, unreadCount, isOnline, showToast, darkMode } = useApp();

  const handleSos = () => {
    navigateTo('location');
    showToast('Emergency SOS Radar & Panic Beacon Opened', 'error');
  };

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 bg-white/95 dark:bg-[#070c14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 pt-3 pb-3 safe-top">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button or Logo + Menu */}
        <div className="flex items-center space-x-2.5">
          {showBack ? (
            <button
              onClick={onBack || (() => navigateTo('home'))}
              className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onOpenMenu}
              className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {title ? (
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h1>
          ) : (
            <div className="flex items-center space-x-2" onClick={() => navigateTo('home')}>
              <img 
                src={darkMode ? "/logo-dark.png" : "/logo.png"} 
                alt="E-WorkForce" 
                className="h-8 w-auto object-contain" 
              />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 font-mono tracking-wider">
                STAFF
              </span>
            </div>
          )}
        </div>

        {/* Right: Online Pill, SOS Panic, Notifications */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Online/Offline indicator */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden xs:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Emergency SOS Quick Trigger */}
          <button
            onClick={handleSos}
            className="p-2 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-95 transition-all"
            title="Emergency SOS Panic"
          >
            <AlertTriangle className="h-4 w-4 animate-pulse" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => navigateTo('notifications')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#070c14]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
