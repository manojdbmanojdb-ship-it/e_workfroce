import supabase from '../config/supabase.js';

const inMemoryAssets = [
  {
    id: '843eb1f3-eb2a-4fce-8a54-268fb4efcf35',
    name: 'Toyota HiAce Field Van #1',
    asset_code: 'VEH-001',
    category: 'vehicle',
    status: 'assigned',
    assigned_to: 'Rahul Sharma',
    condition_notes: 'Odometer: 24,500 km. Good condition.',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '853d2e9f-6a26-4578-aedd-933d0926dc54',
    name: 'Digital Multimeter Pro Kit',
    asset_code: 'TOOL-003',
    category: 'tool_kit',
    status: 'assigned',
    assigned_to: 'Priya Patel',
    condition_notes: 'Calibrated on 01-Oct-2026.',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '8af3df21-1d79-4ab6-bd0b-0c9fa0ed9c54',
    name: 'Industrial Hydraulic Pressure Gauge',
    asset_code: 'MACH-002',
    category: 'machinery',
    status: 'under_maintenance',
    assigned_to: null,
    condition_notes: 'Scheduled for maintenance.',
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '8bf4ef52-2e80-4bc7-ce1c-1d0ab1fe0d65',
    name: 'Thermal Imaging Camera FLIR E8',
    asset_code: 'ELEC-007',
    category: 'electronic',
    status: 'available',
    assigned_to: null,
    condition_notes: 'Fully charged and operational.',
    created_at: new Date(Date.now() - 345600000).toISOString()
  }
];

export async function getAssets(req, res) {
  try {
    const { status, assignedTo } = req.query;
    let list = [];

    try {
      let query = supabase.from('assets').select('*').order('name');
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data;
      }
    } catch (_) {}

    const combined = [...inMemoryAssets];
    for (const item of list) {
      if (!combined.some(c => c.id === item.id || c.asset_code === item.asset_code)) {
        combined.push(item);
      }
    }

    const filtered = combined.filter(a => {
      if (status && a.status !== status) return false;
      if (assignedTo && a.assigned_to !== assignedTo) return false;
      return true;
    });

    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAssetByCode(req, res) {
  try {
    const { code } = req.params;
    let asset = inMemoryAssets.find(a => a.asset_code?.toLowerCase() === code.toLowerCase());

    if (!asset) {
      try {
        const { data } = await supabase.from('assets').select('*').eq('asset_code', code).single();
        if (data) asset = data;
      } catch (_) {}
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset code ${code} not found` });
    }

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function assignAsset(req, res) {
  try {
    const { id } = req.params;
    const { assignedTo, status } = req.body;

    let updated = null;

    try {
      const { data, error } = await supabase.from('assets').update({
        status: status || (assignedTo ? 'assigned' : 'available')
      }).eq('id', id).select();

      if (!error && data && data.length > 0) {
        updated = data[0];
      }
    } catch (_) {}

    const mem = inMemoryAssets.find(a => a.id === id || a.asset_code === id);
    if (mem) {
      mem.assigned_to = assignedTo !== undefined ? assignedTo : mem.assigned_to;
      mem.status = status || (assignedTo ? 'assigned' : 'available');
      updated = mem;
    }

    if (!updated) {
      updated = { id, assigned_to: assignedTo, status: status || 'assigned' };
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAsset(req, res) {
  try {
    const { name, assetCode, category, conditionNotes } = req.body;
    if (!name || !assetCode) return res.status(400).json({ error: 'name and assetCode required' });

    let record = null;

    try {
      const { data, error } = await supabase.from('assets').insert([{
        name, asset_code: assetCode, category, condition_notes: conditionNotes
      }]).select();

      if (!error && data && data.length > 0) {
        record = data[0];
      }
    } catch (_) {}

    if (!record) {
      record = {
        id: `ast-${Date.now()}`,
        name,
        asset_code: assetCode,
        category: category || 'tool_kit',
        status: 'available',
        assigned_to: null,
        condition_notes: conditionNotes || 'Registered asset',
        created_at: new Date().toISOString()
      };
      inMemoryAssets.unshift(record);
    }

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
