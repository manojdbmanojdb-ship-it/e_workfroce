import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, CheckSquare, Clock, MapPin, User as UserIcon } from 'lucide-react';
import type { ScreenType } from '../types';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  const TABS = [
    { key: 'home', label: 'Home', icon: Home, screen: 'home' as ScreenType },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare, screen: 'tasks' as ScreenType },
    { key: 'attendance', label: 'Attendance', icon: Clock, screen: 'attendance' as ScreenType },
    { key: 'maps', label: 'Radar', icon: MapPin, screen: 'maps' as ScreenType },
    { key: 'profile', label: 'Profile', icon: UserIcon, screen: 'profile' as ScreenType },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070c14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-2 pt-1.5 pb-2 safe-bottom shadow-lg shadow-black/10">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {TABS.map(({ key, label, icon: Icon, screen }) => {
          const isActive = currentScreen === screen || (screen === 'tasks' && currentScreen === 'task_details');
          return (
            <button
              key={key}
              onClick={() => navigateTo(screen)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-blue-600 dark:text-sky-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-blue-600/10 dark:bg-sky-500/15' : ''
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-blue-600 dark:bg-sky-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
