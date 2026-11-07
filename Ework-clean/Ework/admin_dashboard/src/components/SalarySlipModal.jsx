import React from 'react';
import {
  X, Printer, Download, CheckCircle2, ShieldCheck,
  Building2, CreditCard, FileText, DollarSign, Calendar,
  User, Briefcase, Award
} from 'lucide-react';

export default function SalarySlipModal({ isOpen, onClose, payrollRecord }) {
  if (!isOpen || !payrollRecord) return null;

  const emp = payrollRecord;
  const basicSalary = emp.basicSalary || 32000;
  const hra = Math.round(basicSalary * 0.4);
  const conveyance = 2400;
  const regularHours = emp.regularHours || 176;
  const hourlyRate = Math.round(basicSalary / regularHours);
  
  // Overtime Calculation (1.5x)
  const otHours = emp.otHours || 14.5;
  const otMultiplier = 1.5;
  const otRate = Math.round(hourlyRate * otMultiplier);
  const otAllowance = Math.round(otHours * otRate);

  // Field Expense Reimbursement
  const expenseReimbursement = emp.expenseReimbursement || 5350;

  // Gross Earnings
  const grossEarnings = basicSalary + hra + conveyance + otAllowance + expenseReimbursement;

  // Deductions
  const epf = Math.round(basicSalary * 0.12);
  const esi = Math.round(grossEarnings * 0.0075);
  const profTax = 200;
  const totalDeductions = epf + esi + profTax;

  // Net Pay
  const netPay = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  const exportNEFT = () => {
    const headers = ['Beneficiary Name,Account Number,IFSC Code,Bank Name,Gross Pay,Deductions,Net Payout (INR),Narration\n'];
    const row = `"${emp.name}","${emp.bankAccount || '50100492819201'}","HDFC0001202","HDFC Bank","${grossEarnings}","${totalDeductions}","${netPay}","Salary Oct 2026 EWORK"`;
    const blob = new Blob([headers.concat(row)], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EWORK_NEFT_PAYSLIP_${emp.name.replace(/\s+/g, '_')}_OCT2026.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070e1c] no-print">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-[#071120] rounded-[14px] flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Monthly Salary Slip & Wage Statement</h2>
              <p className="text-xs text-slate-400">Automated 8-hr shift duration, 1.5x overtime allowance & field expenses</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportNEFT}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-sky-400" />
              <span>Export NEFT CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Salary Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Pay Slip Sheet */}
        <div className="p-6 md:p-8 overflow-y-auto bg-neutral-100 text-slate-900 print:p-0 print:m-0 print:bg-white print:text-black">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-300 print:border-none print:shadow-none print:p-0">
            
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                      E
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">EWORK SOLUTIONS PVT. LTD.</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Enterprise Field Workforce & Operations Management Platform</p>
                  <p className="text-[11px] text-slate-400">Reg. Office: Cyber City, Tower B, Phase II, Gurugram, Haryana - 122002</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                    Payslip — October 2026
                  </span>
                  <p className="text-xs text-slate-500 mt-1.5 font-mono">Pay Period: 01 Oct 2026 - 31 Oct 2026</p>
                  <p className="text-xs text-slate-500 font-mono">Disbursement: 31 Oct 2026</p>
                </div>
              </div>
            </div>

            {/* Employee Credentials Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
                <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                <span className="text-slate-500 block text-[11px]">{emp.role || 'Field Engineer'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID / Dept</span>
                <span className="font-mono font-bold text-slate-800">{emp.code || 'EMP-2026-042'}</span>
                <span className="text-slate-500 block text-[11px]">Field Operations</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank & Account</span>
                <span className="font-mono font-semibold text-slate-800">HDFC Bank</span>
                <span className="font-mono text-slate-500 text-[11px]">•••• {emp.bankAccount?.slice(-4) || '9201'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UAN / PF Number</span>
                <span className="font-mono text-slate-800">101294829104</span>
                <span className="text-emerald-600 font-semibold text-[10px]">Verified KYC</span>
              </div>
            </div>

            {/* Shift & Attendance Attendance Benchmark */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl mb-6 flex flex-wrap items-center justify-between text-xs text-blue-900">
              <div className="flex items-center space-x-2">
                <span className="font-bold">Standard Shift Rule:</span>
                <span>8.0 Hours / Day</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">Total Days Present:</span>
                <span className="font-mono font-bold">{emp.daysPresent || 22} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">Regular Hours:</span>
                <span className="font-mono font-bold">{regularHours} hrs</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <span>Overtime Logged:</span>
                <span className="font-mono">+{otHours} hrs (1.5x Rate)</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-6 text-xs">
              <div className="grid grid-cols-2 bg-slate-900 text-white font-bold p-2.5 text-center text-[11px] uppercase tracking-wider">
                <div>Earnings & Allowances</div>
                <div className="border-l border-slate-700">Statutory Deductions</div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-300">
                {/* Earnings Column */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Wage (Standard 8-hr Shift)</span>
                    <span className="font-mono font-bold text-slate-900">₹{basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-bold text-slate-900">₹{hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conveyance & Mobile Allowance</span>
                    <span className="font-mono font-bold text-slate-900">₹{conveyance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    <div>
                      <span className="font-bold text-emerald-800 block">Overtime Pay (1.5x Rate)</span>
                      <span className="text-[10px] text-emerald-600 font-mono">{otHours} hrs @ ₹{otRate}/hr</span>
                    </div>
                    <span className="font-mono font-black text-emerald-700 self-center">₹{otAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-sky-50 p-1.5 rounded-lg border border-sky-200">
                    <div>
                      <span className="font-bold text-sky-800 block">Field Expense Reimbursement</span>
                      <span className="text-[10px] text-sky-600">Approved claims (Fuel, spares)</span>
                    </div>
                    <span className="font-mono font-black text-sky-700 self-center">₹{expenseReimbursement.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="p-3.5 space-y-2.5 bg-slate-50/50">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-600 block">Provident Fund (EPF 12%)</span>
                      <span className="text-[10px] text-slate-400">Employer match credited</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{epf.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-600 block">ESIC (Employee State Insurance)</span>
                      <span className="text-[10px] text-slate-400">0.75% of Gross</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{esi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-mono font-bold text-slate-900">₹{profTax.toLocaleString()}</span>
                  </div>
                  <div className="pt-8 text-center text-slate-400 text-[10px] italic">
                    Income Tax (TDS): Zero tax liability under Section 87A rebate.
                  </div>
                </div>
              </div>

              {/* Subtotal Row */}
              <div className="grid grid-cols-2 divide-x divide-slate-300 border-t border-slate-300 bg-slate-100 font-bold p-2.5">
                <div className="flex justify-between px-1">
                  <span>Gross Total Earnings:</span>
                  <span className="font-mono text-blue-700">₹{grossEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-1">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-red-600">₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Payout Callout */}
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500/40 flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Net Take-Home Salary (Disbursed to Bank)</span>
                <span className="text-xs text-emerald-700">Direct Deposit scheduled for October 31, 2026</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  ₹{netPay.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Signatures & Verification Stamp */}
            <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
              <div>
                <div className="h-10 w-28 border-b border-slate-400 flex items-center justify-center font-serif italic text-slate-600 text-sm">
                  K. Sengupta
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Authorized Signatory</div>
                <div className="text-[9px] text-slate-400">Head of People & Payroll</div>
              </div>

              <div className="text-center">
                <div className="h-14 w-14 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center p-1 text-[8px] text-emerald-700 font-bold uppercase leading-tight mx-auto">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mb-0.5" />
                  <span>EWORK</span>
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase">System Generated</div>
                <div className="text-[9px] text-slate-400">SHA-256 Hash: 8b29...41e0</div>
                <div className="text-[9px] text-slate-400">This document does not require physical signature</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
