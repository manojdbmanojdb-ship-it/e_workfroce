export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinGeofence(empLat, empLng, siteLat, siteLng, radiusMeters = 150) {
  const dist = getDistanceMeters(empLat, empLng, siteLat, siteLng);
  return { withinFence: dist <= radiusMeters, distanceMeters: Math.round(dist) };
}

/**
 * Point-in-Polygon (PIP) ray casting algorithm
 * Checks whether [empLat, empLng] lies inside a polygon defined by an array of [lat, lng] coordinates.
 */
export function isPointInPolygon(empLat, empLng, polygonVertices) {
  if (!polygonVertices || polygonVertices.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygonVertices.length - 1; i < polygonVertices.length; j = i++) {
    const p1 = polygonVertices[i];
    const p2 = polygonVertices[j];
    
    const lat1 = Array.isArray(p1) ? p1[0] : p1.lat;
    const lng1 = Array.isArray(p1) ? p1[1] : p1.lng;
    const lat2 = Array.isArray(p2) ? p2[0] : p2.lat;
    const lng2 = Array.isArray(p2) ? p2[1] : p2.lng;

    const intersect = ((lng1 > empLng) !== (lng2 > empLng)) &&
      (empLat < ((lat2 - lat1) * (empLng - lng1)) / (lng2 - lng1) + lat1);
    
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Geodesic polygonal area calculation using spherical excess / trapezoidal integration
 * Returns area in square meters.
 */
export function calculatePolygonAreaMeters(polygonVertices) {
  if (!polygonVertices || polygonVertices.length < 3) return 0;
  const R = 6378137; // WGS84 Earth equatorial radius in meters
  let area = 0;

  for (let i = 0; i < polygonVertices.length; i++) {
    const j = (i + 1) % polygonVertices.length;
    const p1 = polygonVertices[i];
    const p2 = polygonVertices[j];

    const lat1 = ((Array.isArray(p1) ? p1[0] : p1.lat) * Math.PI) / 180;
    const lat2 = ((Array.isArray(p2) ? p2[0] : p2.lat) * Math.PI) / 180;
    const lng1 = ((Array.isArray(p1) ? p1[1] : p1.lng) * Math.PI) / 180;
    const lng2 = ((Array.isArray(p2) ? p2[1] : p2.lng) * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2);
  return Math.round(area);
}
