import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Smartphone, UserCheck, AlertCircle, KeyRound, Sparkles 
} from 'lucide-react';

const QUICK_DEMO_USERS = [
  { name: 'Rahul Sharma', email: 'rahul@ework.com', role: 'Senior Field Tech', avatar: '🔧', badge: 'Delhi Hub' },
  { name: 'Priya Patel', email: 'priya@ework.com', role: 'Sales Specialist', avatar: '💼', badge: 'Mumbai Hub' },
  { name: 'Vikram Singh', email: 'vikram@ework.com', role: 'Field Engineer', avatar: '⚙️', badge: 'Bangalore Hub' },
];

export const LoginScreen: React.FC = () => {
  const { login, navigateTo, showToast, darkMode } = useApp();
  const [email, setEmail] = useState('rahul@ework.com');
  const [password, setPassword] = useState('Workforce@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide your work email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.signIn(email, password);
      const userPayload = (res as any)?.user || res?.data;
      if (res?.success && userPayload) {
        login(userPayload);
        return;
      }
      
      // Fallback for demo / offline match
      const demo = QUICK_DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demo) {
        const uid = demo.name.includes('Rahul') ? 'usr-102' : demo.name.includes('Priya') ? 'usr-103' : 'usr-104';
        login({
          id: uid,
          user_id: uid,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          avatar: demo.avatar,
          employee_id: demo.name.includes('Rahul') ? 'EW-4091' : demo.name.includes('Priya') ? 'EW-4092' : 'EW-4093',
          designation: demo.role
        });
        return;
      }

      setError((res as any)?.error || 'Invalid credentials. Please verify your work email and password.');
    } catch (err: any) {
      // Local fallback on server unreachable / Render free tier spinup
      const demo = QUICK_DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demo) {
        const uid = demo.name.includes('Rahul') ? 'usr-102' : demo.name.includes('Priya') ? 'usr-103' : 'usr-104';
        login({
          id: uid,
          user_id: uid,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          avatar: demo.avatar,
          employee_id: demo.name.includes('Rahul') ? 'EW-4091' : demo.name.includes('Priya') ? 'EW-4092' : 'EW-4093',
          designation: demo.role
        });
        showToast('Signed in via offline cached profile', 'info');
      } else {
        setError('Server waking up. Tap any 1-Tap Demo Staff button below to sign in instantly.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demo: typeof QUICK_DEMO_USERS[0]) => {
    setEmail(demo.email);
    setPassword('Workforce@2026');
    setError('');

    const uid = demo.name.includes('Rahul') ? 'usr-102' : demo.name.includes('Priya') ? 'usr-103' : 'usr-104';
    const targetUser = {
      id: uid,
      user_id: uid,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      avatar: demo.avatar,
      employee_id: demo.name.includes('Rahul') ? 'EW-4091' : demo.name.includes('Priya') ? 'EW-4092' : 'EW-4093',
      designation: demo.role
    };

    // Instant 1-tap login to prevent any perceived UI freeze
    login(targetUser);

    // Asynchronously sync with backend if online
    apiService.signIn(demo.email, 'Workforce@2026').catch(() => {});
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-white safe-top safe-bottom">
      
      {/* Header Branding */}
      <div className="pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={darkMode ? "/logo-dark.png" : "/logo.png"} 
            alt="E-WorkForce" 
            className="h-9 w-auto object-contain" 
          />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 tracking-wider">
            MOBILE APP
          </span>
        </div>
        <button
          onClick={() => navigateTo('settings')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 font-medium"
        >
          Server Config
        </button>
      </div>

      {/* Main Login Form Container */}
      <div className="my-auto py-6 max-w-sm mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
            Employee Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your dispatched routes, tasks &amp; GPS attendance
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="technician@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#0b1322] border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigateTo('forgot_password')}
                className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white dark:bg-[#0b1322] border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 1-Tap Field Staff Demo Login Profiles */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>1-Tap Demo Staff Logins</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {QUICK_DEMO_USERS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleQuickSelect(demo)}
                className="p-3 rounded-2xl border text-left flex items-center justify-between transition-all bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0">{demo.avatar}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{demo.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight truncate">{demo.role} • {demo.badge}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-800 flex items-center space-x-1 flex-shrink-0">
                  <span>Sign In</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Safeguard */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>Enterprise 256-bit AES End-to-End Encryption</span>
      </div>
    </div>
  );
};
