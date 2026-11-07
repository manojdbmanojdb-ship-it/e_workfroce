import React from 'react';
import { Sun, Moon, Bell, Menu, X, Wifi, WifiOff } from 'lucide-react';

export default function UniversalMobileHeader({
  portalType = 'manager', // 'manager' | 'employee'
  currentUser,
  darkMode = false,
  onToggleTheme,
  onOpenDrawer,
  drawerOpen = false,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSync,
  networkCondition = 'online',
  onLogoClick
}) {
  return (
    <header
      className={`lg:hidden sticky top-0 z-40 w-full transition-colors backdrop-blur-xl border-b ${
        darkMode
          ? 'bg-[#080d18]/95 border-slate-800/80 shadow-md shadow-black/20 text-white'
          : 'bg-white/95 border-slate-200/90 shadow-xs text-slate-800'
      }`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)'
      }}
    >
      <div className="h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-4 gap-2">
        {/* LEFT: Consistent E-WorkForce Logo */}
        <div className="flex items-center space-x-2 min-w-0 shrink">
          <div
            onClick={onLogoClick}
            className="flex items-center space-x-2 cursor-pointer select-none py-1 group"
            title="E-WorkForce"
          >
            {/* Standard Logo (Screens >= 370px) */}
            <img
              src={darkMode ? "/logo-dark.png?v=3" : "/logo.png?v=3"}
              alt="E-WorkForce"
              className="h-8 sm:h-9 w-auto object-contain hidden min-[370px]:block transition-transform group-hover:scale-105"
            />
            {/* Compact Logo Mark on Narrow Phones (< 370px) */}
            <img
              src="/logo-icon.png?v=3"
              alt="E-WorkForce"
              className="h-8 w-8 object-contain block min-[370px]:hidden"
            />

            {/* Portal Badge (Visible on >= 400px screens) */}
            <span className={`hidden min-[400px]:inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${
              portalType === 'manager'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {portalType === 'manager' ? 'MGMT' : 'STAFF'}
            </span>
          </div>
        </div>

        {/* RIGHT: Compact, Touch-Friendly Action Target Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
            aria-label="Toggle Color Theme"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Icon with Badge */}
          <button
            onClick={onOpenNotifications || onOpenDrawer}
            className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Contextual Telemetry Tool (Manager) OR User Avatar (Staff) */}
          {portalType === 'manager' && onOpenSync ? (
            <button
              onClick={onOpenSync}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                networkCondition === 'offline'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : darkMode
                  ? 'bg-slate-800/80 border-slate-700/80 text-emerald-400'
                  : 'bg-slate-100 border-slate-200 text-emerald-700 shadow-xs'
              }`}
              title="Inspect Connection & Sync"
            >
              {networkCondition === 'offline' ? (
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span className="hidden min-[420px]:inline">
                {networkCondition === 'offline' ? 'Offline' : 'Online'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              className="flex items-center cursor-pointer p-0.5 rounded-full ring-2 ring-transparent hover:ring-blue-500 transition-all"
              title="Account & Menu"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '👤')}
              </div>
            </button>
          )}

          {/* Universal Hamburger Menu Button */}
          <button
            onClick={onOpenDrawer}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              drawerOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/25'
                : darkMode
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
            aria-label={drawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            title="Navigation Menu"
          >
            {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
