/**
 * Geofence & Polygon Geometry Utilities for Ework Admin Dashboard
 */

/**
 * Ray-Casting algorithm to check if a [lat, lng] point is inside an array of [lat, lng] vertices.
 * @param {Array<number>|Object} point [lat, lng] or {lat, lng}
 * @param {Array<Array<number>>} polygon Array of [lat, lng]
 * @returns {boolean}
 */
export function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;

  const x = point.lng !== undefined ? point.lng : point[1];
  const y = point.lat !== undefined ? point.lat : point[0];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const p1 = polygon[i];
    const p2 = polygon[j];

    const xi = Array.isArray(p1) ? p1[1] : p1.lng;
    const yi = Array.isArray(p1) ? p1[0] : p1.lat;
    const xj = Array.isArray(p2) ? p2[1] : p2.lng;
    const yj = Array.isArray(p2) ? p2[0] : p2.lat;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate approximate polygonal area on Earth's spherical surface (in square meters).
 * @param {Array<Array<number>>} polygon Array of [lat, lng]
 * @returns {number}
 */
export function calculatePolygonArea(polygon) {
  if (!polygon || polygon.length < 3) return 0;
  const R = 6378137; // WGS84 Earth Radius in meters
  let area = 0;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const p1 = polygon[i];
    const p2 = polygon[j];

    const lat1 = ((Array.isArray(p1) ? p1[0] : p1.lat) * Math.PI) / 180;
    const lat2 = ((Array.isArray(p2) ? p2[0] : p2.lat) * Math.PI) / 180;
    const lng1 = ((Array.isArray(p1) ? p1[1] : p1.lng) * Math.PI) / 180;
    const lng2 = ((Array.isArray(p2) ? p2[1] : p2.lng) * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2);
  return Math.round(area);
}

/**
 * Format square meters into readable string (m² or hectares)
 * @param {number} sqm 
 * @returns {string}
 */
export function formatArea(sqm) {
  if (!sqm || isNaN(sqm)) return '0 m²';
  if (sqm >= 10000) {
    const ha = (sqm / 10000).toFixed(2);
    return `${sqm.toLocaleString()} m² (${ha} ha)`;
  }
  return `${sqm.toLocaleString()} m²`;
}

/**
 * Calculate centroid of a polygon for placing name / marker popup
 * @param {Array<Array<number>>} polygon Array of [lat, lng]
 * @returns {[number, number]} [lat, lng]
 */
export function getPolygonCentroid(polygon) {
  if (!polygon || polygon.length === 0) return [28.6315, 77.2167];
  let sumLat = 0;
  let sumLng = 0;
  for (const p of polygon) {
    sumLat += Array.isArray(p) ? p[0] : p.lat;
    sumLng += Array.isArray(p) ? p[1] : p.lng;
  }
  return [sumLat / polygon.length, sumLng / polygon.length];
}

/**
 * Initial Preset Multi-Site Polygon Geofences
 */
export const PRESET_POLYGONS = [
  {
    id: 'poly-1',
    name: 'DLF CyberCity SEZ & Tech Park',
    city: 'Delhi NCR',
    category: 'Commercial Campus',
    type: 'polygon',
    emoji: '🏢',
    color: '#8b5cf6', // Violet
    alertTrigger: 'both',
    vertices: [
      [28.4985, 77.0875],
      [28.5025, 77.0945],
      [28.4970, 77.0980],
      [28.4935, 77.0910]
    ]
  },
  {
    id: 'poly-2',
    name: 'Nehru Place Hardware & Electronics Complex',
    city: 'New Delhi',
    category: 'Commercial Tech Hub',
    type: 'polygon',
    emoji: '🏬',
    color: '#ec4899', // Pink
    alertTrigger: 'enter',
    vertices: [
      [28.5490, 77.2480],
      [28.5525, 77.2530],
      [28.5475, 77.2575],
      [28.5440, 77.2515]
    ]
  },
  {
    id: 'poly-3',
    name: 'Connaught Place Heritage Outer Circle',
    city: 'New Delhi',
    category: 'Restricted Field Zone',
    type: 'polygon',
    emoji: '🏛️',
    color: '#06b6d4', // Cyan
    alertTrigger: 'both',
    vertices: [
      [28.6345, 77.2140],
      [28.6355, 77.2195],
      [28.6310, 77.2220],
      [28.6275, 77.2175],
      [28.6295, 77.2120]
    ]
  }
];
