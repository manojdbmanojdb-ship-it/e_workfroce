import React, { useState } from 'react';
import {
  Moon, Sun, Bell, Shield, Smartphone, Globe,
  RefreshCw, Trash2, LogOut, ChevronRight, CheckCircle2,
  Lock, Server, Info, Radio, Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService, getDefaultApiBase } from '../services/apiService';

export const SettingsScreen: React.FC = () => {
  const { darkMode, toggleTheme, logout, showToast, isTrackingEnabled, toggleLocationTracking } = useApp();
  const [apiUrl, setApiUrl] = useState(() => apiService.getBaseUrl());
  const [isEditingApi, setIsEditingApi] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [taskPushAlerts, setTaskPushAlerts] = useState(true);
  const [shiftPushAlerts, setShiftPushAlerts] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);

  const handleSaveApiUrl = () => {
    apiService.setBaseUrl(apiUrl);
    setIsEditingApi(false);
    showToast('API Base URL updated!', 'success');
  };

  const handleResetApiUrl = () => {
    const defaultUrl = getDefaultApiBase();
    setApiUrl(defaultUrl);
    apiService.setBaseUrl(defaultUrl);
    setIsEditingApi(false);
    showToast('API URL reset to environment default', 'info');
  };

  const handleClearCache = () => {
    const confirmed = window.confirm('Clear local offline cached data and re-fetch from server?');
    if (confirmed) {
      localStorage.removeItem('ework_tasks_cache');
      localStorage.removeItem('ework_attendance_cache');
      showToast('Local offline cache cleared successfully', 'success');
    }
  };

  const handleConfirmLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out of E-WorkForce?');
    if (confirmed) {
      logout();
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings & Preferences</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure app behavior, hardware sensors & security
        </p>
      </div>

      {/* Appearance Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appearance</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-amber-500/15 text-amber-500'}`}>
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark Interface Theme</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Optimized high-contrast mode for outdoor sunlight and battery savings
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-12 h-6.5 flex items-center rounded-full p-0.5 transition-colors ${
              darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>
      </div>

      {/* Sensor & Location Telemetry */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GPS & Field Sensors</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Live Telemetry Sharing</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Shares coordinates with dispatcher during active shifts
              </p>
            </div>
          </div>

          <button
            onClick={toggleLocationTracking}
            className={`w-12 h-6.5 flex items-center rounded-full p-0.5 transition-colors ${
              isTrackingEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">High-Precision GNSS</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Utilizes dual-band satellite fix for meter-accurate waypoint check-in
            </p>
          </div>

          <button
            onClick={() => setHighAccuracyGps(!highAccuracyGps)}
            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
              highAccuracyGps ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Notifications & Security */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Alerts</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Biometric App Lock</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Require Fingerprint or Face Unlock upon opening app
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setBiometricsEnabled(!biometricsEnabled);
              showToast(biometricsEnabled ? 'Biometrics disabled' : 'Biometric authentication armed', 'info');
            }}
            className={`w-12 h-6.5 flex items-center rounded-full p-0.5 transition-colors ${
              biometricsEnabled ? 'bg-purple-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Urgent Task Push Notifications</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Vibrate and sound alarm when emergency work orders are assigned
            </p>
          </div>

          <button
            onClick={() => setTaskPushAlerts(!taskPushAlerts)}
            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
              taskPushAlerts ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Network & Backend Configuration */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Backend API Gateway
            </h4>
          </div>
          <button
            onClick={() => setIsEditingApi(!isEditingApi)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            {isEditingApi ? 'Cancel' : 'Change'}
          </button>
        </div>

        {isEditingApi ? (
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://10.0.2.2:5000/api"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveApiUrl}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Save Endpoint
              </button>
              <button
                onClick={handleResetApiUrl}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                Reset Default
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Note: Android Emulator reaches host machine via <code className="text-blue-500">10.0.2.2:5000</code>. Physical devices require LAN IP or public domain.
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-100 dark:border-slate-800/80 font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
            {apiUrl}
          </div>
        )}

        <button
          onClick={handleClearCache}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          <Database className="h-3.5 w-3.5 text-amber-500" />
          <span>Clear Offline Cache & Local Queue</span>
        </button>
      </div>

      {/* App Build Information */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Application</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">E-WorkForce Mobile</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Package ID</span>
          <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">com.eworkforce.app</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Release Version</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">v1.2.0 (Build 120)</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Android SDK Target</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">API 35 (Android 15)</span>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={handleConfirmLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 active:scale-98 text-red-600 dark:text-red-400 font-bold text-xs tracking-wider uppercase border border-red-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out of Employee Session</span>
        </button>
      </div>
    </div>
  );
};
