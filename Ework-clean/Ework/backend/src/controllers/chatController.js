import supabase from '../config/supabase.js';

const inMemoryMessages = [];

export async function sendMessage(req, res) {
  try {
    const { taskId, senderId, recipientId, content, attachmentUrl } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    let record = null;

    try {
      const { data, error } = await supabase.from('chat_messages').insert([{
        content,
        attachment_url: attachmentUrl
      }]).select();

      if (!error && data && data.length > 0) {
        record = data[0];
      }
    } catch (_) {}

    if (!record) {
      record = {
        id: `msg-${Date.now()}`,
        task_id: taskId || null,
        sender_id: senderId || '00000000-0000-0000-0000-000000000000',
        recipient_id: recipientId || null,
        content,
        attachment_url: attachmentUrl || null,
        created_at: new Date().toISOString()
      };
      inMemoryMessages.push(record);
    }

    // Real-time broadcast to all web consoles & clients
    const io = req.app.get('io');
    if (io) {
      if (taskId) io.to(`task_${taskId}`).emit('new_message', record);
      io.emit('new_message', record);
    }

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMessages(req, res) {
  try {
    const { taskId, userId } = req.query;
    let list = [];

    try {
      let query = supabase.from('chat_messages').select('*').order('created_at');
      if (taskId) query = query.eq('task_id', taskId);
      else if (userId) query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
      const { data, error } = await query;
      if (!error && data) list = data;
    } catch (_) {}

    const memList = inMemoryMessages.filter(m => {
      if (taskId && m.task_id !== taskId) return false;
      return true;
    });

    const combined = [...list];
    for (const m of memList) {
      if (!combined.some(c => c.id === m.id)) {
        combined.push(m);
      }
    }

    res.json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
