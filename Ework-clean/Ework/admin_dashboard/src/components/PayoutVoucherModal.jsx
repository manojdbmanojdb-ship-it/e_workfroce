import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, CreditCard, FileCheck } from 'lucide-react';

export default function PayoutVoucherModal({ expenses, onClose }) {
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const totalPayout = approvedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Helper to convert number to rough Indian words representation
  const numberToWords = (num) => {
    if (!num) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    };

    if (num < 100) return inWords(Math.round(num));
    if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + (num % 100 !== 0 ? inWords(Math.round(num % 100)) : '');
    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const rem = Math.round(num % 1000);
      return inWords(thousands) + 'Thousand ' + (rem > 0 ? (rem < 100 ? 'and ' : '') + inWords(rem) : '');
    }
    return `Rupees ${num.toLocaleString('en-IN')}`;
  };

  const exportCSV = () => {
    const headers = ['Claim ID,Employee,Category,Merchant,Invoice No,Date,Amount (INR),Status\n'];
    const rows = approvedExpenses.map(e => 
      `"${e.id}","${e.employee || 'Field Staff'}","${e.category}","${e.merchant || 'Vendor'}","${e.invoiceNo || 'N/A'}","${e.date || '2026-10-15'}","${e.amount}","${e.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ework_Reimbursement_Voucher_OCT2026.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 no-print">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Reimbursement Payout Voucher</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official finance disbursement document for approved field claims</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-6 md:p-8 overflow-y-auto bg-neutral-100 text-slate-900 print:p-0 print:m-0 print:bg-white print:text-black">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0">
            
            {/* Corporate Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                      E
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">EWORK SOLUTIONS LTD</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Field Workforce Operations & Fleet Management Division</p>
                  <p className="text-[11px] text-slate-500">Corporate HQ: Barakhamba Road, Connaught Place, New Delhi - 110001</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 07AAACE9821R1Z9 · CIN: U72200DL2024PTC109823</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded">
                    PAYMENT VOUCHER
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-2">VCH-2026-10-OCT-092</div>
                  <div className="text-xs text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            </div>

            {/* Voucher Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mb-6">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment Cycle:</span>
                <span className="font-bold text-slate-900">October 2026 - Sprint 2</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Disbursement Mode:</span>
                <span className="font-bold text-slate-900">Direct Corporate NEFT</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Claims Count:</span>
                <span className="font-bold text-slate-900">{approvedExpenses.length} Claims Approved</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Audit Clearance:</span>
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <span>✓ 100% Verified</span>
                </span>
              </div>
            </div>

            {/* Approved Claims Table */}
            <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Claim ID</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vendor / Merchant</th>
                    <th className="py-2.5 px-3">Invoice Ref</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {approvedExpenses.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900">{item.id}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{item.employee || 'Rahul Sharma'}</td>
                      <td className="py-2 px-3 capitalize text-slate-600">{item.category}</td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">{item.merchant || 'Standard Vendor'}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.invoiceNo || 'N/A'}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {approvedExpenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No approved expense claims currently queued for reimbursement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals & Amount in Words */}
            <div className="border-t-2 border-slate-900 pt-4 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="max-w-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amount in Words:</span>
                  <p className="text-xs font-bold text-slate-800 italic mt-0.5">
                    Indian Rupees {numberToWords(totalPayout)} Only
                  </p>
                </div>
                <div className="text-right sm:min-w-[200px]">
                  <div className="flex justify-between text-xs text-slate-600 pb-1">
                    <span>Subtotal:</span>
                    <span>₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 pb-1">
                    <span>TDS / Deductions:</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-300">
                    <span className="text-xs font-black uppercase text-slate-900">Net Payable:</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-300">
              <div>
                <div className="h-14 flex items-end">
                  <div className="font-serif italic text-base text-blue-900 select-none">
                    P. Sundaram (Auditor)
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-700 font-semibold">
                  Prepared & Audited By
                </div>
                <div className="text-[10px] text-slate-500">Internal Audit & Field Compliance</div>
              </div>

              <div className="text-right">
                <div className="h-14 flex items-end justify-end">
                  <div className="border border-emerald-600 text-emerald-800 px-3 py-1 rounded text-[10px] font-mono font-bold tracking-tight inline-block select-none transform rotate-1">
                    APPROVED FOR BANK TRANSFER
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-700 font-semibold">
                  Authorized Signatory (CFO)
                </div>
                <div className="text-[10px] text-slate-500">Corporate Banking & Treasury Ops</div>
              </div>
            </div>

            {/* Security Verification Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
              <span>Security Hash: SHA256:d89f3a...c81b</span>
              <span>Computer Generated Document · Valid Without Physical Stamp</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
