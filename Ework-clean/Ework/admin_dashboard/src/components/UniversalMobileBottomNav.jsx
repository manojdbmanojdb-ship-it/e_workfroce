import React from 'react';
import {
  Navigation, LayoutDashboard, CheckSquare, Clock,
  Receipt, MessageSquare, Menu
} from 'lucide-react';

export default function UniversalMobileBottomNav({
  portalType = 'manager', // 'manager' | 'employee'
  activeItem,
  onSelect,
  onOpenMore,
  darkMode = false
}) {
  const items = portalType === 'manager'
    ? [
        { key: 'live', label: 'Tracking', icon: Navigation },
        { key: 'tasks', label: 'Tasks', icon: CheckSquare },
        { key: 'attendance', label: 'Attendance', icon: Clock },
        { key: 'expenses', label: 'Expenses', icon: Receipt },
        { key: 'more', label: 'More', icon: Menu, isAction: true },
      ]
    : [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'tasks', label: 'Tasks', icon: CheckSquare },
        { key: 'attendance', label: 'Attendance', icon: Clock },
        { key: 'messages', label: 'Messages', icon: MessageSquare },
        { key: 'more', label: 'More', icon: Menu, isAction: true },
      ];

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-colors backdrop-blur-xl border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] ${
        darkMode
          ? 'bg-[#080d18]/95 border-slate-800/90 text-slate-100'
          : 'bg-white/95 border-slate-200/90 text-slate-900'
      }`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
      }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-lg mx-auto">
        {items.map(({ key, label, icon: Icon, isAction }) => {
          const isActive = !isAction && activeItem === key;

          return (
            <button
              key={key}
              onClick={() => {
                if (isAction) {
                  onOpenMore();
                } else {
                  onSelect(key);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-w-0 select-none ${
                isActive
                  ? 'text-blue-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {key === 'live' && (
                  <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {label}
              </span>
              {isActive && (
                <span className="h-1 w-5 rounded-full bg-blue-600 dark:bg-sky-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
