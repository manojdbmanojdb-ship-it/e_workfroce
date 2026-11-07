import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2, XCircle, Clock, MapPin, Download, AlertTriangle,
  RefreshCw, Plus, X, Calculator, FileText, DollarSign, Award,
  ArrowUpRight, ShieldCheck, Sparkles, Building2
} from 'lucide-react';
import SalarySlipModal from '../components/SalarySlipModal';

const API_BASE = 'http://localhost:5000/api';

const STATUS_STYLE = {
  present: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold',
  late: 'bg-amber-500/15 text-amber-900 dark:text-amber-400 border-amber-500/30 font-bold',
  absent: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 font-bold',
  half_day: 'bg-orange-500/15 text-orange-900 dark:text-orange-400 border-orange-500/30 font-bold',
};

const EMPLOYEES = [
  { id: 'emp-1', name: 'Rahul Sharma', role: 'Technician' },
  { id: 'emp-2', name: 'Priya Patel', role: 'Sales Executive' },
  { id: 'emp-3', name: 'Amit Verma', role: 'Delivery Agent' },
  { id: 'emp-4', name: 'Sneha Rao', role: 'Site Inspector' },
];

const INITIAL_PAYROLL_ROSTER = [
  {
    id: 'emp-1',
    name: 'Rahul Sharma',
    role: 'Senior Field Technician',
    code: 'EMP-2026-042',
    bankAccount: '50100492819201',
    basicSalary: 34000,
    daysPresent: 24,
    regularHours: 192,
    otHours: 18.5,
    expenseReimbursement: 5350,
    efficiency: '96%'
  },
  {
    id: 'emp-2',
    name: 'Priya Patel',
    role: 'Field Sales Executive',
    code: 'EMP-2026-088',
    bankAccount: '91802004812391',
    basicSalary: 31000,
    daysPresent: 22,
    regularHours: 176,
    otHours: 8.0,
    expenseReimbursement: 1820,
    efficiency: '91%'
  },
  {
    id: 'emp-3',
    name: 'Amit Verma',
    role: 'Logistics & Delivery Lead',
    code: 'EMP-2026-105',
    bankAccount: '30910294817290',
    basicSalary: 28000,
    daysPresent: 23,
    regularHours: 184,
    otHours: 14.0,
    expenseReimbursement: 3200,
    efficiency: '88%'
  },
  {
    id: 'emp-4',
    name: 'Sneha Rao',
    role: 'Safety & Site Inspector',
    code: 'EMP-2026-019',
    bankAccount: '60192837482910',
    basicSalary: 36000,
    daysPresent: 21,
    regularHours: 168,
    otHours: 4.5,
    expenseReimbursement: 4100,
    efficiency: '98%'
  },
  {
    id: 'emp-5',
    name: 'Vikram Singh',
    role: 'HVAC Field Engineer',
    code: 'EMP-2026-061',
    bankAccount: '10928374619283',
    basicSalary: 33000,
    daysPresent: 22,
    regularHours: 176,
    otHours: 12.5,
    expenseReimbursement: 2450,
    efficiency: '85%'
  }
];

export default function AttendancePage({ darkMode = false }) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'payroll'
  const [attendance, setAttendance] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Overtime & Payroll Calculator Configuration
  const [otMultiplier, setOtMultiplier] = useState(1.5); // 1.5x standard or 2.0x double
  const [standardShiftHours, setStandardShiftHours] = useState(8);
  const [payrollRoster, setPayrollRoster] = useState(INITIAL_PAYROLL_ROSTER);
  const [selectedPayrollSlip, setSelectedPayrollSlip] = useState(null);

  const [form, setForm] = useState({
    userId: EMPLOYEES[0].id,
    siteId: '',
    lat: 28.6315,
    lng: 77.2167,
    method: 'gps_geofence'
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/attendance`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAttendance(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await fetch('https://ptxfxtxwytrzznswudlc.supabase.co/rest/v1/work_sites?select=*', {
        headers: {
          'apikey': 'sb_publishable_G3ztWl6ullU0Zn0NJgJn9Q_AAKDtdFQ'
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSites(data);
        if (data.length > 0 && !form.siteId) {
          setForm(f => ({ ...f, siteId: data[0].id, lat: data[0].latitude, lng: data[0].longitude }));
        }
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchSites();

    const socket = io('http://localhost:5000');
    socket.on('employee_checked_in', () => {
      fetchAttendance();
    });
    socket.on('employee_checked_out', () => {
      fetchAttendance();
    });

    return () => socket.disconnect();
  }, []);

  const handleSimulateCheckIn = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowCheckInModal(false);
        fetchAttendance();
      } else {
        alert(data.message || 'Check-in rejected by geofence validator');
      }
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/check-out/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: 28.6315, lng: 77.2167 })
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendance();
      }
    } catch (err) {
      console.error('Check-out error:', err);
    }
  };

  const exportCSV = () => {
    const listToExport = filtered.length > 0 ? filtered : attendance;
    if (listToExport.length === 0) return;

    const headers = ['Record ID,Employee,Site,Check In,Check Out,Method,Overtime (Min),Status,Geofence Valid'];
    const rows = listToExport.map(r => {
      const emp = r.profiles?.full_name || 'Rahul Sharma';
      const site = r.work_sites?.name || (r.work_site_id ? 'Delhi Corporate HQ' : 'Connaught Place Site');
      const inTime = r.check_in_time ? new Date(r.check_in_time).toLocaleString() : 'N/A';
      const outTime = r.check_out_time ? new Date(r.check_out_time).toLocaleString() : 'Active';
      const within = r.is_within_geofence ? 'YES' : 'NO';
      return `"${r.id}","${emp}","${site}","${inTime}","${outTime}","${r.verification_method || 'GPS'}","${r.overtime_minutes || 0}","${r.status}","${within}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ework_attendance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBatchPayrollCSV = () => {
    const headers = ['Employee ID,Employee Name,Role,Days Present,Standard Hours,Overtime Hours,OT Multiplier,Base Salary,OT Payout,Expense Reimbursement,Gross Pay,Deductions,Net Payout (INR)\n'];
    const rows = payrollRoster.map(emp => {
      const hourlyRate = Math.round(emp.basicSalary / emp.regularHours);
      const otRate = Math.round(hourlyRate * otMultiplier);
      const otPayout = Math.round(emp.otHours * otRate);
      const hra = Math.round(emp.basicSalary * 0.4);
      const conveyance = 2400;
      const gross = emp.basicSalary + hra + conveyance + otPayout + emp.expenseReimbursement;
      const epf = Math.round(emp.basicSalary * 0.12);
      const esi = Math.round(gross * 0.0075);
      const profTax = 200;
      const deductions = epf + esi + profTax;
      const net = gross - deductions;

      return `"${emp.code}","${emp.name}","${emp.role}","${emp.daysPresent}","${emp.regularHours}","${emp.otHours}","${otMultiplier}x","${emp.basicSalary}","${otPayout}","${emp.expenseReimbursement}","${gross}","${deductions}","${net}"`;
    });

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EWORK_PAYROLL_BATCH_OCT2026.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filtered = attendance.filter(a => filter === 'all' || a.status === filter);

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    late: attendance.filter(a => a.status === 'late').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    overtime: attendance.filter(a => a.overtime_minutes > 0).length,
  };

  // Live Payroll Metrics Aggregations
  const totalOtHours = payrollRoster.reduce((sum, e) => sum + e.otHours, 0);
  const totalReimbursements = payrollRoster.reduce((sum, e) => sum + e.expenseReimbursement, 0);
  const totalGrossPayroll = payrollRoster.reduce((sum, e) => {
    const hourlyRate = Math.round(e.basicSalary / e.regularHours);
    const otRate = Math.round(hourlyRate * otMultiplier);
    const otPayout = Math.round(e.otHours * otRate);
    const hra = Math.round(e.basicSalary * 0.4);
    const conveyance = 2400;
    return sum + (e.basicSalary + hra + conveyance + otPayout + e.expenseReimbursement);
  }, 0);
  const totalNetPayroll = payrollRoster.reduce((sum, e) => {
    const hourlyRate = Math.round(e.basicSalary / e.regularHours);
    const otRate = Math.round(hourlyRate * otMultiplier);
    const otPayout = Math.round(e.otHours * otRate);
    const hra = Math.round(e.basicSalary * 0.4);
    const conveyance = 2400;
    const gross = e.basicSalary + hra + conveyance + otPayout + e.expenseReimbursement;
    const epf = Math.round(e.basicSalary * 0.12);
    const esi = Math.round(gross * 0.0075);
    const profTax = 200;
    return sum + (gross - (epf + esi + profTax));
  }, 0);

  return (
    <div className={`p-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b mb-6 ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-display uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-950'}`}>Attendance &amp; Payroll System</h1>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            Automated 8-hour shift calculation, 1.5x overtime allowance, expense reimbursement &amp; salary slips
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className={`flex items-center space-x-2 p-1 rounded-xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Live Shift Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Overtime &amp; Payroll Calculator</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">1.5x OT</span>
          </button>
        </div>
      </div>

      {/* ===================== VIEW 1: ATTENDANCE LOGS ===================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              {['all', 'present', 'late', 'absent'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : darkMode 
                        ? 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Attendance Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAttendance}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode 
                    ? 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white' 
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                }`}
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              </button>
              <button
                onClick={exportCSV}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  darkMode 
                    ? 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200' 
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                }`}
              >
                <Download className="h-4 w-4 text-sky-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowCheckInModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-sky-400 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /><span>Record Check-In</span>
              </button>
            </div>
          </div>

          {/* Stats KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Present', stats.present, 'emerald'],
              ['Late', stats.late, 'yellow'],
              ['Absent', stats.absent, 'red'],
              ['Overtime Shifts', stats.overtime, 'sky']
            ].map(([label, val, color]) => (
              <div key={label} className={`p-4 rounded-2xl border ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>{val}</div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</div>
              </div>
            ))}
          </div>

          {/* Live Attendance Table */}
          <div className={`rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b text-left ${
                  darkMode ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-100/80 text-slate-700'
                }`}>
                  {['Site Location', 'Check-In Time', 'Check-Out Time', 'Verification Method', 'Overtime', 'Status', 'Geofence Valid', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const checkInTime = row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const checkOutTime = row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                  const siteName = row.work_sites?.name || 'Assigned Site Zone';

                  return (
                    <tr key={row.id} className={`border-b transition-colors ${
                      darkMode 
                        ? `border-slate-800/50 hover:bg-slate-800/40 ${i % 2 === 0 ? '' : 'bg-slate-950/20'}`
                        : `border-slate-200 hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`
                    }`}>
                      <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          <span>{siteName}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-mono ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{checkInTime}</td>
                      <td className={`px-4 py-3 font-mono ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {checkOutTime || <span className="text-emerald-500 font-bold text-[11px] animate-pulse">● Active On-Duty</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-[11px] ${
                          darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200 font-medium'
                        }`}>
                          {row.verification_method === 'gps_geofence' ? '📡 GPS Geofence' : '📷 QR Code'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sky-600 dark:text-sky-400 font-bold">
                        {row.overtime_minutes > 0 ? `+${row.overtime_minutes} min` : '0 min'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_STYLE[row.status] || STATUS_STYLE.present}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.is_within_geofence ? (
                          <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-400 font-semibold text-[11px]">
                            <XCircle className="h-4 w-4" />
                            <span>Outside</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!row.check_out_time ? (
                          <button
                            onClick={() => handleCheckOut(row.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Check Out
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-xs text-slate-500">
                      No attendance records recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: OVERTIME & PAYROLL CALCULATOR ===================== */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Payroll Configuration & Control Strip */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition-colors ${
            darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span>Shift Benchmark & Overtime Rate Engine</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    Compliant with Factories Act 1948
                  </span>
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Standard shift is 8.0 hours/day (48 hrs/week). Work beyond 8 hours is credited at the configured multiplier.
                </p>
              </div>
            </div>

            {/* Interactive Calculator Switches */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-600 dark:text-slate-400 px-2 font-medium">OT Rate:</span>
                <button
                  type="button"
                  onClick={() => setOtMultiplier(1.5)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    otMultiplier === 1.5
                      ? 'bg-emerald-600 text-white font-bold shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/40'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  1.5x (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setOtMultiplier(2.0)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    otMultiplier === 2.0
                      ? 'bg-amber-600 text-white font-bold shadow-xs dark:bg-amber-500/20 dark:text-amber-400 dark:border dark:border-amber-500/40'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  2.0x (Holiday/Weekend)
                </button>
              </div>

              <button
                type="button"
                onClick={exportBatchPayrollCSV}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                <span>Export NEFT Batch CSV</span>
              </button>
            </div>
          </div>

          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Net Take-Home Payroll</div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                ₹{totalNetPayroll.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-emerald-400/80 mt-1">Disbursement ready for 5 field staff</div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 shadow-xs">
              <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">Total Overtime Hours Logged</div>
              <div className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
                +{totalOtHours.toFixed(1)} hrs
              </div>
              <div className="text-[10px] text-slate-500 dark:text-sky-400/80 mt-1">Beyond standard 8-hour shift ceiling</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-xs">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Overtime Allowance Paid</div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 font-mono">
                ₹{Math.round(payrollRoster.reduce((sum, e) => {
                  const rate = Math.round(e.basicSalary / e.regularHours) * otMultiplier;
                  return sum + (e.otHours * rate);
                }, 0)).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-amber-400/80 mt-1">Calculated at {otMultiplier}x hourly wage</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 shadow-xs">
              <div className="text-xs font-semibold text-purple-800 dark:text-purple-300">Approved Expense Reimbursements</div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1 font-mono">
                ₹{totalReimbursements.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-purple-400/80 mt-1">Fuel, tools & field spare parts claims</div>
            </div>
          </div>

          {/* Payroll Calculation Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className="flex items-center space-x-2">
                <FileText className={`h-4 w-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Field Workforce Payroll & Wage Register — October 2026
                </span>
              </div>
              <span className={`text-[11px] font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Auto-computed from GPS check-in/out timestamps
              </span>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b text-left font-bold text-[11px] uppercase ${
                  darkMode ? 'border-slate-800 bg-slate-900/90 text-slate-400' : 'border-slate-200 bg-slate-100/90 text-slate-700'
                }`}>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-3 py-3 text-center">Days / Regular Hrs</th>
                  <th className="px-3 py-3 text-center">Overtime Logged</th>
                  <th className="px-3 py-3 text-right">Base Wage</th>
                  <th className="px-3 py-3 text-right">OT Allowance ({otMultiplier}x)</th>
                  <th className="px-3 py-3 text-right">Reimbursements</th>
                  <th className="px-3 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">Net Take-Home</th>
                  <th className="px-4 py-3 text-center">Payslip Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payrollRoster.map((emp) => {
                  const hourlyRate = Math.round(emp.basicSalary / emp.regularHours);
                  const otRate = Math.round(hourlyRate * otMultiplier);
                  const otPayout = Math.round(emp.otHours * otRate);
                  const hra = Math.round(emp.basicSalary * 0.4);
                  const conveyance = 2400;
                  const gross = emp.basicSalary + hra + conveyance + otPayout + emp.expenseReimbursement;
                  const epf = Math.round(emp.basicSalary * 0.12);
                  const esi = Math.round(gross * 0.0075);
                  const profTax = 200;
                  const deductions = epf + esi + profTax;
                  const net = gross - deductions;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                          <span>{emp.role}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400 dark:text-slate-500">{emp.code}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="font-mono font-bold text-slate-200">{emp.daysPresent} days</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emp.regularHours} hrs (8h/day)</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px]">
                          +{emp.otHours} hrs
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">@ ₹{otRate}/hr</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-300">
                        ₹{emp.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-amber-400">
                        +₹{otPayout.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sky-400">
                        +₹{emp.expenseReimbursement.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-black text-emerald-400 text-sm">
                        ₹{net.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPayrollSlip({ ...emp, otMultiplier })}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Generate Salary Slip</span>
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

      {/* Record Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Record Check-In (Supabase)</h2>
              <button onClick={() => setShowCheckInModal(false)} className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Work Site Destination</label>
                <select
                  value={form.siteId}
                  onChange={e => {
                    const sel = sites.find(s => s.id === e.target.value);
                    setForm(f => ({
                      ...f,
                      siteId: e.target.value,
                      lat: sel ? sel.latitude : f.lat,
                      lng: sel ? sel.longitude : f.lng
                    }));
                  }}
                  className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.radius_meters}m boundary)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Verification Method</label>
                <select
                  value={form.method}
                  onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                  className={`w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer ${
                    darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="gps_geofence">GPS Geofence (Automatic)</option>
                  <option value="qr_code">QR Code at Entrance</option>
                </select>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] ${
                darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span className="font-bold text-sky-500">Geofence Rule:</span> Staff must be within 150m of the site latitude & longitude. If outside, the system will reject GPS check-in.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckInModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateCheckIn}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg transition-all hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Verifying Coordinates...' : 'Submit Check-In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Monthly Salary Slip & Wage Certificate Modal */}
      <SalarySlipModal
        isOpen={!!selectedPayrollSlip}
        onClose={() => setSelectedPayrollSlip(null)}
        payrollRecord={selectedPayrollSlip}
      />

    </div>
  );
}
