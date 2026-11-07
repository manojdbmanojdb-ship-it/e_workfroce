import supabase from '../config/supabase.js';
import { sendEmergencySosAlert } from '../services/notificationService.js';

const inMemoryAlerts = [];

// POST /api/sos/trigger
export async function triggerSOS(req, res) {
  try {
    const { userId, lat, lng, message } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    let alertRecord = null;

    try {
      const { data, error } = await supabase.from('sos_alerts').insert([{
        latitude: lat, longitude: lng,
        message: message || 'EMERGENCY: SOS triggered', status: 'active'
      }]).select();

      if (!error && data && data.length > 0) {
        alertRecord = data[0];
      }
    } catch (_) {}

    if (!alertRecord) {
      alertRecord = {
        id: `sos-${Date.now()}`,
        user_id: userId || '00000000-0000-0000-0000-000000000000',
        latitude: lat,
        longitude: lng,
        message: message || 'EMERGENCY: SOS triggered from Field Mobile App',
        status: 'active',
        triggered_at: new Date().toISOString()
      };
      inMemoryAlerts.unshift(alertRecord);
    }

    // Broadcast via Socket.io to all connected web dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_alert', { ...alertRecord, userId: userId || '00000000-0000-0000-0000-000000000000', lat, lng });
    }

    // Automated Emergency Dispatch Engine: Send urgent email alert
    await sendEmergencySosAlert({
      id: alertRecord.id,
      userId: userId || '00000000-0000-0000-0000-000000000000',
      latitude: lat,
      longitude: lng,
      message: alertRecord.message,
      triggeredAt: alertRecord.triggered_at,
    });

    res.json({ success: true, message: 'SOS dispatched to all manager consoles & emergency emails!', data: alertRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/sos/:id/resolve
export async function resolveSOS(req, res) {
  try {
    const { id } = req.params;
    const { resolvedBy } = req.body;

    let updated = null;
    try {
      const { data, error } = await supabase.from('sos_alerts').update({
        status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date().toISOString()
      }).eq('id', id).select();

      if (!error && data && data.length > 0) {
        updated = data[0];
      }
    } catch (_) {}

    if (!updated) {
      const memAlert = inMemoryAlerts.find(a => a.id === id);
      if (memAlert) {
        memAlert.status = 'resolved';
        memAlert.resolved_at = new Date().toISOString();
        updated = memAlert;
      } else {
        updated = { id, status: 'resolved', resolved_at: new Date().toISOString() };
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('sos_resolved', { id });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/sos?status=active
export async function getSOSAlerts(req, res) {
  try {
    const { status } = req.query;
    let list = [];

    try {
      let query = supabase.from('sos_alerts').select('*').order('triggered_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (!error && data) list = data;
    } catch (_) {}

    const memList = status ? inMemoryAlerts.filter(a => a.status === status) : inMemoryAlerts;
    const combined = [...memList, ...list];
    res.json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
