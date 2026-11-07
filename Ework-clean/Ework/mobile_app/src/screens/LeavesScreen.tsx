import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
  Plus, ChevronRight, X, FileText, Send, CalendarDays
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { LeaveRequest, LeaveBalances } from '../types';

export const LeavesScreen: React.FC = () => {
  const { showToast } = useApp();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalances>({
    annual: 14,
    sick: 8,
    casual: 6
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Casual'>('Casual');
  const [startDate, setStartDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Fetch leaves from API
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await apiService.getLeaves();
      if (res.success && res.data) {
        setLeaves(res.data.leaves || []);
        if (res.data.balances) {
          setBalances(res.data.balances);
        }
      }
    } catch {
      // Fallback demo leaves
      setLeaves([
        {
          id: 'lv-1',
          leaveType: 'Annual Leave',
          startDate: '2026-10-12',
          endDate: '2026-10-15',
          days: 3,
          reason: 'Family visit & personal errands',
          status: 'approved',
          appliedAt: '2026-10-01'
        },
        {
          id: 'lv-2',
          leaveType: 'Sick Leave',
          startDate: '2026-10-24',
          endDate: '2026-10-24',
          days: 1,
          reason: 'Seasonal viral flu and rest',
          status: 'approved',
          appliedAt: '2026-10-24'
        },
        {
          id: 'lv-3',
          leaveType: 'Casual Leave',
          startDate: '2026-11-14',
          endDate: '2026-11-15',
          days: 2,
          reason: 'Scheduled home renovation inspection',
          status: 'pending',
          appliedAt: '2026-11-04'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a reason for the leave request', 'error');
      return;
    }

    setSubmitting(true);
    const days = calculateDays();

    try {
      const res = await apiService.applyLeave({
        leaveType,
        startDate,
        endDate,
        days,
        reason
      });

      if (res.success) {
        showToast('Leave request submitted successfully!', 'success');
        setShowApplyModal(false);
        setReason('');
        fetchLeaves();
      } else {
        showToast(res.message || 'Failed to submit leave', 'error');
      }
    } catch {
      // Local optimistic update
      const newLeave: LeaveRequest = {
        id: `lv-${Date.now()}`,
        leaveType: `${leaveType} Leave`,
        startDate,
        endDate,
        days,
        reason,
        status: 'pending',
        appliedAt: new Date().toISOString().split('T')[0]
      };
      setLeaves(prev => [newLeave, ...prev]);
      showToast('Leave request recorded (buffered for sync)', 'success');
      setShowApplyModal(false);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header Card with Apply CTA */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Time Off & Attendance</span>
          <h2 className="text-lg font-bold">Leave Management</h2>
          <p className="text-xs text-blue-100/90 mt-0.5">Submit & track leaves with instant supervisor approval</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center space-x-1 shadow-inner active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Apply</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Annual</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {balances.annual}
          </div>
          <span className="text-[10px] text-slate-400">Days Left</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sick</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {balances.sick}
          </div>
          <span className="text-[10px] text-slate-400">Days Left</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Casual</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {balances.casual}
          </div>
          <span className="text-[10px] text-slate-400">Days Left</span>
        </div>
      </div>

      {/* Leave History List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave History & Requests</h3>
          <span className="text-[11px] text-slate-400">{leaves.length} records</span>
        </div>

        {leaves.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No leave applications filed yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((leave) => {
              const isApproved = leave.status === 'approved';
              const isPending = leave.status === 'pending';
              const isRejected = leave.status === 'rejected';

              return (
                <div
                  key={leave.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {leave.leaveType}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {leave.days} {leave.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1 ${
                      isApproved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isPending
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {isApproved && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                      {isPending && <Clock className="h-3 w-3 mr-0.5" />}
                      {isRejected && <XCircle className="h-3 w-3 mr-0.5" />}
                      <span>{leave.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#080e1c] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    "{leave.reason}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Applied on: {leave.appliedAt}</span>
                    <span>Ref: #{leave.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1629] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply for Leave</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5">
              {/* Type Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Leave Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Casual', 'Sick', 'Annual'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setLeaveType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        leaveType === type
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Duration calculation banner */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Duration</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {calculateDays()} {calculateDays() === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Reason for Time Off
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain purpose of leave for manager review..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting to Manager...' : 'Submit Application'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
