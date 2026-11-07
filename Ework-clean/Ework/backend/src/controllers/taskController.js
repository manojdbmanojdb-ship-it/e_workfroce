import db from '../config/database.js';
import supabase from '../config/supabase.js';

// GET /api/tasks
export async function getTasks(req, res) {
  try {
    const { assignedTo, status, priority } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (assignedTo) {
      query += ' AND (assigned_to_id = ? OR assigned_to = ? OR LOWER(assigned_to) = ?)';
      params.push(assignedTo, assignedTo, assignedTo.toLowerCase());
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params);

    const formatted = tasks.map(t => ({
      ...t,
      proof_photo_urls: t.proof_photo_urls ? JSON.parse(t.proof_photo_urls) : [],
      notes: t.notes ? JSON.parse(t.notes) : []
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/tasks
export async function createTask(req, res) {
  try {
    const { title, description, assignedTo, assignedBy, destinationLat, destinationLng, address, dueDate, priority } = req.body;
    if (!title || !assignedTo) return res.status(400).json({ error: 'title and assignedTo are required' });

    // Look up assigned employee if user_id or name provided
    const employee = db.prepare('SELECT user_id, name FROM users WHERE user_id = ? OR name = ? OR LOWER(email) = ?')
      .get(assignedTo, assignedTo, assignedTo.toLowerCase());

    const assignedToName = employee ? employee.name : assignedTo;
    const assignedToId = employee ? employee.user_id : `usr-${Date.now().toString().slice(-4)}`;

    const taskId = `task-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, assigned_to, assigned_to_id, assigned_by,
        destination_lat, destination_lng, address, due_date, priority,
        status, proof_photo_urls, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'assigned', '[]', '[]', ?, ?)
    `).run(
      taskId,
      title,
      description || '',
      assignedToName,
      assignedToId,
      assignedBy || 'Rajesh Kumar (Operations Manager)',
      destinationLat || 28.6315,
      destinationLng || 77.2167,
      address || 'Connaught Place, New Delhi',
      dueDate || new Date(Date.now() + 86400000).toISOString(),
      priority || 'medium',
      now,
      now
    );

    const taskRecord = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    const parsed = {
      ...taskRecord,
      proof_photo_urls: JSON.parse(taskRecord.proof_photo_urls),
      notes: JSON.parse(taskRecord.notes)
    };

    // Create notification for employee
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, task_id, is_read, priority, created_at)
      VALUES (?, ?, 'task_assigned', 'New Task Assigned', ?, ?, 0, ?, ?)
    `).run(
      `notif-${Date.now()}`,
      assignedToId,
      `You have been assigned to: ${title}`,
      taskId,
      priority || 'medium',
      now
    );

    // Optional Supabase background sync
    try {
      supabase.from('tasks').insert([{
        id: taskId,
        title,
        description,
        assigned_to: assignedToId,
        priority: priority || 'medium',
        status: 'pending'
      }]).then(() => {}).catch(() => {});
    } catch (_) {}

    const io = req.app.get('io');
    if (io) {
      io.emit('task_created', parsed);
    }

    res.status(201).json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/tasks/:id/status
export async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, completionNotes } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks 
      SET status = ?,
          completion_notes = COALESCE(?, completion_notes),
          completed_at = CASE WHEN ? = 'completed' THEN ? ELSE completed_at END,
          updated_at = ?
      WHERE id = ?
    `).run(status, completionNotes || null, status, now, now, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });

    const parsed = {
      ...updatedTask,
      proof_photo_urls: updatedTask.proof_photo_urls ? JSON.parse(updatedTask.proof_photo_urls) : [],
      notes: updatedTask.notes ? JSON.parse(updatedTask.notes) : []
    };

    const io = req.app.get('io');
    if (io) io.emit('task_updated', parsed);

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/tasks/:id/proof
export async function submitProofOfWork(req, res) {
  try {
    const { id } = req.params;
    const { proofPhotoUrls, signatureUrl, customerName, customerRating, customerFeedback, completionNotes } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks 
      SET proof_photo_urls = ?,
          signature_url = ?,
          customer_name = ?,
          customer_rating = ?,
          customer_feedback = ?,
          completion_notes = ?,
          status = 'completed',
          completed_at = ?,
          is_verified = 1,
          updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(proofPhotoUrls || []),
      signatureUrl || null,
      customerName || null,
      customerRating || 5,
      customerFeedback || null,
      completionNotes || 'Proof of work submitted.',
      now,
      now,
      id
    );

    const completedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    const parsed = {
      ...completedTask,
      proof_photo_urls: JSON.parse(completedTask.proof_photo_urls),
      notes: completedTask.notes ? JSON.parse(completedTask.notes) : []
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('task_proof_submitted', parsed);
      io.emit('task_updated', parsed);
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    try {
      supabase.from('tasks').delete().eq('id', id).then(() => {}).catch(() => {});
    } catch (_) {}

    const io = req.app.get('io');
    if (io) io.emit('task_deleted', { id });

    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
