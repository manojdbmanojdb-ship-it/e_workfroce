// Rich historical turn-by-turn route data with timestamps, speeds, and waypoints for Delhi NCR

export const ROUTE_HISTORY_DATA = {
  'emp-3': {
    employeeId: 'emp-3',
    name: 'Amit Verma',
    role: 'Delivery Lead',
    vehicle: 'Mahindra Bolero Maxi Truck (DL-1L-AA-5544)',
    date: '2026-10-17',
    totalDistanceKm: 34.6,
    avgSpeedKmh: 32.4,
    maxSpeedKmh: 58.0,
    idleDurationMin: 52,
    stopsCount: 4,
    stops: [
      { id: 'stop-1', name: 'Central Logistics Depot', time: '08:30 AM', lat: 28.6315, lng: 77.2167, duration: '20 min', type: 'depot', notes: 'Vehicle loading & morning inspection' },
      { id: 'stop-2', name: 'Connaught Place Retail Hub', time: '09:12 AM', lat: 28.6335, lng: 77.2195, duration: '25 min', type: 'delivery', notes: 'Delivered industrial parts package #D-891' },
      { id: 'stop-3', name: 'Indian Oil Station #402', time: '10:05 AM', lat: 28.6329, lng: 77.2195, duration: '12 min', type: 'fuel', notes: 'Refueled 17.85 L (Claim #EXP-4011)' },
      { id: 'stop-4', name: 'DND Flyway Expressway Plaza', time: '10:45 AM', lat: 28.5815, lng: 77.2934, duration: '15 min', type: 'transit', notes: 'FASTag toll passage & cargo handover' },
    ],
    // 24 sequential GPS breadcrumb waypoints along the route
    points: [
      { lat: 28.6315, lng: 77.2167, speed: 0, time: '08:30 AM', street: 'Depot Yard Gate 1', stopId: 'stop-1' },
      { lat: 28.6318, lng: 77.2172, speed: 18, time: '08:33 AM', street: 'Kasturba Gandhi Marg' },
      { lat: 28.6322, lng: 77.2178, speed: 28, time: '08:36 AM', street: 'Outer Circle Ring' },
      { lat: 28.6328, lng: 77.2185, speed: 36, time: '08:40 AM', street: 'Radial Road 4' },
      { lat: 28.6332, lng: 77.2190, speed: 42, time: '08:45 AM', street: 'Barakhamba Radial' },
      { lat: 28.6335, lng: 77.2195, speed: 0, time: '09:12 AM', street: 'Block M Customer Delivery Point', stopId: 'stop-2' },
      { lat: 28.6335, lng: 77.2195, speed: 0, time: '09:30 AM', street: 'Unloading Freight' },
      { lat: 28.6333, lng: 77.2194, speed: 22, time: '09:40 AM', street: 'Janpath Crossing' },
      { lat: 28.6330, lng: 77.2195, speed: 31, time: '09:50 AM', street: 'Tolstoy Marg Junction' },
      { lat: 28.6329, lng: 77.2195, speed: 0, time: '10:05 AM', street: 'Indian Oil Fuel Pump 04', stopId: 'stop-3' },
      { lat: 28.6325, lng: 77.2210, speed: 38, time: '10:18 AM', street: 'Barakhamba Road Flyover' },
      { lat: 28.6310, lng: 77.2250, speed: 48, time: '10:24 AM', street: 'Mandi House Circle' },
      { lat: 28.6270, lng: 77.2320, speed: 52, time: '10:29 AM', street: 'Tilak Marg Boulevard' },
      { lat: 28.6210, lng: 77.2410, speed: 55, time: '10:33 AM', street: 'Mathura Road Express' },
      { lat: 28.6140, lng: 77.2510, speed: 58, time: '10:37 AM', street: 'Pragati Maidan Corridor' },
      { lat: 28.6050, lng: 77.2650, speed: 54, time: '10:40 AM', street: 'Ring Road Bypass' },
      { lat: 28.5950, lng: 77.2790, speed: 50, time: '10:43 AM', street: 'Noida Link Road' },
      { lat: 28.5815, lng: 77.2934, speed: 0, time: '10:45 AM', street: 'DND Tollway Lane 4', stopId: 'stop-4' },
      { lat: 28.5815, lng: 77.2934, speed: 0, time: '11:00 AM', street: 'Cargo Verification' }
    ]
  },
  'emp-1': {
    employeeId: 'emp-1',
    name: 'Rahul Sharma',
    role: 'HVAC Technician',
    vehicle: 'Service Van #1 (DL-10-CV-8821)',
    date: '2026-10-17',
    totalDistanceKm: 18.2,
    avgSpeedKmh: 24.6,
    maxSpeedKmh: 45.0,
    idleDurationMin: 68,
    stopsCount: 3,
    stops: [
      { id: 'stop-1', name: 'Delhi Corporate HQ', time: '09:00 AM', lat: 28.6315, lng: 77.2167, duration: '15 min', type: 'depot', notes: 'Tool kit & parts check-out' },
      { id: 'stop-2', name: 'Palika Bazaar Chiller Plant', time: '09:25 AM', lat: 28.6318, lng: 77.2170, duration: '45 min', type: 'service', notes: 'Compressor maintenance #T-402' },
      { id: 'stop-3', name: 'Barakhamba Central Substation', time: '10:30 AM', lat: 28.6322, lng: 77.2178, duration: '35 min', type: 'service', notes: 'Refrigerant pressure calibration' },
    ],
    points: [
      { lat: 28.6315, lng: 77.2167, speed: 0, time: '09:00 AM', street: 'Delhi Corporate HQ Depot', stopId: 'stop-1' },
      { lat: 28.6316, lng: 77.2168, speed: 15, time: '09:08 AM', street: 'Inner Circle' },
      { lat: 28.6318, lng: 77.2170, speed: 0, time: '09:25 AM', street: 'Palika Underground Vault', stopId: 'stop-2' },
      { lat: 28.6320, lng: 77.2174, speed: 24, time: '10:15 AM', street: 'Radial Road 3' },
      { lat: 28.6322, lng: 77.2178, speed: 0, time: '10:30 AM', street: 'Barakhamba Substation #2', stopId: 'stop-3' },
    ]
  }
};
