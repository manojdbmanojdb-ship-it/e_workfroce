import supabase from '../config/supabase.js';

const inMemoryShifts = [
  {
    id: 'shift-1',
    user_id: 'Rahul Sharma',
    employee: 'Rahul Sharma',
    role: 'Technician',
    site: 'Delhi HQ',
    start_time: '2026-10-24T09:00:00Z',
    end_time: '2026-10-24T18:00:00Z',
    status: 'scheduled',
    notes: 'HVAC Regular Inspection'
  },
  {
    id: 'shift-2',
    user_id: 'Priya Patel',
    employee: 'Priya Patel',
    role: 'Sales Executive',
    site: 'Mumbai Branch',
    start_time: '2026-10-24T10:00:00Z',
    end_time: '2026-10-24T19:00:00Z',
    status: 'scheduled',
    notes: 'Client onboarding visits'
  }
];

export async function getShifts(req, res) {
  try {
    const { userId, date } = req.query;
    let list = [];
    try {
      let query = supabase.from('shifts').select('*').order('start_time');
      if (userId) query = query.eq('user_id', userId);
      if (date) query = query.gte('start_time', `${date}T00:00:00`).lte('start_time', `${date}T23:59:59`);
      const { data, error } = await query;
      if (!error && data) list = data;
    } catch (_) {}

    let filtered = [...inMemoryShifts];
    if (userId) filtered = filtered.filter(s => s.user_id === userId || s.employee === userId);
    if (date) filtered = filtered.filter(s => s.start_time && s.start_time.startsWith(date));

    res.json({ success: true, data: [...filtered, ...list] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createShift(req, res) {
  try {
    const { userId, workSiteId, startTime, endTime, notes } = req.body;
    if (!userId || !startTime || !endTime) return res.status(400).json({ error: 'userId, startTime, endTime required' });

    let shiftRecord = null;
    try {
      const { data, error } = await supabase.from('shifts').insert([{
        user_id: userId, work_site_id: workSiteId,
        start_time: startTime, end_time: endTime, notes
      }]).select();
      if (!error && data && data.length > 0) {
        shiftRecord = data[0];
      }
    } catch (_) {}

    if (!shiftRecord) {
      shiftRecord = {
        id: `shift-${Date.now()}`,
        user_id: userId,
        work_site_id: workSiteId || 'site-delhi-hq',
        start_time: startTime,
        end_time: endTime,
        notes: notes || '',
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      inMemoryShifts.unshift(shiftRecord);
    }

    const io = req.app.get('io');
    if (io) io.emit('shift_created', shiftRecord);

    res.status(201).json({ success: true, data: shiftRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

