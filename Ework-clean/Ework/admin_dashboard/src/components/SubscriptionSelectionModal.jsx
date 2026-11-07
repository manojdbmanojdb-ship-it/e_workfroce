import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles, ArrowRight, Building, Key, CreditCard } from 'lucide-react';

export const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    badge: '100% Free',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    price: '$0',
    period: 'forever free',
    description: 'Essential field tracking and proof-of-work for small teams and startups.',
    employeeLimit: 'Up to 5 field employees',
    accentColor: 'from-emerald-500 to-teal-500',
    buttonText: 'Start Free Now',
    buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    features: [
      { text: 'Up to 5 field employees', bold: true },
      { text: 'Live GPS map tracking', bold: false },
      { text: '150m geofenced check-in', bold: false },
      { text: 'Photo & digital signature proof', bold: false },
      { text: 'Offline-first task punch & caching', bold: false },
      { text: 'Dedicated employee web portal', bold: false },
      { text: 'No credit card or license needed', bold: true }
    ],
    proExcluded: [
      'Turn-by-turn route playback history',
      'Automated mileage & payroll reports',
      'Emergency SOS panic alert broadcast',
      'Multi-site custom polygon zones'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Team',
    badge: 'Most Popular',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-400/30',
    popular: true,
    price: '$19',
    period: 'per month',
    description: 'Complete operational dispatch, turn-by-turn route history, and emergency SOS.',
    employeeLimit: 'Up to 100 field staff',
    accentColor: 'from-blue-600 via-sky-500 to-cyan-400',
    buttonText: 'Get Started with Pro',
    buttonStyle: 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/25',
    features: [
      { text: 'Up to 100 field personnel', bold: true },
      { text: 'Turn-by-turn route trail playback', bold: true },
      { text: 'Automated fuel & mileage calculator', bold: false },
      { text: 'Emergency SOS panic alert broadcast', bold: true },
      { text: 'PDF audit certificates & Excel exports', bold: false },
      { text: 'Live speed & battery level telemetry', bold: false },
      { text: 'Priority 24/7 technical support', bold: false }
    ],
    proExcluded: [
      'Multi-hub custom polygon boundaries',
      'Custom webhook REST API integration'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    badge: 'Mission Critical',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
    price: '$49',
    period: 'per month',
    description: 'High-volume field dispatch, multi-hub polygon zones, and 99.98% SLA.',
    employeeLimit: 'Up to 1,000 field staff',
    accentColor: 'from-indigo-600 via-purple-600 to-pink-500',
    buttonText: 'Get Started with Enterprise',
    buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25',
    features: [
      { text: 'Up to 1,000 field staff & multi-hubs', bold: true },
      { text: 'Multi-site custom polygon geofencing', bold: true },
      { text: 'Cryptographic SHA-256 audit proof', bold: true },
      { text: 'Custom webhooks & REST API gateway', bold: false },
      { text: '99.98% enterprise uptime SLA', bold: true },
      { text: 'Dedicated solutions architect', bold: false },
      { text: 'Custom billing & corporate invoicing', bold: false }
    ],
    proExcluded: []
  }
];

export default function SubscriptionSelectionModal({
  isOpen,
  onClose,
  onSelectPlan,
  onDirectLicenseEntry,
  darkMode = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        darkMode ? 'bg-[#060d19] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-6 sm:p-8 text-center border-b relative ${
          darkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Freemium &amp; Enterprise Subscription Platform</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Choose the Perfect Plan for Your Workforce
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get started 100% free with immediate organization onboarding, or scale your fleet with our high-capacity Professional and Enterprise tiers.
          </p>

          {/* Quick License Key Bypass Pill */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => {
                onClose();
                onDirectLicenseEntry && onDirectLicenseEntry();
              }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-sky-500 dark:text-sky-400 hover:underline cursor-pointer bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 px-3.5 py-1.5 rounded-full"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Already have an organization license key? Click here to register directly</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? darkMode
                      ? 'bg-gradient-to-b from-blue-950/40 via-slate-900/80 to-[#060d19] border-sky-500/60 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/40'
                      : 'bg-gradient-to-b from-blue-50/70 via-white to-sky-50/30 border-blue-500 shadow-xl shadow-blue-500/10'
                    : darkMode
                    ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                    Recommended Fleet Plan
                  </div>
                )}

                <div>
                  {/* Badge & Title */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {plan.employeeLimit}
                    </span>
                  </div>

                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 min-h-[34px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 mb-6 flex items-baseline space-x-1.5">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className={feat.bold ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>
                          {feat.text}
                        </span>
                      </div>
                    ))}

                    {/* Excluded items in lower tiers */}
                    {plan.proExcluded.map((ex, idx) => (
                      <div key={idx} className="flex items-start space-x-2 opacity-40 text-slate-400 dark:text-slate-600 line-through">
                        <span className="h-4 w-4 flex items-center justify-center flex-shrink-0 text-[10px]">✕</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectPlan(plan.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${plan.buttonStyle}`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-2 text-[10px] text-center text-slate-500">
                    {plan.id === 'free' ? 'Instant activation • No payment required' : 'Verified organization license key included'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className={`px-6 py-4 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-2 ${
          darkMode ? 'border-slate-800/80 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Need a custom enterprise contract, on-premise installation, or custom hardware GPS gateway?</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onSelectPlan('enterprise');
            }}
            className="font-bold text-sky-500 hover:underline cursor-pointer"
          >
            Contact Enterprise Sales →
          </button>
        </div>

      </div>
    </div>
  );
}
