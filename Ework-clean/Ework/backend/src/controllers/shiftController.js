import db from '../config/database.js';

export async function getShifts(req, res) {
  try {
    const { userId, date } = req.query;
    let query = 'SELECT * FROM shifts WHERE 1=1';
    const params = [];
    if (userId) {
      query += ' AND (employee = ? OR role = ?)';
      params.push(userId, userId);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    query += ' ORDER BY date ASC, start ASC';
    const rows = db.prepare(query).all(...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createShift(req, res) {
  try {
    const { employee, role, site, date, day, start, end, status, notes } = req.body;
    if (!employee || !site || !date) {
      return res.status(400).json({ error: 'employee, site, date required' });
    }
    const id = req.body.id ? String(req.body.id) : `shift-${Date.now()}`;
    const newShift = {
      id,
      employee,
      role: role || 'Technician',
      site,
      date,
      day: day || 'Mon',
      start: start || '09:00',
      end: end || '18:00',
      status: status || 'scheduled',
      notes: notes || '',
      created_at: new Date().toISOString()
    };
    db.prepare(`
      INSERT OR REPLACE INTO shifts (id, employee, role, site, date, day, start, end, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newShift.id, newShift.employee, newShift.role, newShift.site, newShift.date, newShift.day, newShift.start, newShift.end, newShift.status, newShift.notes, newShift.created_at);

    const io = req.app.get('io');
    if (io) io.emit('shift_created', newShift);

    res.status(201).json({ success: true, data: newShift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteShift(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Shift ID is required' });

    db.prepare('DELETE FROM shifts WHERE id = ?').run(String(id));

    const io = req.app.get('io');
    if (io) io.emit('shift_deleted', { id: String(id) });

    res.json({ success: true, message: `Shift ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
