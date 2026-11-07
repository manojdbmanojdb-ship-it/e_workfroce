import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, Camera, WifiOff, ArrowRight, CheckCircle2, 
  MapPin, ShieldCheck, ChevronRight 
} from 'lucide-react';

const SLIDES = [
  {
    icon: Activity,
    badge: '01. SMART FIELD RADAR',
    title: 'Automated GPS & Geofenced Dispatch',
    desc: 'Never worry about manual attendance punch-ins. Verify presence inside client boundaries with 150m geofence accuracy.',
    color: 'from-blue-600 to-indigo-600',
    highlight: 'GPS Boundary Verification'
  },
  {
    icon: Camera,
    badge: '02. PROOF-OF-WORK',
    title: 'Instant Photo Sign-Off & Digital Signatures',
    desc: 'Capture before/after work order photographs, collect customer signatures right on your phone, and generate field certificates.',
    color: 'from-sky-500 to-teal-500',
    highlight: 'Tamper-Proof Audit Trail'
  },
  {
    icon: WifiOff,
    badge: '03. ZERO DOWNTIME',
    title: 'Offline-First SQLite Transaction Buffer',
    desc: 'Work in basements, remote sites, or poor network zones without losing data. All check-ins and notes auto-sync once connected.',
    color: 'from-amber-500 to-orange-500',
    highlight: 'Automated Overtime & Sync'
  }
];

export const OnboardingScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFinish = () => {
    localStorage.setItem('ework_has_onboarded', 'true');
    navigateTo('login');
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-screen w-screen flex flex-col justify-between p-6 bg-slate-900 text-white select-none safe-top safe-bottom relative overflow-hidden">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-mono tracking-wider font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-full uppercase">
          {slide.badge}
        </span>
        <button
          onClick={handleFinish}
          className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Center Slide Graphics & Content */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-sm mx-auto">
        {/* Animated Icon Circle */}
        <div className={`h-24 w-24 rounded-3xl bg-gradient-to-tr ${slide.color} p-0.5 shadow-2xl mb-8 flex items-center justify-center transform transition-transform duration-300 scale-105`}>
          <div className="h-full w-full bg-[#091120] rounded-[22px] flex items-center justify-center">
            <Icon className="h-10 w-10 text-white" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          {slide.highlight}
        </span>

        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide leading-tight text-white mb-4">
          {slide.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
          {slide.desc}
        </p>
      </div>

      {/* Bottom Navigation Dots & Actions */}
      <div className="space-y-6 z-10">
        {/* Dot Indicators */}
        <div className="flex items-center justify-center space-x-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-sky-400' : 'w-2 bg-slate-700'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(prev => prev - 1)}
              className="px-5 py-3 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Prev
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
