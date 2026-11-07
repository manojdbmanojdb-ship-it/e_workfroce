import React, { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield } from 'lucide-react';

import { ROUTE_HISTORY_DATA } from '../data/mockRouteHistory.js';

// Fix Leaflet's default icon missing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom styled markers for employees and sites
const createEmployeeIcon = (color, initial, speed) => L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="position: relative; width: 34px; height: 34px;">
      ${speed > 0 ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; opacity: 0.6; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="
        background: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 16px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 11px;
        font-family: sans-serif;
      ">${initial}</div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20]
});

const createVehiclePlaybackIcon = (speed = 0) => L.divIcon({
  className: 'vehicle-playback-icon',
  html: `
    <div style="position: relative; width: 38px; height: 38px;">
      <div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #38bdf8; opacity: 0.8; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="
        background: linear-gradient(135deg, #0284c7, #0ea5e9);
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 18px #38bdf8;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
      ">
        <span style="font-size: 13px; line-height: 1;">🚗</span>
        <span style="font-size: 7.5px; font-family: monospace; font-weight: bold; background: rgba(0,0,0,0.65); padding: 0 2px; border-radius: 2px; line-height: 1.1;">${speed}k</span>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20]
});

const createStopMarkerIcon = (emoji = '📍', number = 1, name = '') => L.divIcon({
  className: 'stop-marker-icon',
  html: `
    <div style="
      background: rgba(15, 23, 42, 0.95);
      border: 1.5px solid #38bdf8;
      border-radius: 8px;
      padding: 2px 6px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
      display: flex;
      align-items: center;
      gap: 3px;
      color: white;
      font-size: 11px;
      font-weight: bold;
      font-family: sans-serif;
      white-space: nowrap;
    ">
      <span>${emoji}</span>
      <span style="font-size: 9px; color: #38bdf8; font-family: monospace;">#${number}</span>
    </div>
  `,
  iconSize: [48, 24],
  iconAnchor: [24, 12],
  popupAnchor: [0, -14]
});

const createSiteIcon = (emoji = '🏢', color = '#0284c7', borderColor = '#38bdf8') => L.divIcon({
  className: 'site-div-icon',
  html: `<div style="
    background: ${color};
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 2px solid ${borderColor};
    box-shadow: 0 0 14px ${borderColor}B3;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 15px;
  ">${emoji}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18]
});

// Initial work sites with defined geofence perimeters
export const INITIAL_WORK_SITES = [
  { id: 'site-1', name: 'Delhi Corporate HQ', city: 'Delhi', lat: 28.6315, lng: 77.2167, radius: 150, color: '#0ea5e9', emoji: '🏢', type: 'hq' },
  { id: 'site-2', name: 'Mumbai Tech Hub', city: 'Mumbai', lat: 19.0600, lng: 72.8688, radius: 200, color: '#10b981', emoji: '🏬', type: 'branch' },
  { id: 'site-3', name: 'Bengaluru Depot', city: 'Bengaluru', lat: 12.9784, lng: 77.6408, radius: 150, color: '#f59e0b', emoji: '📦', type: 'depot' },
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveMap({ 
  staffList = [], 
  onSelectSite, 
  playbackMode = false, 
  playbackEmployeeId = 'emp-3', 
  playbackIndex = 0,
  darkMode = false
}) {
  const [sites] = useState(INITIAL_WORK_SITES);
  const [selectedSite, setSelectedSite] = useState(INITIAL_WORK_SITES[0]);

  // Playback route resolution
  const routeData = ROUTE_HISTORY_DATA[playbackEmployeeId] || ROUTE_HISTORY_DATA['emp-3'];
  const routePoints = routeData.points;
  const currentPlaybackPoint = routePoints[playbackIndex] || routePoints[0];

  const traveledPath = routePoints.slice(0, playbackIndex + 1).map(p => [p.lat, p.lng]);
  const remainingPath = routePoints.slice(playbackIndex).map(p => [p.lat, p.lng]);

  const center = playbackMode 
    ? [currentPlaybackPoint.lat, currentPlaybackPoint.lng] 
    : [selectedSite.lat, selectedSite.lng];

  const handleSiteChange = (site) => {
    setSelectedSite(site);
    if (onSelectSite) onSelectSite(site);
  };

  return (
    <div className={`relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden z-10 flex flex-col border transition-colors ${
      darkMode ? 'border-slate-800' : 'border-slate-300'
    }`}>
      
      {/* Top Left Controls: City Site Switcher */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[85%]">
        <div className={`flex items-center space-x-1 p-1 rounded-xl shadow-xl backdrop-blur-md border ${
          darkMode 
            ? 'bg-slate-900/90 border-slate-800 text-white' 
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
        }`}>
          {sites.map(s => (
            <div key={s.id} className="relative group flex items-center">
              <button
                onClick={() => handleSiteChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedSite.id === s.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/40'
                    : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{s.emoji || '🏢'}</span>
                <span>{s.city || s.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({s.radius}m)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Right Status Overlay */}
      <div className={`absolute top-3 right-3 z-[1000] backdrop-blur-md p-2 rounded-xl text-xs flex items-center space-x-2.5 shadow-xl border ${
        darkMode 
          ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
          : 'bg-white/95 border-slate-300 text-slate-800 shadow-md'
      }`}>
        {playbackMode ? (
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className={`font-bold text-[11px] ${darkMode ? 'text-cyan-300' : 'text-cyan-700 font-extrabold'}`}>Replay: {routeData.name}</span>
            <span className={darkMode ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`font-mono text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-700 font-bold'}`}>{currentPlaybackPoint.time}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`font-bold text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{staffList.length} Active Feeds</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={playbackMode ? 15 : 16}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[460px] flex-1"
        style={{ background: darkMode ? '#050b14' : '#f8fafc' }}
      >
        <ChangeView center={center} zoom={playbackMode ? 15 : 16} />

        {/* OpenStreetMap Basemap Tiles (No API key required, crisp and clean) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Work Sites & Defined Geofence Perimeters */}
        {sites.map(site => (
          <React.Fragment key={site.id}>
            <Marker position={[site.lat, site.lng]} icon={createSiteIcon(site.emoji, site.color, site.color)}>
              <Popup>
                <div className="p-1 text-slate-900">
                  <div className="font-black text-xs text-slate-950 flex items-center space-x-1">
                    <span>{site.emoji || '🏢'}</span>
                    <span>{site.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Boundary Radius: <strong>{site.radius}m</strong></div>
                  <div className="text-[10px] text-sky-700 font-mono mt-1">
                    {site.lat.toFixed(4)}° N, {site.lng.toFixed(4)}° E
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-200 text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Site Perimeter Active</span>
                  </div>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[site.lat, site.lng]}
              radius={site.radius}
              pathOptions={{
                color: site.color || '#38bdf8',
                fillColor: site.color || '#0284c7',
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '6, 6'
              }}
            />
          </React.Fragment>
        ))}

        {/* Playback Mode Overlays */}
        {playbackMode ? (
          <>
            {/* Traveled Polyline (Glowing Cyan) */}
            {traveledPath.length > 1 && (
              <Polyline
                positions={traveledPath}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 4,
                  opacity: 0.95
                }}
              />
            )}

            {/* Remaining Future Route Polyline (Dashed Grey) */}
            {remainingPath.length > 1 && (
              <Polyline
                positions={remainingPath}
                pathOptions={{
                  color: '#64748b',
                  weight: 3,
                  dashArray: '6, 8',
                  opacity: 0.55
                }}
              />
            )}

            {/* Waypoint / Stop Markers */}
            {routeData.stops.map((stop, i) => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={createStopMarkerIcon(
                  stop.type === 'depot' ? '🏢' : stop.type === 'fuel' ? '⛽' : stop.type === 'transit' ? '🛣️' : '📍',
                  i + 1,
                  stop.name
                )}
              >
                <Popup>
                  <div className="p-1 text-slate-900 font-sans">
                    <div className="font-bold text-xs">{stop.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Arrived: <strong>{stop.time}</strong> ({stop.duration})</div>
                    <div className="text-[10px] text-slate-500 mt-1">{stop.notes}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Animated Moving Vehicle Marker */}
            <Marker
              position={[currentPlaybackPoint.lat, currentPlaybackPoint.lng]}
              icon={createVehiclePlaybackIcon(currentPlaybackPoint.speed)}
            >
              <Popup>
                <div className="p-1 text-slate-900 font-sans">
                  <div className="font-bold text-xs text-sky-800">{routeData.name}</div>
                  <div className="text-[11px] text-slate-600">{currentPlaybackPoint.street}</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {currentPlaybackPoint.speed > 0 ? `🚗 Speed: ${currentPlaybackPoint.speed} km/h` : '🛑 Stopped / Idle'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Recorded: {currentPlaybackPoint.time}
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        ) : (
          <>
            {/* Traveled Route Breadcrumb Polylines */}
            {staffList.map((staff) => {
              if (!staff.routeTrail || staff.routeTrail.length < 2) return null;
              return (
                <Polyline
                  key={`trail-${staff.id}`}
                  positions={staff.routeTrail}
                  pathOptions={{
                    color: staff.status === 'In Transit' ? '#38bdf8' : '#10b981',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '4, 6'
                  }}
                />
              );
            })}

            {/* Live Moving Employees */}
            {staffList.map((staff) => {
              const isAtSite = staff.status === 'At Site' || staff.status === 'On Task';
              const markerColor = isAtSite ? '#10b981' : staff.status === 'In Transit' ? '#0ea5e9' : '#6366f1';
              const pos = [staff.lat, staff.lng];

              return (
                <Marker
                  key={staff.id}
                  position={pos}
                  icon={createEmployeeIcon(markerColor, staff.name.charAt(0), staff.speed)}
                >
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-xs">{staff.name}</span>
                        <span className="text-[10px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                          {staff.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">{staff.role}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">📋 {staff.task}</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-1">
                        GPS: {staff.lat.toFixed(4)}° N, {staff.lng.toFixed(4)}° E
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-1">
                        🔋 {staff.battery}% Battery · {staff.speed > 0 ? `🚗 ${staff.speed} km/h` : '🚶 Stopped'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

      </MapContainer>
    </div>
  );
}
