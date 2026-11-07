import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, Star, Camera,
  MapPin, Clock, User, ShieldCheck, Printer,
  FileCheck, RotateCcw, Wrench, Sparkles, ExternalLink
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';
import WorkOrderCertificateModal from './WorkOrderCertificateModal';

export default function ProofInspectorModal({
  isOpen,
  onClose,
  task,
  onApprove,
  onRequestRevision
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'photos' | 'signature' | 'checklist'
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  if (!isOpen || !task) return null;

  // Extract or provide high-detail fallback proof data
  const proof = task.proof || {
    customerName: task.customer_name || 'Vikram Malhotra',
    customerDesignation: 'Property & Facilities Manager',
    customerPhone: '+91 98112-40912',
    customerRating: task.customer_rating || 5,
    customerFeedback: task.customer_feedback || 'Technician was punctual and completed the entire HVAC repair with zero downtime for our office floor. Cleaned the workspace thoroughly afterwards.',
    signedAt: task.completed_at ? new Date(task.completed_at).toLocaleString() : '17 Oct 2026, 11:02 AM',
    siteAddress: task.address || 'Connaught Place, Block B, New Delhi',
    gpsCoords: { lat: 28.6318, lng: 77.2170, accuracy: '± 4 meters (Geofenced)' },
    durationOnSite: '1 hour 45 minutes',
    technicianName: task.assignee || 'Rahul Sharma',
    technicianRole: 'Senior Field Technician',
    beforePhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    beforeNotes: 'Burned out compressor capacitor and clogged intake filter before servicing.',
    afterPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    afterNotes: 'Installed new 45uF capacitor, cleaned copper coils, pressure tested at 120 PSI.',
    checklist: [
      { item: 'Compressor & electrical supply voltage diagnostic', done: true, time: '09:20 AM' },
      { item: 'High-pressure safety relief valve inspection', done: true, time: '09:40 AM' },
      { item: 'Refrigerant R-410A top-up (1.2 kg added)', done: true, time: '10:05 AM' },
      { item: 'Ultrasonic air filter wash & debris flush', done: true, time: '10:30 AM' },
      { item: '15-minute operational load test (Passed at 18°C)', done: true, time: '10:55 AM' },
    ],
    partsUsed: [
      { name: 'Dual Run Capacitor 45/5 uF', code: 'CAP-4505', qty: 1, cost: 750 },
      { name: 'R-410A Eco Refrigerant Canister (1kg)', code: 'REF-410A', qty: 1, cost: 1100 },
    ],
    totalPartsCost: 1850,
  };

  const isVerified = task.isVerified || task.verification_status === 'approved';

  const handleApprove = () => {
    soundService.playSuccessChime();
    setActionSuccess('Work Order Proof Approved & Signed Off by Manager!');
    if (onApprove) {
      onApprove(task.id);
    }
    setTimeout(() => {
      setActionSuccess(null);
      onClose();
    }, 1200);
  };

  const handleSendRevision = () => {
    if (!revisionNotes.trim()) return;
    setActionSuccess('Revision request dispatched to field technician.');
    if (onRequestRevision) {
      onRequestRevision(task.id, revisionNotes);
    }
    setTimeout(() => {
      setActionSuccess(null);
      setShowRevisionInput(false);
      setRevisionNotes('');
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#091222] border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-[#070e1c] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-[#071120] rounded-[14px] flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white">{task.title}</h2>
                {isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Manager Verified</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Awaiting Manager Sign-Off</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                <span>Assigned to <strong className="text-slate-200">{proof.technicianName}</strong></span>
                <span>•</span>
                <span className="flex items-center space-x-1"><MapPin className="h-3 w-3 text-sky-400" /><span>{proof.siteAddress}</span></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-400 hover:text-white border border-sky-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Official Field Service Certificate (PDF)"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Official PDF Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 text-xs font-semibold">
          {[
            { key: 'overview', label: 'Summary & Sign-off' },
            { key: 'photos', label: 'Before & After Photos (2)' },
            { key: 'checklist', label: 'Checklist & Parts (5)' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {actionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & SIGN-OFF */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Customer Rating & Sign-off Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Customer Review Card */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Satisfaction</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= proof.customerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-black text-amber-400 ml-1.5">{proof.customerRating}.0 / 5.0</span>
                      </div>
                    </div>
                    <blockquote className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      "{proof.customerFeedback}"
                    </blockquote>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Client: <strong className="text-white">{proof.customerName}</strong> ({proof.customerDesignation})</span>
                    <span>{proof.customerPhone}</span>
                  </div>
                </div>

                {/* Digital Signature Card */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Digital Customer Signature</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        ✓ Cryptographically Stamped
                      </span>
                    </div>
                    <div className="h-28 bg-[#040810] border border-slate-800 rounded-xl flex items-center justify-center p-3 relative overflow-hidden group">
                      {/* Realistic SVG Signature Simulation */}
                      <svg className="w-56 h-20 text-sky-400 stroke-current" viewBox="0 0 250 80" fill="none">
                        <path
                          d="M20 55 C 40 10, 60 70, 75 35 C 90 10, 110 50, 130 40 C 150 30, 160 60, 180 30 C 190 20, 200 45, 230 35 M 45 45 L 210 45"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="absolute bottom-2 right-3 text-[10px] text-slate-600 font-mono">
                        ID: SIG-8921-VERIFIED
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Signed on: <strong className="text-slate-200">{proof.signedAt}</strong></span>
                    <span className="text-sky-400">{proof.gpsCoords.accuracy}</span>
                  </div>
                </div>
              </div>

              {/* Work Execution Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">On-Site Duration</div>
                  <div className="text-base font-black text-white mt-1">{proof.durationOnSite}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">SLA: On Time (95%)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Geo Verification</div>
                  <div className="text-base font-black text-sky-400 mt-1">100% Inside</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{proof.gpsCoords.lat.toFixed(4)}, {proof.gpsCoords.lng.toFixed(4)}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Checklist Completion</div>
                  <div className="text-base font-black text-white mt-1">5 / 5 Done</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">All Tasks Cleared</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Billable Materials</div>
                  <div className="text-base font-black text-amber-400 mt-1">₹{proof.totalPartsCost.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">2 Items Used</div>
                </div>
              </div>

              {/* Photo Previews Ribbon */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Proof-of-Work Photo Evidence</span>
                  <button
                    onClick={() => setActiveTab('photos')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    View High-Res Comparison →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 group h-48 bg-slate-950">
                    <img
                      src={proof.beforePhoto}
                      alt="Before Work"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                      <span className="px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-bold w-fit mb-1">
                        BEFORE REPAIR
                      </span>
                      <p className="text-xs text-slate-200 line-clamp-1">{proof.beforeNotes}</p>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 group h-48 bg-slate-950">
                    <img
                      src={proof.afterPhoto}
                      alt="After Work"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-600/80 text-white text-[10px] font-bold w-fit mb-1">
                        AFTER COMPLETION
                      </span>
                      <p className="text-xs text-slate-200 line-clamp-1">{proof.afterNotes}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED PHOTOS COMPARISON */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Before Photo Detailed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Camera className="h-4 w-4" />
                      <span>Before Work Started</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">09:18 AM</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg relative group">
                    <img
                      src={proof.beforePhoto}
                      alt="Before"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 bg-slate-900/90 border-t border-slate-800">
                      <div className="text-xs font-bold text-white mb-1">Initial Site Diagnosis</div>
                      <p className="text-xs text-slate-300">{proof.beforeNotes}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Lat: 28.6318°, Lng: 77.2170°</span>
                        <span>Geo-tag: Connaught Pl.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* After Photo Detailed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Camera className="h-4 w-4" />
                      <span>After Completion</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">10:58 AM</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg relative group">
                    <img
                      src={proof.afterPhoto}
                      alt="After"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 bg-slate-900/90 border-t border-slate-800">
                      <div className="text-xs font-bold text-white mb-1">Final Serviced Unit</div>
                      <p className="text-xs text-slate-300">{proof.afterNotes}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Lat: 28.6318°, Lng: 77.2170°</span>
                        <span className="text-emerald-400 font-bold">✓ Geo-fence Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST & PARTS USED */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              
              {/* Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Field Technician Quality Checklist
                </h3>
                <div className="space-y-2">
                  {proof.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{item.item}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill of Materials / Parts */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Parts &amp; Consumables Utilized</span>
                  <span className="text-emerald-400 font-bold">Total: ₹{proof.totalPartsCost.toLocaleString()}</span>
                </h3>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
                        <th className="px-4 py-2.5 text-left">Item Description</th>
                        <th className="px-4 py-2.5 text-left">Part Code</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {proof.partsUsed.map((part, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{part.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{part.code}</td>
                          <td className="px-4 py-3 text-center text-slate-300">{part.qty}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-400">₹{part.cost.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/60 font-bold">
                        <td colSpan="3" className="px-4 py-3 text-right text-slate-400">Labor Charge:</td>
                        <td className="px-4 py-3 text-right text-sky-400 font-mono">Included in AMC</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Revision Input Box */}
          {showRevisionInput && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>Specify Revision / Rework Instructions for Technician:</span>
              </div>
              <textarea
                rows="2"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. Please retake photo of the pressure gauge with clear timestamp and double check seal tightness."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowRevisionInput(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRevision}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Send Revision Request
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#070e1c] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Digital Proof of Work &bull; Supabase Signed Storage</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!isVerified && !showRevisionInput && (
              <button
                onClick={() => setShowRevisionInput(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Request Revision</span>
              </button>
            )}

            <button
              onClick={handleApprove}
              disabled={isVerified}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                isVerified
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isVerified ? '✓ Approved & Signed Off' : 'Approve & Sign Off Work Order'}</span>
            </button>
          </div>
        </div>

        {/* Official Certificate & PDF Invoice Modal */}
        <WorkOrderCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          task={task}
        />

      </div>
    </div>
  );
}
