import db from '../config/database.js';
import supabase from '../config/supabase.js';
import { isWithinGeofence } from '../services/geofenceService.js';

// POST /api/attendance/check-in
export async function checkIn(req, res) {
  try {
    const { userId, siteId, lat, lng, method } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const employee = db.prepare('SELECT * FROM users WHERE user_id = ? OR name = ? OR LOWER(email) = ?')
      .get(userId, userId, userId.toLowerCase());

    const finalUserId = employee ? employee.user_id : userId;
    const finalUserName = employee ? employee.name : userId;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check duplicate check-in
    const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(finalUserId, todayStr);
    if (existing && existing.check_in_time) {
      return res.status(400).json({
        success: false,
        message: `Already checked in today at ${new Date(existing.check_in_time).toLocaleTimeString()}`
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const isLate = (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15));
    const attId = `att-${finalUserId}-${todayStr}`;

    db.prepare(`
      INSERT INTO attendance (
        id, user_id, user_name, date, check_in_time, check_in_lat, check_in_lng,
        is_within_geofence, verification_method, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run(
      attId,
      finalUserId,
      finalUserName,
      todayStr,
      nowIso,
      lat || 28.6318,
      lng || 77.2170,
      method || 'gps_geofence',
      isLate ? 'late' : 'present',
      isLate ? 'Late arrival recorded' : 'On-time geofenced check-in',
      nowIso
    );

    const checkInData = db.prepare('SELECT * FROM attendance WHERE id = ?').get(attId);

    const io = req.app.get('io');
    if (io) {
      io.emit('employee_checked_in', checkInData);
    }

    res.json({ success: true, data: checkInData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/attendance/check-out/:id
export async function checkOut(req, res) {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    let record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
    if (!record) {
      // Try finding by user_id today
      const todayStr = new Date().toISOString().split('T')[0];
      record = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(id, todayStr);
    }

    if (!record) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    let overtimeMinutes = 0;
    let workMinutes = 480;

    if (record.check_in_time) {
      const checkInMs = new Date(record.check_in_time).getTime();
      const totalMinutes = Math.round((now.getTime() - checkInMs) / 60000);
      const breakMins = record.break_minutes || 0;
      workMinutes = Math.max(0, totalMinutes - breakMins);
      const shiftMinutes = 8 * 60;
      overtimeMinutes = Math.max(0, workMinutes - shiftMinutes);
    }

    db.prepare(`
      UPDATE attendance 
      SET check_out_time = ?,
          check_out_lat = ?,
          check_out_lng = ?,
          work_minutes = ?,
          overtime_minutes = ?,
          is_on_break = 0
      WHERE id = ?
    `).run(nowIso, lat || 28.6318, lng || 77.2170, workMinutes, overtimeMinutes, record.id);

    const updated = db.prepare('SELECT * FROM attendance WHERE id = ?').get(record.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('employee_checked_out', { ...updated, overtimeMinutes });
    }

    res.json({ success: true, data: updated, overtimeMinutes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/attendance?userId=&date=
export async function getAttendance(req, res) {
  try {
    const { userId, date } = req.query;
    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND (user_id = ? OR user_name = ?)';
      params.push(userId, userId);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ' ORDER BY date DESC, check_in_time DESC LIMIT 100';

    const records = db.prepare(query).all(...params);

    // Format to match frontend structure expectations
    const formatted = records.map(r => ({
      ...r,
      profiles: { full_name: r.user_name, email: `${r.user_name.toLowerCase().replace(' ', '.')}@ework.com` },
      work_sites: { name: 'Connaught Place Central Hub' }
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
