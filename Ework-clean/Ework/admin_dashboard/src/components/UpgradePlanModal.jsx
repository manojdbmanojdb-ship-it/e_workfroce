import React, { useState } from 'react';
import { X, ShieldCheck, Zap, Sparkles, Key, CheckCircle2, AlertCircle, ArrowRight, CreditCard, Building } from 'lucide-react';

export default function UpgradePlanModal({
  isOpen,
  onClose,
  currentUser,
  currentSubscription,
  onUpgradeSuccess,
  onBuyLicense,
  darkMode = false
}) {
  if (!isOpen) return null;

  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPlan = currentSubscription?.plan || 'free';
  const orgName = currentSubscription?.org_name || currentUser?.name || 'Organization';

  const handleApplyLicense = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Please enter a valid license key.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orgId = currentUser?.organization_id || 'org-demo-default';
      const res = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'manager@ework.com'
        },
        body: JSON.stringify({
          organizationId: orgId,
          licenseKey: licenseKey.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upgrade subscription.');
      }

      setSuccess(`Upgrade successful! Your organization is now on the ${data.subscription.plan.toUpperCase()} plan.`);
      setTimeout(() => {
        onClose();
        if (onUpgradeSuccess) {
          onUpgradeSuccess(data.subscription);
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 ${
        darkMode ? 'bg-[#091120] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                In-Place SaaS Upgrade
              </span>
              <span className="text-xs text-slate-500 font-mono">No Data Loss</span>
            </div>
            <h3 className="text-lg font-black mt-0.5">Upgrade Subscription Plan</h3>
          </div>
        </div>

        {/* Current Plan Summary Card */}
        <div className={`p-4 rounded-2xl border mb-5 ${
          darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Plan</div>
              <div className="text-base font-black capitalize text-slate-900 dark:text-white mt-0.5">
                {currentPlan} Plan
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
              currentPlan === 'free'
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
            }`}>
              {currentPlan === 'free' ? '5 Staff Limit' : 'Active Paid'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
            Upgrading immediately increases your field employee capacity to <strong>100</strong> (Pro) or <strong>1,000</strong> (Enterprise), unlocks emergency SOS alerts, and enables turn-by-turn route history.
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form: Enter License Key */}
        <form onSubmit={handleApplyLicense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Enter Organization License Key
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="EWF-PRO-XXXX-XXXX or EWF-ENT-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2.5 text-xs font-mono tracking-wider rounded-xl border focus:outline-none transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
              <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Demo Keys available: <code className="text-sky-500">EWF-PRO-TEST-9921</code> or <code className="text-sky-500">EWF-ENT-2026-DEMO</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Validating & Upgrading...' : 'Activate License & Upgrade Now'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Don't have a license key yet?</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Buy License Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onBuyLicense) {
              onBuyLicense('professional');
            }
          }}
          className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            darkMode
              ? 'border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
          }`}
        >
          <CreditCard className="h-4 w-4 text-sky-500" />
          <span>Purchase a License Key via Online Gateway / UPI</span>
        </button>

      </div>
    </div>
  );
}
