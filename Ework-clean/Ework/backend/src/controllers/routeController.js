import supabase from '../config/supabase.js';
import { optimizeRoute } from '../services/routeOptimizerService.js';

// Default HQ / Depot (Delhi Connaught Place)
const DEFAULT_DEPOT = {
  label: 'Central Depot / HQ',
  latitude: 28.6315,
  longitude: 77.2167,
  address: 'Connaught Place, New Delhi',
};

// Sample task stops with realistic geocodes if database tasks lack precise coordinates
const SAMPLE_STOPS = [
  { id: 'task-1', title: 'HVAC Maintenance - Tower A', address: 'Nehru Place, New Delhi', latitude: 28.5494, longitude: 77.2536, priority: 'high', assignee: 'Rahul Sharma' },
  { id: 'task-2', title: 'Solar Inverter Inspection', address: 'Okhla Phase 3, New Delhi', latitude: 28.5355, longitude: 77.2728, priority: 'urgent', assignee: 'Rahul Sharma' },
  { id: 'task-3', title: 'Server Room AC Repair', address: 'Saket District Centre, New Delhi', latitude: 28.5244, longitude: 77.2188, priority: 'medium', assignee: 'Rahul Sharma' },
  { id: 'task-4', title: 'Electrical Panel Audit', address: 'Lajpat Nagar 4, New Delhi', latitude: 28.5677, longitude: 77.2433, priority: 'medium', assignee: 'Rahul Sharma' },
  { id: 'task-5', title: 'Emergency Water Pump Service', address: 'Greater Kailash 1, New Delhi', latitude: 28.5521, longitude: 77.2384, priority: 'urgent', assignee: 'Rahul Sharma' },
];

/**
 * POST /api/routes/optimize
 * Body: { startPoint, waypoints, options }
 */
export async function optimizeCustomRoute(req, res) {
  try {
    const { startPoint = DEFAULT_DEPOT, waypoints = SAMPLE_STOPS, options = {} } = req.body;
    const result = optimizeRoute(startPoint, waypoints, options);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/routes/daily-preview
 * Query: ?userId=&date=
 */
export async function getDailyRoutePreview(req, res) {
  try {
    const { userId } = req.query;

    let waypoints = [];
    if (userId) {
      const { data: dbTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .neq('status', 'completed');
      
      if (dbTasks && dbTasks.length > 0) {
        waypoints = dbTasks.map(t => ({
          id: t.id,
          title: t.title,
          address: t.address || 'Field Location',
          latitude: t.destination_lat || 28.5494,
          longitude: t.destination_lng || 77.2536,
          priority: t.priority,
          assignee: 'Rahul Sharma',
        }));
      }
    }

    if (waypoints.length === 0) {
      waypoints = SAMPLE_STOPS;
    }

    const optimization = optimizeRoute(DEFAULT_DEPOT, waypoints, {
      costPerKm: 12.0,
      fuelPricePerLiter: 96.5,
      mileageKmpl: 14.0,
    });

    res.json({
      success: true,
      depot: DEFAULT_DEPOT,
      data: optimization,
    });
  } catch (err) {
    const fallbackOptimization = optimizeRoute(DEFAULT_DEPOT, SAMPLE_STOPS);
    res.json({ success: true, depot: DEFAULT_DEPOT, data: fallbackOptimization });
  }
}

/**
 * POST /api/routes/dispatch
 * Body: { employeeName, technicianId, waypoints, totalDistanceKm, estimatedDriveMinutes, googleMapsUrl, notes }
 */
export async function dispatchRoute(req, res) {
  try {
    const {
      employeeName = 'Rahul Sharma',
      technicianId,
      waypoints = [],
      totalDistanceKm = 0,
      estimatedDriveMinutes = 0,
      googleMapsUrl = '',
      notes = ''
    } = req.body;

    const payload = {
      id: `disp-${Date.now()}`,
      employeeName,
      technicianId: technicianId || employeeName.toLowerCase().replace(/\s+/g, '-'),
      waypoints,
      totalStops: waypoints.length,
      totalDistanceKm,
      estimatedDriveMinutes,
      googleMapsUrl,
      notes,
      dispatchedAt: new Date().toISOString(),
      status: 'dispatched'
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('route_dispatched', payload);
      console.log(`[Socket.io] Route dispatched to ${employeeName}: ${waypoints.length} stops`);
    }

    res.json({
      success: true,
      message: `Optimal route with ${waypoints.length} stops successfully dispatched to ${employeeName}!`,
      data: payload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
