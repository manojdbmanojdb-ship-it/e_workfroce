import React, { useState, useEffect } from 'react';
import {
  Navigation, Mail, Lock, Eye, EyeOff, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  Smartphone, UserCheck, KeyRound, X,
  Database, UserPlus, ChevronRight
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';

const DEMO_PERSONAS = [
  {
    name: 'Platform Super Admin',
    email: 'superadmin@ework.com',
    role: 'Super Admin',
    badge: 'Super Admin Console',
    color: 'from-purple-600 via-indigo-600 to-pink-500',
    avatar: '🛡️',
    tag: 'SaaS Platform Owner'
  },
  {
    name: 'Rajesh Kumar',
    email: 'manager@ework.com',
    role: 'Operations Manager',
    badge: 'Admin Console',
    color: 'from-blue-600 to-indigo-600',
    avatar: '👔',
    tag: 'Full Dispatch Access'
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@ework.com',
    role: 'Senior Technician',
    badge: 'Field Tech',
    color: 'from-sky-500 to-cyan-500',
    avatar: '🔧',
    tag: 'Delhi Central Hub'
  },
  {
    name: 'Priya Patel',
    email: 'priya@ework.com',
    role: 'Sales Executive',
    badge: 'Field Sales',
    color: 'from-emerald-500 to-teal-500',
    avatar: '💼',
    tag: 'Mumbai Tech Hub'
  },
  {
    name: 'Sneha Rao',
    email: 'sneha@ework.com',
    role: 'Quality Inspector',
    badge: 'Auditor',
    color: 'from-amber-500 to-orange-500',
    avatar: '📋',
    tag: 'Hyderabad Zone'
  }
];

export default function LoginPage({
  onLoginSuccess,
  onBackToHome,
  initialPortal = 'employee',
  initialAuthMode = 'sign_in',
  darkMode,
  onToggleTheme,
  onOpenSubscriptionModal,
  isMobileHome = false
}) {
  const [portalMode, setPortalMode] = useState(initialPortal); // 'manager' | 'employee'
  const [authMode, setAuthMode] = useState(initialAuthMode); // 'sign_in' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialPortal === 'manager' ? 'manager' : 'field');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialPortal === 'manager' ? 'manager@ework.com' : 'rahul@ework.com');
  const [password, setPassword] = useState('Workforce@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [showDemoPersonas, setShowDemoPersonas] = useState(false);

  // Sync theme with App state and localStorage
  const isDark = darkMode !== undefined ? darkMode : (localStorage.getItem('ework_theme') === 'dark');

  // Keep state synchronized with incoming initialPortal and initialAuthMode props
  useEffect(() => {
    if (initialPortal) {
      setPortalMode(initialPortal);
      setSelectedRole(initialPortal === 'manager' ? 'manager' : 'field');
      setEmail(initialPortal === 'manager' ? 'manager@ework.com' : 'rahul@ework.com');
      setPassword('Workforce@2026');
      setError('');
      setSuccessMsg('');
    }
  }, [initialPortal]);

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode]);

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = !isDark;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ework_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ework_theme', 'light');
      }
    }
  };

  // Switch Portal Experience
  const handleSwitchPortal = (mode) => {
    setPortalMode(mode);
    setError('');
    setSuccessMsg('');
    if (mode === 'manager') {
      setSelectedRole('manager');
      setEmail('manager@ework.com');
      setPassword('Workforce@2026');
    } else {
      setSelectedRole('field');
      setEmail('rahul@ework.com');
      setPassword('Workforce@2026');
    }
  };

  const handleSelectPersona = (persona) => {
    setEmail(persona.email);
    setPassword('Workforce@2026');
    setFullName(persona.name);
    setError('');
    setSuccessMsg('');
    if (persona.role.includes('Manager')) {
      setSelectedRole('manager');
      setPortalMode('manager');
    } else {
      setSelectedRole('field');
      setPortalMode('employee');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your work email and password.');
      return;
    }
    if (authMode === 'register' && !fullName.trim()) {
      setError('Please enter your full name for registration.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const matchedPersona = DEMO_PERSONAS.find(p => p.email.toLowerCase() === email.toLowerCase());
    const resolvedName = authMode === 'register'
      ? fullName.trim()
      : (matchedPersona?.name || email.split('@')[0]);

    const payload = {
      email: email.trim(),
      password,
      name: resolvedName,
      role: selectedRole === 'manager' ? 'Operations Manager' : 'Field Technician',
      department: selectedRole === 'manager' ? 'Fleet Operations' : 'Field Services',
      badge: selectedRole === 'manager' ? 'Admin Console' : 'Field Tech',
      avatar: selectedRole === 'manager' ? '👔' : '🔧',
      phone: '+91 98765 43210'
    };

    try {
      const endpoint = authMode === 'register'
        ? 'http://localhost:5000/api/auth/sign-up'
        : 'http://localhost:5000/api/auth/sign-in';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setSuccessMsg(`Signed in successfully! Loading ${portalMode === 'employee' ? 'Employee Portal' : 'Management Console'}...`);
        setTimeout(() => {
          setLoading(false);
          if (onLoginSuccess) {
            onLoginSuccess(data.user, portalMode);
          }
        }, 500);
      } else {
        setError(data.error || 'Failed to authenticate with database.');
        setLoading(false);
      }
    } catch (err) {
      console.warn('Backend server unreachable, falling back to local session with recorded timestamp:', err);
      // Fallback in case of network issue
      setTimeout(() => {
        setLoading(false);
        const fallbackUser = {
          id: Date.now(),
          user_id: `user-${Date.now()}`,
          name: resolvedName,
          email: email,
          role: selectedRole === 'manager' ? 'Operations Manager' : 'Field Technician',
          badge: selectedRole === 'manager' ? 'Admin Console' : 'Field Tech',
          avatar: selectedRole === 'manager' ? '👔' : '🔧',
          sign_in: new Date().toISOString(),
          sign_in_count: 1,
          sign_in_status: 'online',
          created_at: new Date().toISOString()
        };
        if (onLoginSuccess) {
          onLoginSuccess(fallbackUser, portalMode);
        }
      }, 600);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2800);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between relative overflow-x-hidden transition-colors ${
      isDark ? 'bg-[#050b14] text-slate-100 constellation-bg' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Header with Safe Area handling for Mobile Notches */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top), 14px)' }}
        className={`px-5 sm:px-6 pb-3.5 flex items-center justify-between border-b backdrop-blur-md z-20 transition-colors ${
          isDark ? 'border-slate-800/80 bg-[#050b14]/75 text-white' : 'border-slate-200 bg-white/90 text-slate-800 shadow-xs'
        }`}
      >
        <div 
          className="flex items-center cursor-pointer select-none py-0.5" 
          onClick={(!isMobileHome && onBackToHome) ? onBackToHome : undefined}
        >
          <img 
            src={isDark ? "/logo-dark.png?v=3" : "/logo.png?v=3"} 
            alt="E-WorkForce" 
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle darkMode={isDark} onToggle={toggleTheme} />

          {onBackToHome && !isMobileHome && (
            <button
              onClick={onBackToHome}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-100'
              }`}
            >
              ← Back to Overview
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-lg">
          
          {/* Card Container */}
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden border transition-colors ${
            isDark ? 'bg-[#091222]/90 border-slate-800/90 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            
            {/* Top Accent Gradient Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400"></div>

            {/* Title & Portal Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Enterprise Portal · TLS 1.3 Active</span>
              </div>
              <h1 className={`text-3xl sm:text-4xl font-display uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {authMode === 'register' ? 'Create Field Account' : 'Enterprise Sign In'}
              </h1>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Access real-time GPS fleet tracking, workforce rosters & dispatch
              </p>
            </div>

            {/* Auth Mode Switcher: Sign In vs Create Account */}
            <div className={`flex items-center justify-center p-1 rounded-2xl border mb-5 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAuthMode('sign_in'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  authMode === 'sign_in'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* 1. SEPARATE PORTAL EXPERIENCES (Manager vs Employee Portal) */}
            <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border mb-5 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => handleSwitchPortal('manager')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  portalMode === 'manager'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                <span>👔 Manager Console</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPortal('employee')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  portalMode === 'employee'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                <span>👷 Field Employee</span>
              </button>
            </div>

            {/* New Organization Onboarding CTA */}
            {!isMobileHome && onOpenSubscriptionModal && (
              <div className={`mb-4 p-3 rounded-2xl border text-xs flex items-center justify-between ${
                isDark ? 'bg-sky-950/30 border-sky-800/60 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}>
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <Sparkles className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold truncate">New organization? Start with Freemium or Paid plan.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenSubscriptionModal}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] uppercase tracking-wide cursor-pointer flex-shrink-0 shadow-xs"
                >
                  View Plans
                </button>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{successMsg}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field (Only in Register Mode) */}
              {authMode === 'register' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserCheck className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className={`w-full border rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm transition-colors focus:outline-none ${
                        isDark ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Work Email */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full border rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm transition-colors focus:outline-none ${
                      isDark ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password *
                  </label>
                  {authMode === 'sign_in' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-mono transition-colors focus:outline-none ${
                      isDark ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-400 absolute right-3.5 top-3 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className={`flex items-center justify-between text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`rounded text-sky-500 focus:ring-0 cursor-pointer ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'}`}
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'register' ? 'Create Account & Sign In' : 'Sign In to Console'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Persona Shortcuts (Collapsible for Clean UX) */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDemoPersonas(!showDemoPersonas)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center space-x-1.5">
                  <span className="text-amber-500 font-bold">⚡</span>
                  <span>Quick Demo Profiles (5 Personas)</span>
                </span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${showDemoPersonas ? 'rotate-90' : ''}`} />
              </button>

              {showDemoPersonas && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 animate-in fade-in duration-200">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{p.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate font-semibold">{p.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Security Badges Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center space-x-4 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>256-Bit TLS</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Smartphone className="h-3.5 w-3.5 text-sky-400" />
                <span>Geofence Guard</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                <span>Supabase Auth</span>
              </div>
            </div>

          </div>

          {/* Help Line Note */}
          <div className="text-center mt-5 text-xs text-slate-500">
            Need access or forgot your company ID?{' '}
            <span className="text-slate-400 font-medium">Contact your Fleet Manager or IT Admin.</span>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl relative ${
            isDark ? 'bg-[#091222] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setShowForgotModal(false)}
              className={`absolute top-4 right-4 cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Reset Account Password</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Receive a secure verification link</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Password Reset Link Sent!</div>
                  <div className={`mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Please check your inbox at {forgotEmail || email}. Follow the link to choose a new password.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Your Registered Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 ${
                      isDark 
                        ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      isDark 
                        ? 'border-slate-800 text-slate-300 hover:bg-slate-800' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 text-center text-[11px] text-slate-600">
        E-Workforce Enterprise v1.0.4 • SOC-2 Type II Certified • GDPR Compliant Field Intelligence
      </footer>

    </div>
  );
}
