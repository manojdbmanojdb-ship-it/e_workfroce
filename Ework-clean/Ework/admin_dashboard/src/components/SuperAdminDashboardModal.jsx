import React, { useState, useEffect } from 'react';
import {
  X, Shield, Building, Key, CreditCard, RefreshCw,
  CheckCircle2, AlertCircle, Plus, Search, Calendar,
  ArrowUpRight, Users, DollarSign, Filter, Check, Ban
} from 'lucide-react';

export default function SuperAdminDashboardModal({
  isOpen,
  onClose,
  darkMode = false
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'organizations' | 'licenses' | 'payments' | 'settings'

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Modals inside Super Admin
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false);
  const [genPlan, setGenPlan] = useState('professional');
  const [genDuration, setGenDuration] = useState(365);
  const [genOrgName, setGenOrgName] = useState('');

  // Search & Filters
  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [licFilter, setLicFilter] = useState('all'); // 'all' | 'available' | 'active' | 'revoked'

  // Load Super Admin Data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'x-user-email': 'superadmin@ework.com' };

      const [mRes, oRes, lRes, pRes] = await Promise.all([
        fetch('/api/superadmin/overview', { headers }),
        fetch('/api/superadmin/organizations', { headers }),
        fetch('/api/superadmin/licenses', { headers }),
        fetch('/api/superadmin/payments', { headers })
      ]);

      const [mData, oData, lData, pData] = await Promise.all([
        mRes.json(),
        oRes.json(),
        lRes.json(),
        pRes.json()
      ]);

      if (mData.success) setMetrics(mData.metrics);
      if (oData.success) setOrganizations(oData.organizations);
      if (lData.success) setLicenses(lData.licenses);
      if (pData.success) setPayments(pData.payments);

    } catch (err) {
      setError(err.message || 'Failed to load Super Admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // 1. Generate License Key
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/licenses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'superadmin@ework.com'
        },
        body: JSON.stringify({
          plan: genPlan,
          durationDays: genDuration,
          organizationName: genOrgName
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showNotification(`License Key generated: ${data.license.license_key}`);
      setShowGenerateKeyModal(false);
      setGenOrgName('');
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // 2. Suspend / Revoke License Key
  const handleUpdateLicenseStatus = async (licId, status) => {
    if (!window.confirm(`Are you sure you want to mark this license as "${status.toUpperCase()}"?`)) return;
    try {
      const res = await fetch(`/api/superadmin/licenses/${licId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'superadmin@ework.com'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showNotification(`License updated to ${status}.`);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // 3. Verify Manual Payment
  const handleVerifyManualPayment = async (payId, action) => {
    try {
      const res = await fetch(`/api/superadmin/payments/${payId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'superadmin@ework.com'
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showNotification(data.message);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // 4. Update / Renew Subscription
  const handleRenewSubscription = async (orgId, extendDays = 365) => {
    try {
      const res = await fetch(`/api/superadmin/subscriptions/${orgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'superadmin@ework.com'
        },
        body: JSON.stringify({ extendDays })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showNotification(`Subscription extended by ${extendDays} days!`);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtered lists
  const filteredOrgs = organizations.filter(org => {
    const matchQuery = (org.name + org.business_email + (org.plan || '')).toLowerCase().includes(orgSearch.toLowerCase());
    if (orgFilter === 'paid') return matchQuery && org.plan !== 'free';
    if (orgFilter === 'free') return matchQuery && org.plan === 'free';
    return matchQuery;
  });

  const filteredLicenses = licenses.filter(lic => {
    if (licFilter === 'available') return lic.status === 'available';
    if (licFilter === 'active') return lic.status === 'active';
    if (licFilter === 'revoked') return lic.status === 'revoked' || lic.status === 'suspended';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`w-full max-w-6xl rounded-3xl border shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col transition-colors ${
        darkMode ? 'bg-[#080f1e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Header Bar */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between flex-shrink-0 ${
          darkMode ? 'border-slate-800 bg-[#060b16]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight">E-WorkForce Super Admin Console</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold border border-amber-500/30">
                  SYSTEM LEVEL v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Organizations, Freemium/Paid Subscriptions, License Keys &amp; Payment Verifications
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Close Console"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
            <span>✓ {successToast}</span>
            <button onClick={() => setSuccessToast('')}>✕</button>
          </div>
        )}

        {/* Tab Navigation Pill */}
        <div className={`px-6 py-3 border-b flex items-center space-x-2 flex-shrink-0 overflow-x-auto ${
          darkMode ? 'border-slate-800 bg-[#070d1a]' : 'border-slate-200 bg-slate-100/70'
        }`}>
          {[
            { id: 'overview', label: '📊 Overview & Stats' },
            { id: 'organizations', label: `🏢 Organizations (${organizations.length})` },
            { id: 'licenses', label: `🔑 License Keys (${licenses.length})` },
            { id: 'payments', label: `💳 Payments & UPI (${payments.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Main Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Organizations</span>
                  <div className="text-3xl font-black font-mono mt-1 text-sky-500">{metrics.totalOrganizations}</div>
                  <span className="text-[11px] text-slate-400">Registered SaaS Tenants</span>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Paid Subscribers</span>
                  <div className="text-3xl font-black font-mono mt-1 text-emerald-500">{metrics.paidOrganizations}</div>
                  <span className="text-[11px] text-slate-400">Pro &amp; Enterprise Tiers</span>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Free Tier Customers</span>
                  <div className="text-3xl font-black font-mono mt-1 text-amber-500">{metrics.freeOrganizations}</div>
                  <span className="text-[11px] text-slate-400">5-Employee Freemium</span>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total SaaS Revenue</span>
                  <div className="text-3xl font-black font-mono mt-1 text-purple-500">
                    ₹{metrics.totalRevenueINR.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400">Processed Payments</span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">Need to Issue a New Organization License Key?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate an official 365-day license key for offline invoice clients or manual bank transfers.
                  </p>
                </div>
                <button
                  onClick={() => setShowGenerateKeyModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate License Key</span>
                </button>
              </div>

              {/* Quick Summary of Pending Verifications */}
              {metrics.pendingPayments > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-500 text-xs font-bold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{metrics.pendingPayments} manual payment verification(s) awaiting your review</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-bold text-amber-400 underline cursor-pointer"
                  >
                    Review in Payments Tab →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORGANIZATIONS LIST */}
          {activeTab === 'organizations' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by org name or email..."
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {['all', 'paid', 'free'].map(f => (
                    <button
                      key={f}
                      onClick={() => setOrgFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer border ${
                        orgFilter === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-300 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organizations Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Plan Tier</th>
                      <th className="p-3">Staff Usage</th>
                      <th className="p-3">License Key</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOrgs.map(org => {
                      const isFree = org.plan === 'free';
                      return (
                        <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{org.name}</div>
                            <div className="text-[11px] text-slate-400">{org.business_email}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              isFree
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : org.plan === 'enterprise'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}>
                              {org.plan_name || 'Free'}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{org.current_staff}</span>
                            <span className="text-slate-400"> / {org.employee_limit || (isFree ? 5 : 100)}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">
                            {org.license_key || '—'}
                          </td>
                          <td className="p-3">
                            <span className="h-2 w-2 rounded-full inline-block bg-emerald-500 mr-1.5"></span>
                            <span className="font-semibold text-emerald-500 uppercase text-[10px]">{org.status || 'Active'}</span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleRenewSubscription(org.id, 365)}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[11px] font-bold border border-sky-500/20 cursor-pointer"
                              title="Extend subscription by 365 days"
                            >
                              +1 Yr Renew
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LICENSES MANAGEMENT */}
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {['all', 'available', 'active', 'revoked'].map(f => (
                    <button
                      key={f}
                      onClick={() => setLicFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer border ${
                        licFilter === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-300 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowGenerateKeyModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate Key</span>
                </button>
              </div>

              {/* Licenses Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">License Key</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Organization</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLicenses.map(lic => (
                      <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-3 font-mono font-bold tracking-wider text-sky-400">
                          {lic.license_key}
                        </td>
                        <td className="p-3 uppercase font-bold text-[10px]">
                          {lic.plan}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            lic.status === 'available'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : lic.status === 'active'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {lic.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {lic.organization_name || '— Unassigned —'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {lic.duration_days} days
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(lic.license_key);
                              showNotification(`Copied ${lic.license_key}`);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Copy
                          </button>
                          {lic.status !== 'revoked' && (
                            <button
                              onClick={() => handleUpdateLicenseStatus(lic.id, 'revoked')}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/30 cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS & UPI VERIFICATION */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Txn Reference</th>
                      <th className="p-3">Customer &amp; Org</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map(pay => {
                      const isPending = pay.status === 'pending';
                      return (
                        <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">{pay.transaction_id}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Ref: {pay.payment_ref}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold">{pay.organization_name}</div>
                            <div className="text-[11px] text-slate-400">{pay.customer_email}</div>
                          </td>
                          <td className="p-3 uppercase text-[10px] font-bold">
                            {pay.payment_method === 'upi_manual' ? 'UPI Manual' : 'Online Gateway'}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                            ₹{pay.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              pay.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : pay.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleVerifyManualPayment(pay.id, 'approve')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                                >
                                  ✓ Verify &amp; Issue Key
                                </button>
                                <button
                                  onClick={() => handleVerifyManualPayment(pay.id, 'reject')}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[11px] font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-500">
                                {pay.license_key ? `Issued: ${pay.license_key}` : 'Verified'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* GENERATE KEY MODAL SUB-VIEW */}
      {showGenerateKeyModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#091222] border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base">Generate Organization License Key</h4>
              <button onClick={() => setShowGenerateKeyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Plan</label>
                <select
                  value={genPlan}
                  onChange={(e) => setGenPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="professional">Professional (100 Staff)</option>
                  <option value="enterprise">Enterprise (1,000 Staff)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={genDuration}
                  onChange={(e) => setGenDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pre-Assigned Org Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={genOrgName}
                  onChange={(e) => setGenOrgName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
