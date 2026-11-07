import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, ShieldCheck, Wifi, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { currentUser, navigateTo, darkMode } = useApp();
  const [statusMsg, setStatusMsg] = useState('Initializing E-WorkForce Mobile...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusMsg('Verifying offline encryption & SQLite sync...');
    }, 600);

    const timer2 = setTimeout(() => {
      setStatusMsg('Synchronizing GPS radar & telemetry...');
    }, 1200);

    const timer3 = setTimeout(() => {
      const hasSeenOnboarding = localStorage.getItem('ework_has_onboarded');
      if (currentUser) {
        navigateTo('home');
      } else if (!hasSeenOnboarding) {
        navigateTo('onboarding');
      } else {
        navigateTo('login');
      }
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentUser]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between p-8 bg-slate-900 text-white select-none relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.25)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Tag */}
      <div className="pt-8 safe-top z-10 flex items-center space-x-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
          Android Native Engine v1.2.0
        </span>
      </div>

      {/* Center Branding & Animated Rings */}
      <div className="flex flex-col items-center justify-center my-auto z-10">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing Radar concentric circles */}
          <div className="absolute h-36 w-36 rounded-full border border-sky-500/20 animate-ping" />
          <div className="absolute h-28 w-28 rounded-full border border-blue-500/30 animate-pulse" />

          {/* Logo Container */}
          <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-700 p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
            <div className="h-full w-full bg-[#080d1a] rounded-[22px] flex items-center justify-center p-3">
              <img 
                src="/logo-icon.png" 
                alt="E-WorkForce" 
                className="h-12 w-12 object-contain" 
              />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-display uppercase tracking-wider energetic-silver-line-2">
          E-WORKFORCE
        </h1>
        <p className="text-xs font-semibold text-sky-400 tracking-widest uppercase mt-1">
          Smart Workforce Management
        </p>
      </div>

      {/* Bottom Progress State */}
      <div className="w-full max-w-xs pb-6 safe-bottom z-10 flex flex-col items-center space-y-3">
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-pulse w-3/4" />
        </div>
        <p className="text-[11px] text-slate-400 font-mono tracking-tight text-center">
          {statusMsg}
        </p>
      </div>
    </div>
  );
};
