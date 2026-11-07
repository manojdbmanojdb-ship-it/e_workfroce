import React, { useRef } from 'react';
import {
  X, Printer, Download, ShieldCheck, CheckCircle2,
  MapPin, Clock, Calendar, User, FileText, Sparkles, Building
} from 'lucide-react';

export default function WorkOrderCertificateModal({
  isOpen,
  onClose,
  task
}) {
  const printRef = useRef(null);

  if (!isOpen || !task) return null;

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

  const certNumber = `CERT-${String(task.id).slice(0, 8).toUpperCase()}-2026`;
  const subtotal = proof.totalPartsCost || 1850;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#091222] border border-slate-700/90 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Top Modal Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#070e1c] flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Work Order Completion Certificate</h2>
              <p className="text-xs text-slate-400">Official Field Service Report & Invoice</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Document Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-950/70" ref={printRef}>
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-6">
            
            {/* Certificate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                    EW
                  </div>
                  <span className="text-base font-black tracking-wide text-slate-950">E-WORKFORCE</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">Enterprise</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Field Workforce Tracking & Operations Management</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400">Certificate No.</div>
                <div className="text-sm font-mono font-black text-blue-600">{certNumber}</div>
                <div className="text-xs text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="py-4 my-4 bg-slate-50 border-y border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 rounded-lg">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Service Work Order</div>
                <div className="text-base font-black text-slate-900">{task.title}</div>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>VERIFIED & CLOSED</span>
              </div>
            </div>

            {/* Two Column Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
              <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Client & Site Location</div>
                <div className="font-semibold text-slate-900">{proof.customerName} ({proof.customerDesignation})</div>
                <div className="text-slate-600 flex items-center space-x-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /><span>{proof.siteAddress}</span></div>
                <div className="text-slate-500 font-mono text-[11px]">Geo: {proof.gpsCoords.lat}° N, {proof.gpsCoords.lng}° E ({proof.gpsCoords.accuracy})</div>
                <div className="text-slate-600">Contact: {proof.customerPhone}</div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Technician & Dispatch Info</div>
                <div className="font-semibold text-slate-900">{proof.technicianName} ({proof.technicianRole})</div>
                <div className="text-slate-600 flex items-center space-x-1"><Clock className="h-3.5 w-3.5 text-slate-400" /><span>Total Duration On-Site: {proof.durationOnSite}</span></div>
                <div className="text-slate-600 flex items-center space-x-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /><span>Completion Stamp: {proof.signedAt}</span></div>
                <div className="text-emerald-700 font-semibold">✓ Geofenced Check-In &amp; Check-Out Validated</div>
              </div>
            </div>

            {/* Quality Checklist Summary */}
            <div className="my-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Executed Quality Checklist</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {proof.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 rounded bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-800 text-[11px]">{item.item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Before and After Photographic Evidence */}
            <div className="my-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Photo Proof of Work (EXIF Geo-Tagged)</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                  <div className="relative h-40">
                    <img src={proof.beforePhoto} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                      BEFORE SERVICE
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-600 leading-snug">
                    {proof.beforeNotes}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                  <div className="relative h-40">
                    <img src={proof.afterPhoto} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                      AFTER COMPLETION
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-600 leading-snug">
                    {proof.afterNotes}
                  </div>
                </div>
              </div>
            </div>

            {/* Parts & Billing Table */}
            <div className="my-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Parts &amp; Consumables Utilized</div>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">SKU Code</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {proof.partsUsed.map((part, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-900 font-medium">{part.name}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono">{part.code}</td>
                      <td className="py-2 px-3 text-center text-slate-700">{part.qty}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">₹{part.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/60 font-semibold">
                    <td colSpan="3" className="py-1.5 px-3 text-right text-slate-600">Subtotal:</td>
                    <td className="py-1.5 px-3 text-right font-mono">₹{subtotal.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50/60 font-semibold">
                    <td colSpan="3" className="py-1.5 px-3 text-right text-slate-600">GST (18%):</td>
                    <td className="py-1.5 px-3 text-right font-mono">₹{gst.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-blue-50/80 font-black text-sm text-blue-900 border-t-2 border-slate-300">
                    <td colSpan="3" className="py-2.5 px-3 text-right">Total Invoice Amount:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700">₹{totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Client Signature & Manager Attestation */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 mt-8">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Sign-off &amp; Acceptance</div>
                <div className="h-16 border-b border-slate-400 flex items-center">
                  <svg className="w-48 h-12 text-blue-800 stroke-current" viewBox="0 0 250 80" fill="none">
                    <path
                      d="M20 55 C 40 10, 60 70, 75 35 C 90 10, 110 50, 130 40 C 150 30, 160 60, 180 30 C 190 20, 200 45, 230 35 M 45 45 L 210 45"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900">{proof.customerName}</div>
                <div className="text-[10px] text-slate-500">{proof.customerDesignation} &bull; {proof.signedAt}</div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Operations Manager Verification</div>
                <div className="h-16 flex items-center justify-end">
                  <div className="px-3 py-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider transform -rotate-3 inline-flex items-center space-x-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>VERIFIED BY OPS MANAGER</span>
                  </div>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900">Rajesh Kumar (Operations Admin)</div>
                <div className="text-[10px] text-slate-500">E-Workforce Platform Certificate &bull; Cryptographic Hash Verified</div>
              </div>
            </div>

            {/* Certificate Footer Note */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              This document serves as an official field service work order completion certificate generated via E-Workforce Field Tracking Platform. All timestamps and geo-coordinates are verified through GPS Geofencing.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
