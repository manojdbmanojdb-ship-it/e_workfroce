import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Receipt, Filter, Plus, RefreshCw, X, 
  Eye, FileText, CheckCheck, Printer, Search, ArrowRight, ShieldCheck, 
  Sparkles, Fuel, Wrench, Car, Utensils, AlertCircle 
} from 'lucide-react';
import ReceiptInspectorModal from '../components/ReceiptInspectorModal.jsx';
import PayoutVoucherModal from '../components/PayoutVoucherModal.jsx';
import { soundService } from '../utils/soundService.js';

const API_BASE = 'http://localhost:5000/api';

const CAT_ICONS = { 
  fuel: '⛽', 
  food: '🍱', 
  transport: '🚕', 
  materials: '🔧', 
  other: '📎' 
};

const STATUS_STYLE = {
  pending: 'bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30',
  approved: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
  rejected: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30',
};

// Monthly Category Budget Targets for Analytics
const CATEGORY_BUDGETS = {
  fuel: { label: 'Fuel & Fleet', budget: 15000, icon: '⛽', color: 'from-amber-500 to-orange-500', barColor: 'bg-amber-500' },
  materials: { label: 'Tools & Parts', budget: 25000, icon: '🔧', color: 'from-blue-500 to-cyan-500', barColor: 'bg-cyan-500' },
  transport: { label: 'Transit & Tolls', budget: 10000, icon: '🚕', color: 'from-purple-500 to-indigo-500', barColor: 'bg-indigo-500' },
  food: { label: 'Meals & Subsistence', budget: 6000, icon: '🍱', color: 'from-emerald-500 to-teal-500', barColor: 'bg-emerald-500' },
};

const RICH_DEFAULT_EXPENSES = [
  {
    id: 'EXP-4011',
    employee: 'Rahul Sharma',
    role: 'HVAC Lead Technician',
    category: 'fuel',
    amount: 1850,
    currency: 'INR',
    status: 'pending',
    date: '2026-10-15',
    created_at: '2026-10-15T09:30:00Z',
    receipt_url: 'receipt_fuel_4011.png',
    merchant: 'Indian Oil Auto Station #402',
    invoiceNo: 'IOCL-DL-98442',
    gstin: '07AABCI4821N1ZY',
    liters: '17.85 L',
    rate: '₹103.65/L',
    taxAmount: 241.30,
    location: 'Connaught Place Outer Ring, New Delhi',
    lat: 28.6329,
    lng: 77.2195,
    notes: 'Refueled Service Van DL-10-CV-8821 before Delhi Metro substation HVAC inspections.'
  },
  {
    id: 'EXP-4012',
    employee: 'Priya Patel',
    role: 'Key Accounts Exec',
    category: 'food',
    amount: 640,
    currency: 'INR',
    status: 'approved',
    date: '2026-10-14',
    created_at: '2026-10-14T13:15:00Z',
    receipt_url: 'receipt_food_4012.png',
    merchant: 'Haldiram’s Express Retail Pvt Ltd',
    invoiceNo: 'HDR-CP-2026-194',
    gstin: '07AAACH1923K1ZT',
    items: ['Executive North Indian Thali x2', 'Kinley Packaged Water x2'],
    taxAmount: 30.50,
    location: 'Connaught Place Block B, Delhi',
    lat: 28.6335,
    lng: 77.2201,
    notes: 'Client luncheon meeting with Apex Hospital Facilities Management Team.'
  },
  {
    id: 'EXP-4013',
    employee: 'Amit Verma',
    role: 'Heavy Delivery Lead',
    category: 'transport',
    amount: 1200,
    currency: 'INR',
    status: 'pending',
    date: '2026-10-15',
    created_at: '2026-10-15T16:45:00Z',
    receipt_url: 'receipt_toll_4013.png',
    merchant: 'Delhi Tollways & FASTag Systems',
    invoiceNo: 'DND-PLAZA-7731',
    gstin: '07AABCD9182P1ZB',
    vehicleNo: 'DL-1L-AA-5544',
    tollLane: 'Lane 04 Express FASTag Commercial',
    location: 'DND Flyway Toll Plaza, Noida-Delhi Border',
    lat: 28.5815,
    lng: 77.2934,
    notes: 'Freight delivery transit toll & commercial vehicle cross-state surcharge.'
  },
  {
    id: 'EXP-4014',
    employee: 'Sneha Rao',
    role: 'Senior Safety Inspector',
    category: 'materials',
    amount: 4500,
    currency: 'INR',
    status: 'approved',
    date: '2026-10-13',
    created_at: '2026-10-13T11:00:00Z',
    receipt_url: 'receipt_inv_4014.png',
    merchant: 'Havells Electro-Tech Supplies Ltd',
    invoiceNo: 'HV-SUP-2026-5591',
    gstin: '07AABCH4930J1Z6',
    items: ['3-Phase MCB Breaker 63A x2', 'Copper Lug Terminals (Pack 50)', 'Insulated Screwdriver Set 1000V'],
    taxAmount: 686.40,
    location: 'Bhagirath Palace, Chandni Chowk, Delhi',
    lat: 28.6562,
    lng: 77.2312,
    notes: 'Emergency electrical replacement breakers for Tower-B generator backup.'
  },
  {
    id: 'EXP-4015',
    employee: 'Vikram Singh',
    role: 'Field Service Engineer',
    category: 'fuel',
    amount: 920,
    currency: 'INR',
    status: 'pending',
    date: '2026-10-16',
    created_at: '2026-10-16T08:45:00Z',
    receipt_url: 'receipt_fuel_4015.png',
    merchant: 'Bharat Petroleum Filling Point #19',
    invoiceNo: 'BPCL-NOIDA-410',
    gstin: '09AABCB3921M1ZX',
    liters: '8.88 L',
    rate: '₹103.65/L',
    taxAmount: 120.00,
    location: 'Sector 18 Fuel Depot, Noida',
    lat: 28.5708,
    lng: 77.3261,
    notes: 'Field motorbike fuel for routine customer substation checkups in Noida.'
  },
  {
    id: 'EXP-4016',
    employee: 'Amit Verma',
    role: 'Heavy Delivery Lead',
    category: 'materials',
    amount: 2850,
    currency: 'INR',
    status: 'pending',
    date: '2026-10-16',
    created_at: '2026-10-16T14:20:00Z',
    receipt_url: 'receipt_inv_4016.png',
    merchant: 'Metro Industrial Hardware & Tools Ltd',
    invoiceNo: 'MIH-DEL-8921',
    gstin: '07AAAFM8920C1Z2',
    items: ['Heavy Duty Ratchet Cargo Straps x4', 'Hydraulic Jack Oil 5L'],
    taxAmount: 434.70,
    location: 'Mayapuri Industrial Area Phase 2, Delhi',
    lat: 28.6369,
    lng: 77.1264,
    notes: 'Cargo tie-down replacements and maintenance supplies for logistics truck bed.'
  }
];

export default function ExpensesPage({ darkMode = false }) {
  const [expenses, setExpenses] = useState(RICH_DEFAULT_EXPENSES);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [inspectingExpense, setInspectingExpense] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState(null);

  const [form, setForm] = useState({
    employee: 'Rahul Sharma',
    category: 'fuel',
    amount: '',
    currency: 'INR',
    merchant: '',
    notes: ''
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/expenses`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Merge remote records with rich mock attributes if needed
        setExpenses(prev => {
          const merged = [...data.data];
          // Ensure default items exist
          RICH_DEFAULT_EXPENSES.forEach(def => {
            if (!merged.some(m => m.id === def.id)) {
              merged.push(def);
            }
          });
          return merged;
        });
      }
    } catch (err) {
      console.warn('API fetch warning, using local state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleStatus = async (id, newStatus) => {
    if (newStatus === 'approved') {
      soundService.playSuccessChime();
    }
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    if (inspectingExpense && inspectingExpense.id === id) {
      setInspectingExpense(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await fetch(`${API_BASE}/expenses/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, approvedBy: 'Finance Manager' })
      });
    } catch (err) {
      console.warn('Failed to update status on remote API:', err);
    }
  };

  // Batch One-Click Approval
  const handleBatchApprove = async () => {
    const pendingItems = expenses.filter(e => e.status === 'pending');
    if (pendingItems.length === 0) return;

    soundService.playSuccessChime();
    const batchTotal = pendingItems.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    setExpenses(prev => prev.map(e => e.status === 'pending' ? { ...e, status: 'approved' } : e));
    setBatchSuccessMessage(`✨ Successfully approved ${pendingItems.length} pending claims totaling ₹${batchTotal.toLocaleString('en-IN')}! Added to Reimbursement Payout Voucher.`);

    setTimeout(() => {
      setBatchSuccessMessage(null);
    }, 6000);

    // Call API updates
    pendingItems.forEach(async (item) => {
      try {
        await fetch(`${API_BASE}/expenses/${item.id}/review`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved', approvedBy: 'Operations Manager (Batch)' })
        });
      } catch (e) {
        // quiet error
      }
    });
  };

  const handleCreate = async () => {
    if (!form.amount) return;
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      employee: form.employee || 'Rahul Sharma',
      role: 'Field Lead',
      category: form.category,
      amount: parseFloat(form.amount),
      currency: form.currency || 'INR',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      receipt_url: 'receipt_uploaded.png',
      merchant: form.merchant || (form.category === 'fuel' ? 'Indian Oil Fuel Depot' : 'Field Operations Vendor'),
      invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      gstin: '07AABCE9912K1Z8',
      location: 'Central Field Operations Zone',
      notes: form.notes || 'Field operational claim submitted for review.'
    };

    setExpenses(prev => [newExp, ...prev]);
    setShowSubmitModal(false);
    setForm({ employee: 'Rahul Sharma', category: 'fuel', amount: '', currency: 'INR', merchant: '', notes: '' });
    soundService.playSuccessChime();

    try {
      await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000000',
          category: form.category,
          amount: parseFloat(form.amount),
          currency: form.currency
        })
      });
    } catch (err) {
      console.warn('Failed to save expense remotely:', err);
    }
  };

  // Lightbox Navigation
  const openInspector = (exp) => {
    setInspectingExpense(exp);
  };

  const currentInspectorIndex = inspectingExpense ? expenses.findIndex(e => e.id === inspectingExpense.id) : -1;
  const hasNextInspector = currentInspectorIndex >= 0 && currentInspectorIndex < expenses.length - 1;
  const hasPrevInspector = currentInspectorIndex > 0;

  const handleNextInspector = () => {
    if (hasNextInspector) setInspectingExpense(expenses[currentInspectorIndex + 1]);
  };

  const handlePrevInspector = () => {
    if (hasPrevInspector) setInspectingExpense(expenses[currentInspectorIndex - 1]);
  };

  // Filtered List
  const filtered = expenses.filter(e => {
    const matchesStatus = filter === 'all' || e.status === filter;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (e.employee && e.employee.toLowerCase().includes(q)) ||
      (e.merchant && e.merchant.toLowerCase().includes(q)) ||
      (e.invoiceNo && e.invoiceNo.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.id && e.id.toLowerCase().includes(q));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Analytics Metrics
  const totalApproved = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const pendingItems = expenses.filter(e => e.status === 'pending');
  const totalPending = pendingItems.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  // Category sums
  const categoryTotals = Object.keys(CATEGORY_BUDGETS).reduce((acc, cat) => {
    acc[cat] = expenses
      .filter(e => e.category === cat)
      .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    return acc;
  }, {});

  return (
    <div className="p-6">
      
      {/* Top Banner Message */}
      {batchSuccessMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-sky-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-sm font-semibold">{batchSuccessMessage}</span>
          </div>
          <button
            onClick={() => setBatchSuccessMessage(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 gap-4 border-b border-slate-200/90 dark:border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white">Expense Claims & Audit Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              <span>Live Audit Stream</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review field submissions, inspect thermal receipts with GPS geotags, and generate reimbursement payout vouchers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchExpenses}
            className={`p-2.5 rounded-xl border transition-all shadow-xs cursor-pointer ${
              darkMode
                ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Generate Payout Voucher Button */}
          <button
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-sky-200 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Payout Voucher ({expenses.filter(e => e.status === 'approved').length})</span>
          </button>

          {/* Batch Approve Button */}
          {pendingItems.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Approve All Pending ({pendingItems.length} · ₹{totalPending.toLocaleString()})</span>
            </button>
          )}

          {/* Submit Expense */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>File Claim</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Approved Claims</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{totalApproved.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {expenses.filter(e => e.status === 'approved').length} items cleared for payout
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-yellow-500/10 border border-amber-200 dark:border-yellow-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 dark:text-yellow-300 font-semibold">Pending Audit</span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-yellow-400 mt-1">₹{totalPending.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pendingItems.length} field claims awaiting review
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-800 dark:text-sky-300 font-semibold">Receipts Verified</span>
            <Receipt className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {expenses.filter(e => e.receipt_url).length} / {expenses.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {Math.round((expenses.filter(e => e.receipt_url).length / Math.max(expenses.length, 1)) * 100)}% with thermal proof
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-800 dark:text-purple-300 font-semibold">Total Claims Volume</span>
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
            ₹{(totalApproved + totalPending).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Current billing sprint total
          </div>
        </div>
      </div>

      {/* Category Spending Analytics & Budget Progress Section */}
      <div className={`p-5 rounded-2xl border mb-6 shadow-xs transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-sm font-bold flex items-center space-x-2 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <span>Category Spending vs Monthly Budget Limits</span>
            </h3>
            <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real-time expenditure limits set by corporate fleet and operations finance</p>
          </div>
          <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border ${
            darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            Sprint: Oct 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_BUDGETS).map(([catKey, info]) => {
            const spent = categoryTotals[catKey] || 0;
            const percent = Math.min(Math.round((spent / info.budget) * 100), 100);
            const isHigh = percent >= 80;

            return (
              <div key={catKey} className={`p-3.5 rounded-xl border transition-colors ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{info.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isHigh 
                      ? (darkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300')
                      : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/80 text-slate-700')
                  }`}>
                    {percent}% utilized
                  </span>
                </div>

                <div className="flex justify-between items-baseline mb-1.5 text-xs">
                  <span className={`font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{spent.toLocaleString()}</span>
                  <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Budget: ₹{info.budget.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${info.barColor}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === f
                  ? darkMode 
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold'
                  : darkMode
                    ? 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              }`}
            >
              {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-80">
                ({f === 'all' ? expenses.length : expenses.filter(e => e.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Category Filters & Search */}
        <div className="flex items-center space-x-2">
          {/* Category Dropdown / Pill */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer border ${
              darkMode 
                ? 'bg-slate-900 border-slate-700 text-slate-300' 
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Categories</option>
            <option value="fuel">⛽ Fuel & Mileage</option>
            <option value="materials">🔧 Materials & Tools</option>
            <option value="transport">🚕 Transit & Tolls</option>
            <option value="food">🍱 Meals</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff, vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-44 sm:w-56 shadow-xs border ${
                darkMode 
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expense Claims Table / Cards List */}
      <div className="space-y-3">
        {filtered.map(exp => (
          <div
            key={exp.id}
            className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border transition-all gap-4 group shadow-xs ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-100' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-900'
            }`}
          >
            {/* Left: Icon, Category, Vendor, Notes */}
            <div className="flex items-start space-x-4">
              <div className={`text-2xl p-2.5 rounded-xl border flex-shrink-0 ${
                darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-100 border-slate-200'
              }`}>
                {CAT_ICONS[exp.category] || '📎'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold capitalize ${darkMode ? 'text-white' : 'text-slate-900'}`}>{exp.category} Claim</span>
                  <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>({exp.id})</span>
                  {exp.merchant && (
                    <span className={`hidden md:inline-block text-[11px] font-medium border-l pl-2 ${
                      darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      {exp.merchant}
                    </span>
                  )}
                </div>

                <div className={`text-xs mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{exp.employee || 'Rahul Sharma'}</span>
                  <span>·</span>
                  <span>{exp.role || 'Field Lead'}</span>
                  <span>·</span>
                  <span>{exp.date || (exp.created_at ? new Date(exp.created_at).toLocaleDateString() : 'Today')}</span>
                  {exp.location && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-xs">{exp.location}</span>
                    </>
                  )}
                </div>

                {exp.notes && (
                  <p className={`text-[11px] mt-1 line-clamp-1 italic ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    "{exp.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Amount, Receipt Lightbox Trigger, Status & Direct Actions */}
            <div className={`flex items-center justify-between lg:justify-end space-x-4 pt-3 lg:pt-0 border-t lg:border-t-0 ${
              darkMode ? 'border-slate-800/60' : 'border-slate-100'
            }`}>
              
              {/* Receipt Preview Trigger Pill */}
              <button
                onClick={() => openInspector(exp)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  darkMode 
                    ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400 group-hover:border-sky-400/50' 
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 group-hover:border-blue-300'
                }`}
                title="Inspect Thermal Receipt & Geotag"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Inspect Receipt</span>
              </button>

              {/* Amount & Status Badge */}
              <div className="text-right min-w-[90px]">
                <div className={`text-base font-black font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  ₹{parseFloat(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[exp.status] || STATUS_STYLE.pending}`}>
                  {exp.status}
                </span>
              </div>

              {/* Approve / Reject Buttons (if pending) */}
              {exp.status === 'pending' ? (
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => handleStatus(exp.id, 'approved')}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-all cursor-pointer shadow-xs"
                    title="Approve Claim"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleStatus(exp.id, 'rejected')}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all cursor-pointer shadow-xs"
                    title="Reject Claim"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-8"></div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={`p-12 text-center rounded-2xl border shadow-xs ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Receipt className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>No expense claims found matching your filter</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Try resetting the status or search query</p>
          </div>
        )}
      </div>

      {/* Lightbox Receipt Inspector Modal */}
      {inspectingExpense && (
        <ReceiptInspectorModal
          expense={inspectingExpense}
          onClose={() => setInspectingExpense(null)}
          onApprove={(id) => handleStatus(id, 'approved')}
          onReject={(id, reason) => handleStatus(id, 'rejected')}
          onNext={handleNextInspector}
          onPrev={handlePrevInspector}
          hasNext={hasNextInspector}
          hasPrev={hasPrevInspector}
        />
      )}

      {/* Payout Voucher Modal */}
      {showPayoutModal && (
        <PayoutVoucherModal
          expenses={expenses}
          onClose={() => setShowPayoutModal(false)}
        />
      )}

      {/* Submit Expense Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>File Expense Claim</h2>
              <button 
                onClick={() => setShowSubmitModal(false)} 
                className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Staff Member</label>
                <select
                  value={form.employee}
                  onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Rahul Sharma">Rahul Sharma (HVAC Lead)</option>
                  <option value="Priya Patel">Priya Patel (Key Accounts)</option>
                  <option value="Amit Verma">Amit Verma (Heavy Delivery)</option>
                  <option value="Sneha Rao">Sneha Rao (Safety Inspector)</option>
                  <option value="Vikram Singh">Vikram Singh (Field Engineer)</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Expense Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="fuel">⛽ Fuel &amp; Mileage</option>
                  <option value="materials">🔧 Tools &amp; Parts</option>
                  <option value="transport">🚕 Public Transit &amp; Tolls</option>
                  <option value="food">🍱 Meals &amp; Subsistence</option>
                  <option value="other">📎 Other</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Merchant / Station Name</label>
                <input
                  type="text"
                  placeholder="e.g. Indian Oil Station #402"
                  value={form.merchant}
                  onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Claim Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1850"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Purpose / Work Order Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Refueled service vehicle before maintenance run"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={`w-full text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.amount}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg transition-all hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
