import React, { useState, useEffect } from 'react';
import {
  X, Database, UserCheck, Clock, Shield, RefreshCw,
  Copy, Check, Table, History, Code2, Sparkles, CheckCircle2,
  Smartphone, Globe, Award, Layers, ExternalLink, AlertCircle
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';

const API_BASE = 'http://localhost:5000/api';
const SUPABASE_PROJECT_URL = 'https://supabase.com/dashboard/project/ptxfxtxwytrzznswudlc/database/tables';
const SUPABASE_SQL_EDITOR_URL = 'https://supabase.com/dashboard/project/ptxfxtxwytrzznswudlc/sql/new';

const SQL_CREATE_TABLE = `-- 10. EMPLOYEE SIGN-IN TABLE IN SUPABASE
CREATE TABLE IF NOT EXISTS public.employee_sign_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Field Staff',
    department TEXT DEFAULT 'Field Operations',
    phone TEXT,
    avatar TEXT,
    badge TEXT,
    sign_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sign_in_count INTEGER DEFAULT 1,
    ip_address TEXT,
    device TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Also create sign_in table
CREATE TABLE IF NOT EXISTS public.sign_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Field Staff',
    department TEXT DEFAULT 'Field Operations',
    phone TEXT,
    avatar TEXT,
    badge TEXT,
    sign_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sign_in_count INTEGER DEFAULT 1,
    ip_address TEXT,
    device TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Open Policy
ALTER TABLE public.employee_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_in ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Manage Employee Sign Ins" ON public.employee_sign_ins;
CREATE POLICY "Public Manage Employee Sign Ins" ON public.employee_sign_ins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Manage Sign In" ON public.sign_in;
CREATE POLICY "Public Manage Sign In" ON public.sign_in FOR ALL USING (true) WITH CHECK (true);`;

export default function DatabaseUserInspectorModal({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('supabase_table'); // 'supabase_table' | 'profile' | 'all_users' | 'audit_logs' | 'schema'
  const [dbUsers, setDbUsers] = useState([]);
  const [supabaseSignIns, setSupabaseSignIns] = useState([]);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch live database records from backend and Supabase
  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes, schemaRes, supabaseRes] = await Promise.all([
        fetch(`${API_BASE}/auth/users`),
        fetch(`${API_BASE}/auth/sign-in-logs`),
        fetch(`${API_BASE}/auth/schema`),
        fetch(`${API_BASE}/auth/supabase-sign-ins`)
      ]);

      const [usersData, logsData, schemaData, supabaseData] = await Promise.all([
        usersRes.json(),
        logsRes.json(),
        schemaRes.json(),
        supabaseRes.json()
      ]);

      if (usersData.success && Array.isArray(usersData.data)) {
        setDbUsers(usersData.data);
      }
      if (logsData.success && Array.isArray(logsData.data)) {
        setAuditLogs(logsData.data);
      }
      if (schemaData.success) {
        setSchemaInfo(schemaData);
      }
      if (supabaseData.success && Array.isArray(supabaseData.data)) {
        setSupabaseSignIns(supabaseData.data);
        setSupabaseStatus({ connected: true, count: supabaseData.count, table: supabaseData.table });
      } else {
        setSupabaseStatus({ connected: false, error: supabaseData.error, hint: supabaseData.hint });
      }
    } catch (err) {
      console.warn('Failed to fetch database data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Find the exact matching user row from the database
  const activeDbUser = dbUsers.find(u => 
    (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.id && u.id === currentUser.id) ||
    (currentUser?.userId && u.user_id === currentUser.userId)
  ) || currentUser;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeDbUser, null, 2));
    setCopied(true);
    soundService.playBarcodeBeep();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_CREATE_TABLE);
    setCopiedSql(true);
    soundService.playBarcodeBeep();
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const formatDateTime = (iso) => {
    if (!iso) return 'Not recorded';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#091222] border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Database Inspector — Employee Sign-In Record</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Supabase + SQLite Dual Sync</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Column: <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1 rounded">sign_in</code> in table <code className="text-sky-300 font-mono">employee_sign_ins</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={SUPABASE_PROJECT_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
              title="Open your Supabase Tables Console"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={fetchDatabaseData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh live from database"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 pt-3 border-b border-slate-800 bg-slate-950/40 flex-shrink-0 text-xs overflow-x-auto">
          {[
            { id: 'supabase_table', label: `Supabase Table: employee_sign_ins (${supabaseSignIns.length})`, icon: Database, badge: 'Cloud' },
            { id: 'profile', label: 'Logged-in Person DB Record', icon: UserCheck },
            { id: 'all_users', label: `SQLite Table: users (${dbUsers.length})`, icon: Table, badge: 'Local' },
            { id: 'audit_logs', label: `Sign-in Logs (${auditLogs.length})`, icon: History },
            { id: 'schema', label: 'SQL Script & Setup', icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    tab.badge === 'Cloud' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">

          {/* TAB: Supabase Table (employee_sign_ins) */}
          {activeTab === 'supabase_table' && (
            <div className="space-y-4">
              
              {/* Supabase Cloud Project Info Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Supabase Cloud Project: E-Workforce (ptxfxtxwytrzznswudlc)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Table: <code className="text-emerald-300 font-mono font-bold">public.employee_sign_ins</code> — Stores employee name, email, role, and the exact <code className="text-emerald-300 font-mono font-bold">sign_in</code> timestamp on button click.
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a
                    href={SUPABASE_PROJECT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <span>View in Supabase Tables</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Notice if table has not been created yet in Supabase */}
              {supabaseStatus && !supabaseStatus.connected && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Create Table #10 in your Supabase Dashboard</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        To make this table appear alongside your other 9 tables (<code className="text-slate-200">assets, attendance, tasks...</code>) as shown in your screenshot, run the quick SQL script below in your Supabase SQL Editor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCopySql}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSql ? 'SQL Copied to Clipboard!' : '1-Click Copy SQL Script'}</span>
                    </button>
                    <a
                      href={SUPABASE_SQL_EDITOR_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                    >
                      <span>Open Supabase SQL Editor</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Supabase Live Table Rows */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">Live Records in Supabase: employee_sign_ins</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {supabaseSignIns.length} Record(s) Stored
                  </span>
                </div>

                {supabaseSignIns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase tracking-wider">
                          <th className="py-2.5 px-3">Employee</th>
                          <th className="py-2.5 px-3">Work Email</th>
                          <th className="py-2.5 px-3">Role &amp; Department</th>
                          <th className="py-2.5 px-3 bg-emerald-950/40 text-emerald-300 border-x border-emerald-500/20 font-bold">
                            sign_in (Target Column)
                          </th>
                          <th className="py-2.5 px-3">Device / Platform</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {supabaseSignIns.map((row, idx) => {
                          const isCurrent = (currentUser?.email && row.email?.toLowerCase() === currentUser.email?.toLowerCase());
                          return (
                            <tr
                              key={row.id || idx}
                              className={`transition-colors ${
                                isCurrent ? 'bg-sky-500/10 border-l-4 border-sky-400 font-bold' : 'hover:bg-slate-900/50'
                              }`}
                            >
                              <td className="py-2.5 px-3 text-white">
                                <div className="flex items-center space-x-1.5">
                                  <span>{row.avatar || '👤'}</span>
                                  <span className="font-bold">{row.name}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-sky-500 text-white px-1.5 py-0.2 rounded font-bold">
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px]">{row.email}</td>
                              <td className="py-2.5 px-3 text-slate-400">
                                <div>{row.role}</div>
                                <div className="text-[10px] text-slate-500">{row.department}</div>
                              </td>
                              <td className="py-2.5 px-3 bg-emerald-950/25 border-x border-emerald-500/20 font-mono text-emerald-400 font-bold text-[11px]">
                                {formatDateTime(row.sign_in)}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.device || 'Web Dashboard'}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  {row.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <p className="text-xs">
                      When employees click the <strong>Sign In</strong> button, their record is sent to Supabase table <code className="text-emerald-400 font-mono">employee_sign_ins</code>!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Copy the SQL script below and run it in your Supabase SQL editor to see the table live.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: Logged-in Person Detailed Record */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              
              {/* PRIMARY SPOTLIGHT: The requested "sign_in" column */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-sky-950/60 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      DATABASE COLUMN: "sign_in"
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live Session Active
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {formatDateTime(activeDbUser?.sign_in || activeDbUser?.last_sign_in_at)}
                </div>

                <div className="mt-2 text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>ISO Raw: <code className="text-emerald-300 font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded">{activeDbUser?.sign_in || 'N/A'}</code></span>
                  <span>Total Logins: <strong className="text-white font-mono">{activeDbUser?.sign_in_count || activeDbUser?.signInCount || 1}</strong></span>
                  <span>Device: <span className="text-slate-300">{activeDbUser?.sign_in_device || 'Web Dashboard'}</span></span>
                </div>
              </div>

              {/* User Identity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Full Name</div>
                  <div className="text-base font-extrabold text-white mt-1 flex items-center space-x-2">
                    <span>{activeDbUser?.avatar || '👤'}</span>
                    <span>{activeDbUser?.name}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Work Email</div>
                  <div className="text-sm font-bold text-sky-400 mt-1 font-mono truncate">
                    {activeDbUser?.email}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</div>
                  <div className="text-sm font-bold text-white mt-1 flex items-center space-x-1.5">
                    <Shield className="h-3.5 w-3.5 text-sky-400" />
                    <span>{activeDbUser?.role || 'Staff'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Department</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {activeDbUser?.department || 'Field Operations'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Database User ID</div>
                  <div className="text-sm font-bold text-slate-200 mt-1 font-mono">
                    {activeDbUser?.user_id || activeDbUser?.userId || `usr-${activeDbUser?.id}`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Account Created At</div>
                  <div className="text-xs font-semibold text-slate-300 mt-1 font-mono">
                    {formatDateTime(activeDbUser?.created_at)}
                  </div>
                </div>
              </div>

              {/* Database Storage Details */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>
                    Dual Stored in: <code className="text-sky-300 font-mono">Supabase (employee_sign_ins)</code> + <code className="text-emerald-300 font-mono">SQLite (users)</code>
                  </span>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all cursor-pointer text-[11px]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied Row!' : 'Copy DB Row JSON'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB: SQLite Table (users) */}
          {activeTab === 'all_users' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Accounts stored in SQLite database table <code className="text-emerald-400 font-mono font-bold">users</code>:</span>
                <span className="text-[11px] text-emerald-400 font-bold">{dbUsers.length} Users Stored</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Person Name</th>
                        <th className="py-2.5 px-3">Work Email</th>
                        <th className="py-2.5 px-3">Role &amp; Department</th>
                        <th className="py-2.5 px-3 bg-emerald-950/30 text-emerald-300 border-x border-emerald-500/20">
                          sign_in (Target Column)
                        </th>
                        <th className="py-2.5 px-3">Logins</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dbUsers.map((u) => {
                        const isCurrent = (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
                        return (
                          <tr
                            key={u.id}
                            className={`transition-colors ${
                              isCurrent ? 'bg-sky-500/10 border-l-4 border-sky-400 font-bold' : 'hover:bg-slate-900/50'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">#{u.id}</td>
                            <td className="py-2.5 px-3 text-white">
                              <div className="flex items-center space-x-1.5">
                                <span>{u.avatar || '👤'}</span>
                                <span className="font-bold">{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-sky-500 text-white px-1.5 py-0.2 rounded font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px]">{u.email}</td>
                            <td className="py-2.5 px-3 text-slate-400">
                              <div>{u.role}</div>
                              <div className="text-[10px] text-slate-500">{u.department}</div>
                            </td>
                            <td className="py-2.5 px-3 bg-emerald-950/20 border-x border-emerald-500/20 font-mono text-emerald-400 font-bold text-[11px]">
                              {formatDateTime(u.sign_in)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">{u.sign_in_count || 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {u.sign_in_status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Sign-In History Audit Trail */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Audit records from table <code className="text-sky-300 font-mono">sign_in_history</code>:
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] uppercase">
                      <th className="py-2.5 px-3">Log ID</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Sign-in Timestamp</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Device / Client</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-mono text-slate-500">#{log.id}</td>
                        <td className="py-2 px-3 text-white font-semibold">
                          {log.name} <span className="text-slate-500 font-mono text-[10px]">({log.email})</span>
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-mono text-[11px]">
                          {formatDateTime(log.sign_in)}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">{log.ip_address}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-xs">{log.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SQL Script & Setup */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Supabase Migration SQL: <code className="text-emerald-300 font-mono">03_employee_sign_in.sql</code>
                    </span>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Paste this into your Supabase SQL Editor (<a href={SUPABASE_SQL_EDITOR_URL} target="_blank" rel="noreferrer" className="text-sky-400 underline">open editor</a>) and click <strong>RUN</strong> to create Table #10 in your Supabase project!
                </p>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
                  {SQL_CREATE_TABLE}
                </pre>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Layers className="h-4 w-4 text-sky-400" />
                  <span>SQLite Schema Columns (Table: users)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {schemaInfo?.columns?.map(col => (
                    <div
                      key={col.name}
                      className={`p-2.5 rounded-xl border text-xs font-mono ${
                        col.name === 'sign_in'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 uppercase">{col.type}</div>
                      <div className="text-white mt-0.5">{col.name}</div>
                      {col.name === 'sign_in' && (
                        <div className="text-[9px] text-emerald-400 font-sans mt-0.5">★ Requested Column</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Project: <strong className="text-white font-mono">E-Workforce (ptxfxtxwytrzznswudlc)</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
