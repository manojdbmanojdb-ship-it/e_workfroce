import { isPointInPolygon, calculatePolygonAreaMeters, isWithinGeofence } from '../services/geofenceService.js';

let CUSTOM_POLYGONS = [
  {
    id: 'poly-1',
    name: 'DLF CyberCity Special Economic Zone',
    city: 'Delhi NCR',
    type: 'polygon',
    category: 'Commercial Campus',
    emoji: '🏢',
    color: '#8b5cf6',
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
    name: 'Nehru Place Commercial Electronics Complex',
    city: 'New Delhi',
    type: 'polygon',
    category: 'Tech District',
    emoji: '🏬',
    color: '#ec4899',
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
    type: 'polygon',
    category: 'Restricted Hub',
    emoji: '🏛️',
    color: '#06b6d4',
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

export async function getGeofencePolygons(req, res) {
  try {
    const enriched = CUSTOM_POLYGONS.map(p => ({
      ...p,
      areaMeters: calculatePolygonAreaMeters(p.vertices),
      vertexCount: p.vertices.length
    }));
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createGeofencePolygon(req, res) {
  try {
    const { name, city, category, emoji, color, alertTrigger, vertices } = req.body;
    if (!vertices || !Array.isArray(vertices) || vertices.length < 3) {
      return res.status(400).json({ success: false, error: 'A minimum of 3 vertices is required for a polygon.' });
    }

    const areaMeters = calculatePolygonAreaMeters(vertices);
    const newPolygon = {
      id: `poly-${Date.now()}`,
      name: name || 'Custom Industrial Zone',
      city: city || 'Custom',
      type: 'polygon',
      category: category || 'Industrial Perimeter',
      emoji: emoji || '📐',
      color: color || '#38bdf8',
      alertTrigger: alertTrigger || 'both',
      vertices,
      areaMeters,
      createdAt: new Date().toISOString()
    };

    CUSTOM_POLYGONS.unshift(newPolygon);
    res.status(201).json({ success: true, message: 'Polygon geofence created successfully', data: newPolygon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function verifyPointInPolygon(req, res) {
  try {
    const { lat, lng, polygonId, vertices, polygon } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'lat and lng coordinates are required.' });
    }

    let targetVertices = vertices || polygon;
    let polygonName = 'Custom Boundary';

    if (polygonId) {
      const found = CUSTOM_POLYGONS.find(p => p.id === polygonId);
      if (found) {
        targetVertices = found.vertices;
        polygonName = found.name;
      }
    }

    if (!targetVertices || targetVertices.length < 3) {
      return res.status(400).json({ success: false, error: 'Invalid polygon vertices.' });
    }

    const isInside = isPointInPolygon(Number(lat), Number(lng), targetVertices);
    const areaMeters = calculatePolygonAreaMeters(targetVertices);

    res.json({
      success: true,
      polygonName,
      isInside,
      areaMeters,
      vertexCount: targetVertices.length,
      evaluatedPoint: { lat: Number(lat), lng: Number(lng) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
