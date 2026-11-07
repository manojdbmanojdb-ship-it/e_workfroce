import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, Clock, CheckCircle2, AlertTriangle,
  Info, MessageSquare, ArrowRight, ShieldCheck, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { NotificationItem } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'tasks' | 'system' | 'alerts'>('all');
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Default fallback notifications
      setNotifications([
        {
          id: 'notif-1',
          title: 'New High Priority Task Assigned',
          message: 'Industrial AC Compressor Inspection has been assigned to your shift today at Sector 62.',
          time: '15m ago',
          read: false,
          type: 'task',
          priority: 'urgent',
          actionUrl: '/employee/tasks'
        },
        {
          id: 'notif-2',
          title: 'Leave Application Approved',
          message: 'Your 3-day Annual Leave application for family visit has been approved by Operations Manager.',
          time: '2h ago',
          read: false,
          type: 'system',
          priority: 'medium'
        },
        {
          id: 'notif-3',
          title: 'Geofence Verification Successful',
          message: 'GPS confirmed your presence inside Sector 44 Tech Hub geofence at 09:12 AM.',
          time: '4h ago',
          read: true,
          type: 'alert',
          priority: 'low'
        },
        {
          id: 'notif-4',
          title: 'Shift Attendance Recorded',
          message: 'Punch-in timestamp was successfully committed to the database.',
          time: '6h ago',
          read: true,
          type: 'system',
          priority: 'low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('Notifications marked as read', 'info');
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    // Mark as read
    try {
      await apiService.markNotificationRead(notif.id);
    } catch {
      // offline safe
    }
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

    if (notif.type === 'task') {
      navigateTo('tasks');
    } else if (notif.type === 'alert') {
      navigateTo('location');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'tasks') return n.type === 'task';
    if (filter === 'system') return n.type === 'system';
    if (filter === 'alerts') return n.type === 'alert';
    return true;
  });

  const unreadTotal = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 space-y-3.5 pb-24">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Notifications</span>
            {unreadTotal > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                {unreadTotal} new
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Field dispatches, shift alerts & supervisor updates
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'tasks', 'alerts', 'system'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 space-y-2">
          <Bell className="h-10 w-10 mx-auto opacity-30 text-blue-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</h3>
          <p className="text-[11px] max-w-xs mx-auto">
            No unread notifications in this category. You're completely up to date with field assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const isTask = notif.type === 'task';
            const isAlert = notif.type === 'alert';

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  !notif.read
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm'
                    : 'bg-white dark:bg-[#0c1629] border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                )}

                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isTask
                      ? 'bg-blue-500/15 text-blue-500'
                      : isAlert
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-purple-500/15 text-purple-500'
                  }`}>
                    {isTask ? <CheckCircle2 className="h-4 w-4" /> : isAlert ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 pr-4">
                    <h4 className={`text-xs font-bold ${!notif.read ? 'text-blue-950 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{notif.time}</span>
                      {isTask && (
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center space-x-0.5">
                          <span>View Task</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
