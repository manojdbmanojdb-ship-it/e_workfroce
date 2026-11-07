import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  Megaphone, X, Filter, Check, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

const TYPE_CONFIG = {
  task_assigned: { icon: '📋', badge: 'New Task', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  task_updated: { icon: '🔄', badge: 'Task Update', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  deadline_approaching: { icon: '⏰', badge: 'Deadline', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  task_approved: { icon: '✅', badge: 'Approved', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  task_rejected: { icon: '⚠️', badge: 'Revision Needed', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  attendance_reminder: { icon: '📍', badge: 'Attendance', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  manager_announcement: { icon: '📢', badge: 'Announcement', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' }
};

export default function EmployeeNotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'tasks' | 'announcements'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.is_read === 0;
    if (filter === 'tasks') return n.type.includes('task');
    if (filter === 'announcements') return n.type.includes('announcement');
    return true;
  });

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
            <Bell className="h-6 w-6 text-sky-500" />
            <span>Employee Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time field updates, manager approvals &amp; dispatch announcements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-500 transition-colors shadow-sm cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'tasks', label: 'Tasks' },
          { key: 'announcements', label: 'Announcements' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filter === key
                ? 'bg-slate-900 dark:bg-sky-500 text-white border-transparent shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
          <span>Fetching notifications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No notifications in this filter</h3>
          <p className="text-xs text-slate-500">You're all caught up with your notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.manager_announcement;
            const isUnread = item.is_read === 0;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-white dark:bg-slate-900/90 border-sky-400/50 shadow-md shadow-sky-500/5 ring-1 ring-sky-500/20'
                    : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 opacity-85'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                    {conf.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${conf.color}`}>
                        {conf.badge}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">
                        {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors flex-shrink-0 cursor-pointer"
                    title="Mark as Read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
