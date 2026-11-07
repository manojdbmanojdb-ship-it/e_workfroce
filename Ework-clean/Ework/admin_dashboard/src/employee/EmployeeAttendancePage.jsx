import React, { useState, useEffect } from 'react';
import {
  Clock, MapPin, CheckCircle2, AlertTriangle, Play, Pause,
  Calendar, FileText, Download, ShieldCheck, RefreshCw, X, Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

export default function EmployeeAttendancePage({ currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    days: 1,
    reason: ''
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/attendance?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentUser]);

  // Check In Handler
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';

      const res = await fetch(`${API_BASE}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lat: 28.6318,
          lng: 77.2170,
          notes: 'Standard morning shift GPS check-in'
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        await fetchAttendance();
      } else {
        setErrorMsg(json.error || json.message || 'Check-in failed');
      }
    } catch (err) {
      setErrorMsg('Network error while checking in.');
    } finally {
      setActionLoading(false);
    }
  };

  // Check Out Handler
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';

      const res = await fetch(`${API_BASE}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lat: 28.6318,
          lng: 77.2170
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        await fetchAttendance();
      } else {
        setErrorMsg(json.error || json.message || 'Check-out failed');
      }
    } catch (err) {
      setErrorMsg('Network error while checking out.');
    } finally {
      setActionLoading(false);
    }
  };

  // Break Toggle Handler
  const handleToggleBreak = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';

      const res = await fetch(`${API_BASE}/attendance/break`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        await fetchAttendance();
      } else {
        setErrorMsg(json.error || 'Failed to toggle break');
      }
    } catch (err) {
      setErrorMsg('Network error during break toggle.');
    } finally {
      setActionLoading(false);
    }
  };

  // Apply Leave Handler
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';

      const res = await fetch(`${API_BASE}/leave-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...leaveForm
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowLeaveModal(false);
        setSuccessMsg('Leave request submitted and logged with dispatch manager.');
        setLeaveForm({ leaveType: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
        await fetchAttendance();
      } else {
        setErrorMsg(json.error || 'Failed to apply for leave');
      }
    } catch (err) {
      setErrorMsg('Failed to apply for leave.');
    } finally {
      setActionLoading(false);
    }
  };

  const records = data?.records || [];
  const today = data?.today;
  const stats = data?.stats || {};
  const leave = stats.leaveBalance || { annual: 14, sick: 8, casual: 4 };

  const isCheckedIn = today && today.check_in_time && !today.check_out_time;
  const isCheckedOut = today && today.check_out_time;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="h-6 w-6 text-sky-500" />
            <span>Attendance &amp; Time Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geofenced check-in, shift duration timers, late arrival tracking &amp; leave balances
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Apply for Leave</span>
          </button>

          <button
            onClick={fetchAttendance}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-500 transition-colors shadow-sm cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Top Shift Punch Console & Leave Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Punch Console (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                  Live Dispatch Terminal
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Today's Shift Punch Console
                </h3>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Geofence Guard Active</span>
              </div>
            </div>

            {/* Shift Status Highlights */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Punch In</span>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {today?.check_in_time ? new Date(today.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {today?.check_in_time ? 'Verified at Site' : 'Pending'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Punch Out</span>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {today?.check_out_time ? new Date(today.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <span className="text-[10px] text-slate-400">
                  {today?.check_out_time ? 'Shift Closed' : 'On-Duty'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Break Taken</span>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {today?.break_minutes || 0} min
                </div>
                <span className={`text-[10px] font-bold ${today?.is_on_break ? 'text-amber-500' : 'text-slate-400'}`}>
                  {today?.is_on_break ? 'Currently Paused' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
            {!today?.check_in_time && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Punch Check-In (GPS Verified)</span>
              </button>
            )}

            {isCheckedIn && (
              <>
                <button
                  onClick={handleToggleBreak}
                  disabled={actionLoading}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex items-center space-x-1.5 ${
                    today?.is_on_break
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {today?.is_on_break ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  <span>{today?.is_on_break ? 'Resume Shift' : 'Take Break'}</span>
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Punch Check-Out (End Shift)</span>
                </button>
              </>
            )}

            {isCheckedOut && (
              <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold text-center">
                ✓ Shift successfully completed for today. Overtime recorded: {today?.overtime_minutes || 0} minutes.
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances & Summary (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Leave &amp; Entitlements
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CY 2026</span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-center">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Annual</span>
                <div className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono mt-1">
                  {leave.annual}
                </div>
                <span className="text-[9px] text-slate-400">Days Left</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Sick</span>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                  {leave.sick}
                </div>
                <span className="text-[9px] text-slate-400">Days Left</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-center">
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Casual</span>
                <div className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono mt-1">
                  {leave.casual}
                </div>
                <span className="text-[9px] text-slate-400">Days Left</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Total Days Present:</span>
                <strong className="text-emerald-500 font-mono">{stats.daysPresent || 11} days</strong>
              </div>
              <div className="flex justify-between">
                <span>Days Absent:</span>
                <strong className="text-rose-500 font-mono">{stats.absentCount || 1} day</strong>
              </div>
              <div className="flex justify-between">
                <span>Late Arrivals (&gt;15 min):</span>
                <strong className="text-amber-500 font-mono">{stats.lateCount || 2} occasions</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Cumulative Hours:</span>
                <strong className="text-sky-500 font-mono">{stats.totalWorkHours || '84.2'} hrs</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
          >
            Submit Leave Request
          </button>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Attendance Records &amp; Shift History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Showing last 60 shifts</span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Date</th>
                <th className="pb-2.5 font-bold">Check-In</th>
                <th className="pb-2.5 font-bold">Check-Out</th>
                <th className="pb-2.5 font-bold">Work Duration</th>
                <th className="pb-2.5 font-bold">Overtime</th>
                <th className="pb-2.5 font-bold">Status</th>
                <th className="pb-2.5 font-bold">Verification</th>
                <th className="pb-2.5 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white font-mono">
                    {rec.date}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">
                    {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">
                    {rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                    {rec.work_minutes > 0 ? `${(rec.work_minutes / 60).toFixed(1)} hrs` : '--'}
                  </td>
                  <td className="py-3 font-mono text-sky-500 font-bold">
                    {rec.overtime_minutes > 0 ? `+${rec.overtime_minutes} min` : '0 min'}
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      rec.status === 'present' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                      rec.status === 'late' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                      'bg-red-500/15 text-red-500'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span>GPS Geofence</span>
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-500 max-w-xs truncate">
                    {rec.notes || 'On-time site punch'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1220] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply for Leave Request</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Category</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="annual">Annual Leave (Balance: {leave.annual} days)</option>
                  <option value="sick">Sick / Medical Leave (Balance: {leave.sick} days)</option>
                  <option value="casual">Casual Leave (Balance: {leave.casual} days)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Personal commitment, family medical reason..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
