import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ darkMode, onToggle, compact = false, className = '' }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        } ${className}`}
        title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        aria-label="Toggle Theme"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div
      onClick={onToggle}
      className={`inline-flex items-center p-0.5 rounded-full border cursor-pointer select-none transition-all shadow-xs ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          : 'bg-slate-100/90 border-slate-200/90 hover:border-slate-300'
      } ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle && onToggle();
        }
      }}
      title={darkMode ? 'Currently Dark Theme • Click to switch to Light Theme' : 'Currently Light Theme • Click to switch to Dark Theme'}
      aria-label="Theme Switcher: Light and Dark"
    >
      {/* Light Option */}
      <div
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
          !darkMode
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun className={`h-3.5 w-3.5 ${!darkMode ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
        <span>Light</span>
      </div>

      {/* Dark Option */}
      <div
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
          darkMode
            ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Moon className={`h-3.5 w-3.5 ${darkMode ? 'text-amber-400 fill-amber-400/20' : 'text-slate-500'}`} />
        <span>Dark</span>
      </div>
    </div>
  );
}
