import supabase from '../config/supabase.js';

const inMemoryExpenses = [
  {
    id: 'exp-101',
    user_id: '00000000-0000-0000-0000-000000000000',
    category: 'fuel',
    amount: 850,
    currency: 'INR',
    description: 'Fuel for field inspection van #1',
    receipt_url: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'exp-102',
    user_id: '00000000-0000-0000-0000-000000000000',
    category: 'food',
    amount: 320,
    currency: 'INR',
    description: 'Client lunch meeting at Connaught Place',
    receipt_url: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function submitExpense(req, res) {
  try {
    const { userId, taskId, category, amount, currency, receiptUrl, description } = req.body;
    if (!category || !amount) return res.status(400).json({ error: 'category and amount are required' });

    let record = null;

    try {
      const { data, error } = await supabase.from('expenses').insert([{
        category,
        amount: Number(amount),
        currency: currency || 'INR',
        receipt_url: receiptUrl,
        description,
        status: 'pending'
      }]).select();

      if (!error && data && data.length > 0) {
        record = data[0];
      }
    } catch (_) {}

    if (!record) {
      record = {
        id: `exp-${Date.now()}`,
        user_id: userId || '00000000-0000-0000-0000-000000000000',
        task_id: taskId || null,
        category,
        amount: Number(amount),
        currency: currency || 'INR',
        receipt_url: receiptUrl || null,
        description: description || `Field expense (${category})`,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      inMemoryExpenses.unshift(record);
    }

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reviewExpense(req, res) {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    let updated = null;

    try {
      const { data, error } = await supabase.from('expenses').update({
        status, approved_by: approvedBy
      }).eq('id', id).select();

      if (!error && data && data.length > 0) {
        updated = data[0];
      }
    } catch (_) {}

    if (!updated) {
      const memExp = inMemoryExpenses.find(e => e.id === id);
      if (memExp) {
        memExp.status = status;
        memExp.approved_by = approvedBy || 'Manager';
        updated = memExp;
      } else {
        updated = { id, status, approved_by: approvedBy };
      }
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getExpenses(req, res) {
  try {
    const { userId, status } = req.query;
    let list = [];

    try {
      let query = supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (!error && data) list = data;
    } catch (_) {}

    const memList = status
      ? inMemoryExpenses.filter(e => e.status === status)
      : inMemoryExpenses;

    // Merge without duplicates
    const combined = [...memList];
    for (const item of list) {
      if (!combined.some(c => c.id === item.id)) {
        combined.push(item);
      }
    }

    res.json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
