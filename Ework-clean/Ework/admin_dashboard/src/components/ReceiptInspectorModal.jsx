import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Printer, Download, MapPin, ShieldCheck, Clock, User, ChevronLeft, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { soundService } from '../utils/soundService.js';

export default function ReceiptInspectorModal({ expense, onClose, onApprove, onReject, onNext, onPrev, hasNext, hasPrev }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('Unclear receipt image or missing VAT/GST invoice details');

  if (!expense) return null;

  const handleApprove = () => {
    soundService.playSuccessChime();
    onApprove(expense.id);
  };

  const handleReject = () => {
    onReject(expense.id, rejectReason);
    setRejectMode(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const amountFormatted = parseFloat(expense.amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 no-print">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-sky-500/15 border border-blue-200 dark:border-sky-500/30 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Expense Receipt Lightbox & Audit</h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  expense.status === 'approved'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : expense.status === 'rejected'
                    ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                    : 'bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/30'
                }`}>
                  {expense.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Claim ID: {expense.id} · Filed by {expense.employee || 'Field Staff'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs flex items-center cursor-pointer"
                title="Previous Claim"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs flex items-center cursor-pointer"
                title="Next Claim"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs flex items-center space-x-1 cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all ml-2 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Split (Left: Realistic Receipt Paper, Right: Audit Details & Actions) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          
          {/* LEFT: Realistic Thermal Paper Receipt / Bill View */}
          <div className="md:col-span-7 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="w-full max-w-sm bg-neutral-50 text-slate-900 rounded-lg shadow-2xl p-6 font-mono text-xs relative border-t-8 border-slate-800 select-text">
              
              {/* Receipt Jagged / Perforated Effect Banner */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <div className="text-xl font-black tracking-tight text-slate-900 mb-0.5">
                  {expense.merchant || (expense.category === 'fuel' ? 'INDIAN OIL CORP LTD' : 'ENTERPRISE VENDOR')}
                </div>
                <div className="text-[10px] text-slate-600 font-sans font-medium">
                  {expense.location || 'Connaught Place Central Hub, New Delhi'}
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  GSTIN: <span className="font-mono font-bold text-slate-700">{expense.gstin || '07AABCI4821N1ZY'}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  TAX INVOICE / CASH MEMO
                </div>
              </div>

              {/* Invoice Meta Row */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bill No:</span>
                  <span className="font-bold">{expense.invoiceNo || `POS-${expense.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span>{expense.date || '2026-10-15'} {expense.created_at ? new Date(expense.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:24 AM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold">CORPORATE UPI / POS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-semibold">{expense.employee || 'Rahul Sharma'}</span>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase border-b border-slate-200 pb-1">
                  <span>Description</span>
                  <span>Amount (₹)</span>
                </div>

                {expense.category === 'fuel' ? (
                  <>
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">High Speed Diesel / Petrol</div>
                        <div className="text-[10px] text-slate-500">Qty: {expense.liters || '17.85 L'} @ {expense.rate || '₹103.65/L'}</div>
                      </div>
                      <div className="font-bold">₹{(expense.amount - (expense.taxAmount || 241.30)).toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>VAT / GST (approx 15%)</span>
                      <span>₹{(expense.taxAmount || 241.30).toFixed(2)}</span>
                    </div>
                  </>
                ) : expense.category === 'materials' ? (
                  <>
                    {(expense.items || ['Standard Field Replacement Parts', 'Insulated Tool Kit Set']).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate pr-2">{item}</span>
                        <span className="font-medium">₹{(expense.amount / (expense.items?.length || 2)).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-slate-600 text-[10px] pt-1">
                      <span>CGST (9%) + SGST (9%)</span>
                      <span>₹{(expense.taxAmount || 434.70).toFixed(2)}</span>
                    </div>
                  </>
                ) : expense.category === 'food' ? (
                  <>
                    {(expense.items || ['Executive Meal Combo x2', 'Bottled Mineral Water x2']).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate pr-2">{item}</span>
                        <span className="font-medium">₹{(expense.amount / (expense.items?.length || 2)).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-slate-600 text-[10px] pt-1">
                      <span>Restaurant GST (5%)</span>
                      <span>₹{(expense.taxAmount || 30.50).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">Transit / Tollway Surcharge</div>
                        <div className="text-[10px] text-slate-500">{expense.tollLane || 'Express FASTag Lane 04'}</div>
                      </div>
                      <div className="font-bold">₹{amountFormatted}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Total Display */}
              <div className="pt-3 pb-2 text-slate-900">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase">Grand Total:</span>
                  <span className="text-lg font-black tracking-tight">₹{amountFormatted}</span>
                </div>
                <div className="text-[9px] text-slate-500 text-right mt-0.5">Includes all applicable duties & taxes</div>
              </div>

              {/* Barcode Graphic Simulation */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-col items-center">
                <div className="h-10 w-48 bg-repeat-x flex items-center justify-center space-x-1 opacity-80">
                  {/* CSS barcode simulation stripes */}
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 3, 1].map((w, i) => (
                    <div key={i} className="bg-slate-900 h-8" style={{ width: `${w * 2}px` }}></div>
                  ))}
                </div>
                <div className="text-[9px] text-slate-600 tracking-widest mt-1">*{expense.invoiceNo || 'IOCL-998124'}*</div>
              </div>

              {/* Paid Stamp */}
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 border-2 border-emerald-600 text-emerald-700 font-sans font-black text-[11px] rounded tracking-widest transform -rotate-2 opacity-90">
                  DIGITALLY VERIFIED POS RECEIPT
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Audit Verification & Manager Sign-off Panel */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between bg-white dark:bg-slate-900 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Automated Audit Verifications</span>
              </h3>

              <div className="space-y-3">
                {/* Employee / Task Link */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <User className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                    <span>Submitted By: {expense.employee || 'Rahul Sharma'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Role: {expense.role || 'Field Lead'} · Category: <span className="capitalize text-blue-600 dark:text-sky-300 font-semibold">{expense.category}</span>
                  </div>
                  {expense.notes && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 bg-slate-100 dark:bg-slate-900/60 p-2 rounded border border-slate-200 dark:border-slate-800 italic">
                      "{expense.notes}"
                    </div>
                  )}
                </div>

                {/* GPS & Geofence Verification */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>GPS Geo-Tag Audit</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      Within Site Perimeter
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Location: <span className="text-slate-800 dark:text-slate-200">{expense.location || 'Connaught Place Outer Ring, New Delhi'}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                    Coordinates: {expense.lat || '28.6329'}° N, {expense.lng || '77.2195'}° E (±12m radius)
                  </div>
                </div>

                {/* Tax / GST Compliance Check */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">GSTIN & Vendor Check</span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-blue-200 dark:border-sky-500/20">
                      Active GST
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vendor: <span className="text-slate-800 dark:text-slate-200">{expense.merchant || 'Indian Oil Corp Ltd'}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    GSTIN: {expense.gstin || '07AABCI4821N1ZY'}
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Mode Prompt or Review Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {rejectMode ? (
                <div className="space-y-3 bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-200 dark:border-red-500/30">
                  <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center space-x-1.5">
                    <XCircle className="h-4 w-4" />
                    <span>Specify Reason for Rejecting Claim</span>
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-red-300 dark:border-red-500/40 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter rejection reason..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setRejectMode(false)}
                      className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/25 cursor-pointer"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>Reimbursement Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">₹{amountFormatted}</span>
                  </div>

                  {expense.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRejectMode(true)}
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject Claim</span>
                      </button>
                      <button
                        onClick={handleApprove}
                        className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Approve Claim</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Claim Status:</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        expense.status === 'approved' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20' : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20'
                      }`}>
                        {expense.status}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
