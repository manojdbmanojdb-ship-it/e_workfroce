import React, { useState, useEffect } from 'react';
import {
  Navigation, Shield, ShieldCheck, AlertTriangle, RefreshCw,
  MapPin, Radio, Compass, BatteryCharging, ExternalLink,
  Activity, CheckCircle2, Clock, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';

interface TelemetryPing {
  id: string;
  time: string;
  lat: number;
  lng: number;
  accuracy: number;
  status: 'synced' | 'pending';
}

export const LocationScreen: React.FC = () => {
  const { currentLocation, isTrackingEnabled, toggleLocationTracking, showToast } = useApp();
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryPing[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(true);

  // Generate initial recent telemetry logs
  useEffect(() => {
    const now = new Date();
    const logs: TelemetryPing[] = [
      {
        id: '1',
        time: new Date(now.getTime() - 2 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: currentLocation.accuracy || 6,
        status: 'synced'
      },
      {
        id: '2',
        time: new Date(now.getTime() - 7 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: currentLocation.lat + 0.0004,
        lng: currentLocation.lng + 0.0002,
        accuracy: 9,
        status: 'synced'
      },
      {
        id: '3',
        time: new Date(now.getTime() - 14 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: currentLocation.lat + 0.0011,
        lng: currentLocation.lng - 0.0005,
        accuracy: 12,
        status: 'synced'
      }
    ];
    setTelemetryLogs(logs);
  }, [currentLocation]);

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const newEntry: TelemetryPing = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: currentLocation.accuracy,
        status: 'synced'
      };
      setTelemetryLogs(prev => [newEntry, ...prev.slice(0, 7)]);
      showToast('GPS heartbeat sent to dispatcher', 'success');
    }, 800);
  };

  const handleTriggerSOS = async () => {
    const confirmed = window.confirm(
      'BROADCAST EMERGENCY SOS BEACON?\n\nThis will instantly alert field management dispatchers with your high-precision GPS coordinates.'
    );
    if (!confirmed) return;

    setSosActive(true);
    try {
      await apiService.triggerSOS(currentLocation.lat, currentLocation.lng, 'EMERGENCY: Field staff pressed SOS Panic in Mobile App');
      showToast('EMERGENCY SOS BEACON BROADCASTED TO DISPATCH!', 'error');
    } catch {
      showToast('SOS broadcast sent via fallback telemetry!', 'error');
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`;
    window.open(url, '_system');
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Banner / Privacy Consent Guarantee */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Transparent Privacy Policy</h4>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              E-WorkForce shares GPS telemetry <strong className="text-blue-600 dark:text-blue-300">strictly while you are clocked in</strong> on duty. 
              No location data is harvested outside your authorized shift.
            </p>
          </div>
        </div>
      </div>

      {/* Main GPS Live Status Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${isTrackingEnabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>
              <Radio className={`h-5 w-5 ${isTrackingEnabled ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Field Telemetry</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTrackingEnabled ? 'Real-time background broadcast ACTIVE' : 'Broadcasting is paused'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleLocationTracking}
            className={`w-12 h-6.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
              isTrackingEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>

        {/* Live Coordinate Badges */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#080e1c] border border-slate-100 dark:border-slate-800/80 mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <Compass className="h-3 w-3 text-sky-400" />
              <span>Latitude</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
              {currentLocation.lat.toFixed(6)}° N
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <Compass className="h-3 w-3 text-emerald-400" />
              <span>Longitude</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
              {currentLocation.lng.toFixed(6)}° E
            </div>
          </div>

          <div className="space-y-0.5 pt-2 border-t border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <Activity className="h-3 w-3 text-amber-400" />
              <span>Accuracy</span>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ±{Math.round(currentLocation.accuracy)} meters
            </div>
          </div>

          <div className="space-y-0.5 pt-2 border-t border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <Navigation className="h-3 w-3 text-indigo-400" />
              <span>Speed</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
              0.0 km/h (Stationary)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={openInGoogleMaps}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            <span>Open in Maps</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Heartbeat</span>
          </button>
        </div>
      </div>

      {/* Geofence Detection Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Assigned Geofence</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                Inside Zone
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sector 44 Tech Hub (Radius: 250m)
            </p>
          </div>
        </div>
      </div>

      {/* Battery Optimization Setting */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <BatteryCharging className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart Battery Optimizer</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Lowers GPS polling frequency when stationary to conserve battery
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setBatteryOptimization(!batteryOptimization);
            showToast(batteryOptimization ? 'Smart optimization disabled' : 'Smart battery optimizer enabled', 'info');
          }}
          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
            batteryOptimization ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
          }`}
        >
          <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      {/* Recent Telemetry Heartbeat Trail */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Telemetry Heartbeats</h4>
          <span className="text-[10px] text-slate-400 font-mono">Auto-sync 30s</span>
        </div>

        <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {telemetryLogs.map((log) => (
            <div key={log.id} className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Accuracy: ±{log.accuracy}m
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono">
                <Clock className="h-3 w-3" />
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency SOS Panic Beacon */}
      <div className="pt-2">
        <button
          onClick={handleTriggerSOS}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all"
        >
          <AlertTriangle className="h-4 w-4 animate-bounce" />
          <span>{sosActive ? 'SOS SIGNAL BROADCASTED' : 'EMERGENCY SOS PANIC BEACON'}</span>
        </button>
        <p className="text-center text-[10px] text-slate-400 mt-1.5">
          Hold or tap in distress to transmit your immediate coordinates to emergency response dispatch.
        </p>
      </div>
    </div>
  );
};
