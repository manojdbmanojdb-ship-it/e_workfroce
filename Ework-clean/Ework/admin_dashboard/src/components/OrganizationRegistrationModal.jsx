import React, { useState, useEffect } from 'react';
import { X, Building, Mail, Phone, Briefcase, Users, User, Lock, Key, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const INDUSTRIES = [
  'HVAC & Electrical Maintenance',
  'Field Logistics & Express Delivery',
  'Facilities & Property Management',
  'Safety & Environmental Auditing',
  'Security Patrol & Guard Services',
  'Telecom & Fiber Installation',
  'Solar & Clean Energy Maintenance',
  'Pharmaceutical & Medical Sales'
];

const ORG_SIZES = [
  '1-10 employees (Startup / Small Team)',
  '11-50 employees (Growing Business)',
  '51-200 employees (Mid-Market Fleet)',
  '200+ employees (Enterprise Scale)'
];

export default function OrganizationRegistrationModal({
  isOpen,
  onClose,
  initialPlan = 'free', // 'free' | 'professional' | 'enterprise'
  prefilledLicenseKey = '',
  prefilledOrgName = '',
  prefilledEmail = '',
  prefilledManagerName = '',
  onRegistrationSuccess,
  darkMode = false
}) {
  if (!isOpen) return null;

  const [plan, setPlan] = useState(initialPlan);
  const [orgName, setOrgName] = useState(prefilledOrgName);
  const [businessEmail, setBusinessEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState('+91 98');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [orgSize, setOrgSize] = useState(ORG_SIZES[0]);

  const [managerName, setManagerName] = useState(prefilledManagerName);
  const [managerEmail, setManagerEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('Workforce@2026');
  const [confirmPassword, setConfirmPassword] = useState('Workforce@2026');

  const [licenseKey, setLicenseKey] = useState(prefilledLicenseKey);
  const [keyValidation, setKeyValidation] = useState(null); // { valid, planName, error }
  const [validatingKey, setValidatingKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill props when modal opens with new prefill data
  useEffect(() => {
    if (initialPlan) setPlan(initialPlan);
    if (prefilledLicenseKey) setLicenseKey(prefilledLicenseKey);
    if (prefilledOrgName) setOrgName(prefilledOrgName);
    if (prefilledEmail) {
      setBusinessEmail(prefilledEmail);
      setManagerEmail(prefilledEmail);
    }
    if (prefilledManagerName) setManagerName(prefilledManagerName);
  }, [initialPlan, prefilledLicenseKey, prefilledOrgName, prefilledEmail, prefilledManagerName]);

  // Live Verify License Key
  const handleVerifyKey = async (keyToTest) => {
    const key = keyToTest || licenseKey;
    if (!key || !key.trim()) return;

    setValidatingKey(true);
    setKeyValidation(null);

    try {
      const res = await fetch('/api/subscriptions/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key.trim().toUpperCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKeyValidation({ valid: true, plan: data.plan, planName: data.planName });
        setPlan(data.plan.toLowerCase());
      } else {
        setKeyValidation({ valid: false, error: data.error || 'Invalid or already activated license key.' });
      }
    } catch (err) {
      setKeyValidation({ valid: false, error: err.message });
    } finally {
      setValidatingKey(false);
    }
  };

  // Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (plan !== 'free' && (!licenseKey || !licenseKey.trim())) {
      setError('A valid license key is required to register on the Professional or Enterprise tier.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/subscriptions/register-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          businessEmail,
          phone,
          industry,
          orgSize,
          managerName,
          managerEmail,
          password,
          confirmPassword,
          plan,
          licenseKey: plan !== 'free' ? licenseKey.trim().toUpperCase() : null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Organization registration failed.');
      }

      setSuccessMsg(data.message || 'Organization registered successfully! Launching your Management Console...');

      setTimeout(() => {
        onClose();
        if (onRegistrationSuccess) {
          onRegistrationSuccess(data.user, data.organization, data.subscription);
        }
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPaidPlan = plan === 'professional' || plan === 'enterprise';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        darkMode ? 'bg-[#091120] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                plan === 'free'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
              }`}>
                {plan === 'free' ? 'Freemium Organization Onboarding' : `${plan.toUpperCase()} Organization Onboarding`}
              </span>
              <span className="text-xs text-slate-500">• 1-Step Setup</span>
            </div>
            <h3 className="text-xl font-black mt-1">Register Your Organization</h3>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Plan Pill Switcher */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl border bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            {[
              { id: 'free', label: 'Free ($0/mo • 5 Staff)' },
              { id: 'professional', label: 'Professional (100 Staff)' },
              { id: 'enterprise', label: 'Enterprise (1,000 Staff)' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setPlan(p.id); setError(''); }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  plan === p.id
                    ? p.id === 'free'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Organization Details */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-3 flex items-center space-x-1.5">
              <Building className="h-3.5 w-3.5" />
              <span>1. Organization &amp; Business Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Organization / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Field Operations"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Official Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@acmefield.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111-22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Industry / Operational Domain
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Organization Size
                </label>
                <select
                  value={orgSize}
                  onChange={(e) => setOrgSize(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                >
                  {ORG_SIZES.map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Manager Account Details */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-3 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5" />
              <span>2. Organization Manager Account (Administrator)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sharma"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Manager Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="manager@acmefield.com"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Account Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: License Key (Mandatory for Paid, Not Required for Free) */}
          {isPaidPlan ? (
            <div className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-slate-900/70 border-sky-500/30' : 'bg-blue-50/70 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Key className="h-4 w-4 text-sky-500" />
                  <span>Organization License Key *</span>
                </label>
                <span className="text-[10px] text-sky-500 font-semibold uppercase">
                  Required for {plan.toUpperCase()}
                </span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. EWF-PRO-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setKeyValidation(null);
                  }}
                  className={`flex-1 px-3 py-2 text-xs rounded-xl border font-mono tracking-wider focus:outline-none transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleVerifyKey()}
                  disabled={validatingKey || !licenseKey.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {validatingKey ? 'Verifying...' : 'Verify Key'}
                </button>
              </div>

              {/* Validation status pill */}
              {keyValidation && (
                <div className={`mt-2 text-[11px] flex items-center space-x-1.5 ${
                  keyValidation.valid ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {keyValidation.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  <span>
                    {keyValidation.valid
                      ? `Valid key for ${keyValidation.planName}! 365 days license ready.`
                      : keyValidation.error}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
              darkMode ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>
                <strong>Free Tier Active:</strong> No license key or credit card required. Your organization will be provisioned instantly with a 5 employee limit.
              </span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50 ${
                plan === 'free'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-sky-500/25'
              }`}
            >
              <span>{loading ? 'Creating Organization & Manager Account...' : 'Complete Registration & Launch Console'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
