import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPasswordScreen: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    showToast('Reset verification link dispatched to your email', 'success');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-white select-none safe-top safe-bottom">
      {/* Top back button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigateTo('login')}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Account Recovery
        </span>
      </div>

      {/* Main Form */}
      <div className="my-auto max-w-sm mx-auto w-full">
        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-6">
          <KeyRound className="h-7 w-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
          Enter your registered enterprise work email. We will send a secure 6-digit one-time password (OTP) and recovery link.
        </p>

        {submitted ? (
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Recovery Link Dispatched</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Check your inbox at <strong className="text-slate-900 dark:text-white">{email}</strong>. Follow the instructions to reset your password.
            </p>
            <button
              onClick={() => navigateTo('login')}
              className="w-full mt-3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
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
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#0b1322] border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Send Recovery Link</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        Need assistance? Contact your Fleet Manager or IT Helpdesk.
      </div>
    </div>
  );
};
