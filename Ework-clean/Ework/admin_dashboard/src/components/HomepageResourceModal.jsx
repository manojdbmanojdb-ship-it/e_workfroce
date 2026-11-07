import React from 'react';
import { X, Shield, FileText, HelpCircle, BookOpen, Mail, Briefcase, CheckCircle2 } from 'lucide-react';

export default function HomepageResourceModal({ isOpen, onClose, modalType }) {
  if (!isOpen || !modalType) return null;

  const contentMap = {
    about: {
      icon: Shield,
      title: 'About E-Workforce',
      subtitle: 'Field Workforce Operating System • Enterprise Reliability',
      badge: '99.98% SLA Guaranteed',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-white">E-Workforce</strong> is engineered from the ground up for high-reliability field employee tracking, offline job execution, and cryptographic proof-of-work verification.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-sky-600 dark:text-sky-400 text-xs uppercase tracking-wider">Offline-First Resilience</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Technicians in basements, concrete shafts, or rural transit points work without interruption. Check-ins, signatures, and photos queue securely on-device and sync immediately upon reconnection.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xl font-black font-mono text-sky-600 dark:text-sky-400">99.98%</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">Uptime SLA</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">150m</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">Geofence Radius</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">100%</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">Offline Caching</div>
            </div>
          </div>
        </div>
      ),
    },
    privacy: {
      icon: Shield,
      title: 'Privacy Policy',
      subtitle: 'Last updated: November 2026 • Enterprise Compliance',
      badge: 'SOC-2 Type II & GDPR Compliant',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            At <strong className="text-slate-900 dark:text-white">E-Workforce</strong>, protecting the privacy and integrity of your field personnel data is foundational to our architecture. This policy explains how location, proof-of-work, and attendance data are collected, processed, and safeguarded.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">1. GPS Location Scoping</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              GPS telemetry is activated exclusively when field workers punch in for an active work shift. Background location polling terminates automatically upon clock-out. Real-time geofence validations are computed with on-device boundaries to prevent unnecessary data transmission.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">2. Cryptographic Proof of Work</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Task completion photos, digital customer signatures, and location coordinates are cryptographically hashed using SHA-256 before storage in our immutable audit trail to eliminate tampering.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">3. Data Retention & Access Control</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Role-based access controls (RBAC) ensure field staff only view their own tasks, while authorized dispatchers manage assigned regional teams. All transmissions are encrypted in-transit via TLS 1.3 and at-rest via AES-256.
            </p>
          </div>
        </div>
      ),
    },
    terms: {
      icon: FileText,
      title: 'Terms of Service',
      subtitle: 'Master Subscription Agreement • Effective 2026',
      badge: '99.98% SLA Enterprise Guarantee',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            These Terms of Service govern your use of the E-Workforce cloud platform, mobile applications, and accompanying telemetry APIs.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">1. Authorized Operational Use</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Subscribers agree to deploy E-Workforce tracking exclusively for legitimate business scheduling, geofenced job verification, and fleet dispatch. Tampering with mock locations or mock GPS emulators violates our fair-use policy.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">2. Service Level Agreement</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              E-Workforce guarantees 99.98% platform availability across dispatch web portals, WebSocket broadcast brokers, and mobile sync engines. Offline client resilience ensures uninterrupted site operations during network blackouts.
            </p>
          </div>
        </div>
      ),
    },
    documentation: {
      icon: BookOpen,
      title: 'Documentation & Guides',
      subtitle: 'Developer APIs, PWA Setup & Field Dispatch Handbooks',
      badge: 'SDK v2.4 Released',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>Comprehensive setup guides for managers, field teams, and system administrators:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { title: 'Mobile PWA Installation', desc: 'Add E-Workforce to iOS & Android homescreens with offline GPS persistence.' },
              { title: 'Geofence Polygon Engine', desc: 'Draw custom client job zones and configure automated punch triggers.' },
              { title: 'Offline Conflict Resolution', desc: 'How SQLite and IndexedDB sync queues reconcile concurrent task edits.' },
              { title: 'Hardware GPS Telemetry', desc: 'Battery-optimized foreground service setup for zero-drain route tracing.' },
            ].map((doc, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    help: {
      icon: HelpCircle,
      title: 'Help Center & Knowledge Base',
      subtitle: 'Troubleshooting, FAQ & Live Support Assistance',
      badge: '24/7 Priority Support',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="space-y-2.5">
            {[
              {
                q: 'What happens if a technician loses cell service on site?',
                a: 'The technician can continue punching shifts, taking photos, and collecting customer signatures offline. All data is queued in local encrypted storage and immediately uploaded once network connectivity is re-established.'
              },
              {
                q: 'How does geofencing check-in work?',
                a: 'The system computes the Haversine distance between the worker\'s GPS coordinates and the client destination. Punch-in is granted only when inside the verified site boundary.'
              },
              {
                q: 'Can managers track employee locations off-shift?',
                a: 'No. GPS location tracking is rigorously bounded to active working shifts. Background polling shuts down as soon as the employee clocks out.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Q: {faq.q}</h5>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    contact: {
      icon: Mail,
      title: 'Contact Engineering & Sales',
      subtitle: 'Get in touch with the E-Workforce deployment team',
      badge: 'Under 1hr Response SLA',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            Whether you need enterprise on-premise licensing, custom hardware GPS gateway integration, or dedicated onboarding, our team is ready to assist:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Direct Inquiries</span>
              <p className="font-mono text-xs text-slate-900 dark:text-white font-bold mt-1">support@eworkforce.io</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Enterprise dispatch & SLA escalations</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Sales & Demos</span>
              <p className="font-mono text-xs text-slate-900 dark:text-white font-bold mt-1">sales@eworkforce.io</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Custom fleet deployments & billing</p>
            </div>
          </div>
        </div>
      ),
    },
    careers: {
      icon: Briefcase,
      title: 'Careers at E-Workforce',
      subtitle: 'Build the operating system powering 250,000+ field technicians',
      badge: '4 Open Engineering Roles',
      content: (
        <div className="space-y-3">
          {[
            { role: 'Staff Distributed Systems Engineer', team: 'Core Telemetry Engine', loc: 'Remote / Hybrid' },
            { role: 'Senior React & Mobile PWA Engineer', team: 'Field Worker UX', loc: 'Remote' },
            { role: 'Senior Security & Cryptography Engineer', team: 'Proof-of-Work Trust Layer', loc: 'Remote' },
            { role: 'Product Solutions Architect', team: 'Enterprise Fleet Onboarding', loc: 'San Francisco, CA' },
          ].map((job, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">{job.role}</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.team} • {job.loc}</p>
              </div>
              <button 
                onClick={() => alert(`Thank you for your interest in ${job.role}! Please send your resume to careers@eworkforce.io.`)}
                className="px-3 py-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      ),
    },
  };

  const activeContent = contentMap[modalType] || contentMap.privacy;
  const Icon = activeContent.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#091120] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl p-6 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeContent.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {activeContent.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeContent.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-5 overflow-y-auto flex-1 pr-1">
          {activeContent.content}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Official E-Workforce Platform Documentation</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
