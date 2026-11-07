/**
 * Algorithmic Route Optimization & Fuel / Mileage Calculator Service
 * Uses Great-Circle Haversine + 1.28x City Tortuosity Factor + Nearest-Neighbor TSP Heuristic
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  // Apply urban road factor (city roads are typically 25-30% longer than straight line)
  return +(directDistance * 1.28).toFixed(2);
}

/**
 * Optimizes a list of waypoints using Nearest-Neighbor heuristic starting from startPoint
 * @param {Object} startPoint - { latitude, longitude, label }
 * @param {Array} waypoints - Array of { id, title, latitude, longitude, address, priority, ... }
 * @param {Object} options - { costPerKm, fuelPricePerLiter, mileageKmpl, avgSpeedKmph }
 */
export function optimizeRoute(startPoint, waypoints, options = {}) {
  const {
    costPerKm = 12.0, // Standard company reimbursement rate (₹/km)
    fuelPricePerLiter = 96.5, // Current fuel price
    mileageKmpl = 14.0, // Average vehicle mileage (km/liter)
    avgSpeedKmph = 30.0, // Average city traffic transit speed
  } = options;

  if (!waypoints || waypoints.length === 0) {
    return {
      orderedStops: [],
      totalDistanceKm: 0,
      estimatedDriveMinutes: 0,
      estimatedLiters: 0,
      estimatedFuelCost: 0,
      reimbursementAmount: 0,
      savingsKm: 0,
      googleMapsUrl: '',
    };
  }

  // Calculate unoptimized sequence distance first to demonstrate optimization savings
  let unoptimizedDistance = 0;
  let curr = startPoint;
  for (const wp of waypoints) {
    unoptimizedDistance += calculateDistanceKm(curr.latitude, curr.longitude, wp.latitude, wp.longitude);
    curr = wp;
  }

  // Nearest-Neighbor algorithm
  const remaining = [...waypoints];
  const orderedStops = [];
  let currentLocation = { ...startPoint };
  let totalDistanceKm = 0;

  while (remaining.length > 0) {
    let nearestIndex = -1;
    let shortestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const dist = calculateDistanceKm(
        currentLocation.latitude,
        currentLocation.longitude,
        candidate.latitude,
        candidate.longitude
      );
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const nextStop = remaining.splice(nearestIndex, 1)[0];
    const legDistanceKm = shortestDist;
    totalDistanceKm += legDistanceKm;
    const legDriveMinutes = Math.round((legDistanceKm / avgSpeedKmph) * 60);

    orderedStops.push({
      sequence: orderedStops.length + 1,
      ...nextStop,
      legDistanceKm,
      legDriveMinutes,
      cumulativeDistanceKm: +totalDistanceKm.toFixed(2),
    });

    currentLocation = nextStop;
  }

  totalDistanceKm = +totalDistanceKm.toFixed(2);
  const estimatedDriveMinutes = Math.round((totalDistanceKm / avgSpeedKmph) * 60);
  const estimatedLiters = +(totalDistanceKm / mileageKmpl).toFixed(2);
  const estimatedFuelCost = +(estimatedLiters * fuelPricePerLiter).toFixed(2);
  const reimbursementAmount = +(totalDistanceKm * costPerKm).toFixed(2);
  const savingsKm = +(Math.max(0, unoptimizedDistance - totalDistanceKm)).toFixed(2);

  // Generate Google Maps Directions Universal Intent URL
  let googleMapsUrl = '';
  if (orderedStops.length > 0) {
    const origin = `${startPoint.latitude},${startPoint.longitude}`;
    const destination = `${orderedStops[orderedStops.length - 1].latitude},${orderedStops[orderedStops.length - 1].longitude}`;
    const waypointsParam = orderedStops.slice(0, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointsParam ? `&waypoints=${encodeURIComponent(waypointsParam)}` : ''}&travelmode=driving`;
  }

  return {
    startPoint,
    orderedStops,
    totalStops: orderedStops.length,
    totalDistanceKm,
    estimatedDriveMinutes,
    estimatedLiters,
    estimatedFuelCost,
    reimbursementAmount,
    savingsKm,
    costPerKm,
    googleMapsUrl,
  };
}
