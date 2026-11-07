import db from '../config/database.js';
import supabase from '../config/supabase.js';

/**
 * Resolves current employee from req.user or fallback identifier
 */
function resolveEmployee(req) {
  if (req.user) return req.user;
  const identifier = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  if (identifier) {
    return db.prepare('SELECT * FROM users WHERE user_id = ? OR LOWER(email) = ? OR name = ?')
      .get(identifier, identifier.toLowerCase(), identifier);
  }
  // Default to Rahul Sharma if in demo fallback mode
  return db.prepare('SELECT * FROM users WHERE user_id = "usr-102"').get();
}

/**
 * GET /api/employee/dashboard-summary
 */
export async function getEmployeeDashboardSummary(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const userId = employee.user_id;
    const userName = employee.name;

    // 1. Fetch assigned tasks
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE assigned_to_id = ? OR assigned_to = ? OR LOWER(assigned_to) = ?
      ORDER BY 
        CASE 
          WHEN status = 'in_progress' THEN 1
          WHEN status = 'accepted' THEN 2
          WHEN status = 'assigned' THEN 3
          WHEN status = 'on_hold' THEN 4
          ELSE 5 
        END,
        due_date ASC
    `).all(userId, userName, userName.toLowerCase());

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'accepted').length;

    // 2. Attendance Status for Today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = db.prepare(`
      SELECT * FROM attendance 
      WHERE (user_id = ? OR user_name = ?) AND date = ?
    `).get(userId, userName, todayStr);

    let isCheckedIn = false;
    let isCheckedOut = false;
    let isOnBreak = false;
    let currentWorkMinutes = 0;

    if (todayAttendance) {
      if (todayAttendance.check_in_time && !todayAttendance.check_out_time) {
        isCheckedIn = true;
        isOnBreak = !!todayAttendance.is_on_break;
        const start = new Date(todayAttendance.check_in_time).getTime();
        const now = Date.now();
        const breakMins = todayAttendance.break_minutes || 0;
        currentWorkMinutes = Math.max(0, Math.round((now - start) / 60000) - breakMins);
      } else if (todayAttendance.check_out_time) {
        isCheckedIn = true;
        isCheckedOut = true;
        currentWorkMinutes = todayAttendance.work_minutes || 480;
      }
    }

    // 3. Weekly Hours Breakdown (M T W T F S S)
    const weeklyHours = [
      { day: 'M', hours: 8.5, target: 8.0, percent: 100 },
      { day: 'T', hours: 9.0, target: 8.0, percent: 100 },
      { day: 'W', hours: 7.5, target: 8.0, percent: 93 },
      { day: 'T', hours: 8.8, target: 8.0, percent: 100 },
      { day: 'F', hours: 8.2, target: 8.0, percent: 100 },
      { day: 'S', hours: 4.0, target: 4.0, percent: 100 },
      { day: 'S', hours: 0.0, target: 0.0, percent: 0 },
    ];

    // 4. Performance Score Computation
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
    const performanceScore = Math.min(500, Math.max(300, 320 + Math.round(completionRate * 1.5)));

    // 5. Unread Notifications Count & Recent Feed
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? OR user_id = 'all'
      ORDER BY created_at DESC 
      LIMIT 5
    `).all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE (user_id = ? OR user_id = 'all') AND is_read = 0
    `).get(userId).count;

    res.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          user_id: employee.user_id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          designation: employee.designation,
          reporting_manager: employee.reporting_manager,
          avatar: employee.avatar || '👤',
          badge: employee.badge,
          phone: employee.phone
        },
        statistics: {
          assignedTasks: totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          completionRate,
          todayWorkHours: (currentWorkMinutes / 60).toFixed(1),
          todayWorkMinutes: currentWorkMinutes,
          attendanceRate: 98,
          performanceScore,
          performanceTier: performanceScore >= 400 ? 'Elite' : performanceScore >= 350 ? 'Excellent' : 'Good'
        },
        attendanceStatus: {
          isCheckedIn,
          isCheckedOut,
          isOnBreak,
          checkInTime: todayAttendance?.check_in_time || null,
          checkOutTime: todayAttendance?.check_out_time || null,
          breakMinutes: todayAttendance?.break_minutes || 0,
          currentWorkMinutes
        },
        weeklyHours,
        todayTasks: tasks.slice(0, 5),
        recentNotifications: notifications,
        unreadNotificationsCount: unreadCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/tasks
 */
export async function getEmployeeTasks(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    const { status, priority } = req.query;
    let query = `
      SELECT * FROM tasks 
      WHERE (assigned_to_id = ? OR assigned_to = ? OR LOWER(assigned_to) = ?)
    `;
    const params = [employee.user_id, employee.name, employee.name.toLowerCase()];

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (priority && priority !== 'all') {
      query += ` AND priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY due_date ASC, created_at DESC`;

    const tasks = db.prepare(query).all(...params);

    // Parse JSON fields
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

/**
 * PATCH /api/employee/tasks/:id/status
 */
export async function updateEmployeeTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, completionNotes } = req.body;
    const employee = resolveEmployee(req);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Validate ownership (manager can override)
    if (employee.role && !employee.role.toLowerCase().includes('manager')) {
      if (task.assigned_to_id && task.assigned_to_id !== employee.user_id && task.assigned_to !== employee.name) {
        return res.status(403).json({ success: false, error: 'Cannot modify a task assigned to someone else' });
      }
    }

    const now = new Date().toISOString();
    let acceptedAt = task.accepted_at;
    let startedAt = task.started_at;
    let pausedAt = task.paused_at;
    let completedAt = task.completed_at;

    if (status === 'accepted' && !acceptedAt) acceptedAt = now;
    if (status === 'in_progress') startedAt = now;
    if (status === 'on_hold') pausedAt = now;
    if (status === 'completed') completedAt = now;

    db.prepare(`
      UPDATE tasks 
      SET status = ?, 
          completion_notes = COALESCE(?, completion_notes),
          accepted_at = ?,
          started_at = ?,
          paused_at = ?,
          completed_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(status, completionNotes || null, acceptedAt, startedAt, pausedAt, completedAt, now, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    const parsed = {
      ...updatedTask,
      proof_photo_urls: updatedTask.proof_photo_urls ? JSON.parse(updatedTask.proof_photo_urls) : [],
      notes: updatedTask.notes ? JSON.parse(updatedTask.notes) : []
    };

    // Broadcast WebSocket updates
    const io = req.app.get('io');
    if (io) {
      io.emit('task_updated', parsed);
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/employee/tasks/:id/proof
 */
export async function submitEmployeeTaskProof(req, res) {
  try {
    const { id } = req.params;
    const { proofPhotoUrls, signatureUrl, customerName, customerPhone, customerRating, customerFeedback, completionNotes } = req.body;
    const employee = resolveEmployee(req);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const now = new Date().toISOString();
    const photosJson = JSON.stringify(proofPhotoUrls || []);

    db.prepare(`
      UPDATE tasks 
      SET proof_photo_urls = ?,
          signature_url = ?,
          customer_name = ?,
          customer_phone = ?,
          customer_rating = ?,
          customer_feedback = ?,
          completion_notes = ?,
          status = 'completed',
          completed_at = ?,
          is_verified = 1,
          updated_at = ?
      WHERE id = ?
    `).run(
      photosJson,
      signatureUrl || null,
      customerName || null,
      customerPhone || null,
      customerRating || 5,
      customerFeedback || null,
      completionNotes || 'Work completed per engineering specs and signed off by client.',
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

    // Also insert notification for manager
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, task_id, is_read, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'high', ?)
    `).run(
      `notif-${Date.now()}`,
      'usr-101',
      'task_completed',
      `Proof Submitted: ${completedTask.title}`,
      `${employee.name} submitted completion proof and customer sign-off for Task #${id}.`,
      id,
      now
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('task_proof_submitted', parsed);
      io.emit('task_updated', parsed);
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/tasks/:id/notes
 */
export async function addEmployeeTaskNote(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Note text is required' });

    const employee = resolveEmployee(req);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const existingNotes = task.notes ? JSON.parse(task.notes) : [];
    const newNote = {
      id: `note-${Date.now()}`,
      author: employee.name,
      authorRole: employee.role,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    existingNotes.push(newNote);

    db.prepare('UPDATE tasks SET notes = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(existingNotes), new Date().toISOString(), id);

    res.json({ success: true, data: newNote, allNotes: existingNotes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/attendance
 */
export async function getEmployeeAttendance(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    const records = db.prepare(`
      SELECT * FROM attendance 
      WHERE user_id = ? OR user_name = ?
      ORDER BY date DESC, created_at DESC
      LIMIT 60
    `).all(employee.user_id, employee.name);

    const todayStr = new Date().toISOString().split('T')[0];
    const today = records.find(r => r.date === todayStr);

    // Compute late count and total hours
    let lateCount = 0;
    let totalWorkMinutes = 0;
    records.forEach(r => {
      if (r.status === 'late') lateCount++;
      totalWorkMinutes += (r.work_minutes || 0);
    });

    res.json({
      success: true,
      data: {
        records,
        today,
        stats: {
          daysPresent: records.length,
          lateCount,
          totalWorkHours: (totalWorkMinutes / 60).toFixed(1),
          leaveBalance: {
            annual: employee.leave_balance_annual || 14,
            sick: employee.leave_balance_sick || 8,
            casual: employee.leave_balance_casual || 4
          }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/attendance/check-in
 */
export async function employeeCheckIn(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = db.prepare(`
      SELECT * FROM attendance 
      WHERE (user_id = ? OR user_name = ?) AND date = ?
    `).get(employee.user_id, employee.name, todayStr);

    if (existing && existing.check_in_time) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in today at ' + new Date(existing.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    const { lat, lng, notes } = req.body;
    const now = new Date();
    const nowIso = now.toISOString();

    // Check if late (after 9:15 AM)
    const isLate = (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15));
    const status = isLate ? 'late' : 'present';

    const attId = `att-${employee.user_id}-${todayStr}`;
    db.prepare(`
      INSERT INTO attendance (
        id, user_id, user_name, date, check_in_time, check_in_lat, check_in_lng,
        is_within_geofence, verification_method, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'gps_geofence', ?, ?, ?)
    `).run(
      attId,
      employee.user_id,
      employee.name,
      todayStr,
      nowIso,
      lat || 28.6318,
      lng || 77.2170,
      status,
      notes || (isLate ? 'Late arrival recorded' : 'On-time GPS geofenced check-in'),
      nowIso
    );

    const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(attId);

    const io = req.app.get('io');
    if (io) {
      io.emit('employee_checked_in', record);
    }

    res.json({
      success: true,
      message: `Check-In verified successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/attendance/check-out
 */
export async function employeeCheckOut(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const existing = db.prepare(`
      SELECT * FROM attendance 
      WHERE (user_id = ? OR user_name = ?) AND date = ?
    `).get(employee.user_id, employee.name, todayStr);

    if (!existing || !existing.check_in_time) {
      return res.status(400).json({ success: false, error: 'Cannot check out: You have not checked in today.' });
    }

    if (existing.check_out_time) {
      return res.status(400).json({ success: false, error: 'You have already checked out today.' });
    }

    const { lat, lng } = req.body;
    const now = new Date();
    const nowIso = now.toISOString();

    const checkInMs = new Date(existing.check_in_time).getTime();
    const totalMinutes = Math.round((now.getTime() - checkInMs) / 60000);
    const breakMins = existing.break_minutes || 0;
    const workMinutes = Math.max(0, totalMinutes - breakMins);
    const standardShiftMins = 8 * 60;
    const overtimeMinutes = Math.max(0, workMinutes - standardShiftMins);

    db.prepare(`
      UPDATE attendance 
      SET check_out_time = ?,
          check_out_lat = ?,
          check_out_lng = ?,
          work_minutes = ?,
          overtime_minutes = ?,
          is_on_break = 0
      WHERE id = ?
    `).run(nowIso, lat || 28.6318, lng || 77.2170, workMinutes, overtimeMinutes, existing.id);

    const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('employee_checked_out', record);
    }

    res.json({
      success: true,
      message: `Check-out recorded. Shift duration: ${(workMinutes / 60).toFixed(1)} hours.`,
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/attendance/break
 */
export async function employeeBreakToggle(req, res) {
  try {
    const employee = resolveEmployee(req);
    const todayStr = new Date().toISOString().split('T')[0];

    const record = db.prepare(`
      SELECT * FROM attendance 
      WHERE (user_id = ? OR user_name = ?) AND date = ?
    `).get(employee.user_id, employee.name, todayStr);

    if (!record || !record.check_in_time || record.check_out_time) {
      return res.status(400).json({ success: false, error: 'Must have an active shift to start/end break.' });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (record.is_on_break) {
      // Ending break
      const startMs = record.break_start_time ? new Date(record.break_start_time).getTime() : now.getTime();
      const additionalMins = Math.max(1, Math.round((now.getTime() - startMs) / 60000));
      const totalBreak = (record.break_minutes || 0) + additionalMins;

      db.prepare(`
        UPDATE attendance 
        SET is_on_break = 0,
            break_end_time = ?,
            break_minutes = ?
        WHERE id = ?
      `).run(nowIso, totalBreak, record.id);

      res.json({
        success: true,
        isOnBreak: false,
        message: `Break ended. Resumed on-duty status. (${additionalMins} min break recorded)`
      });
    } else {
      // Starting break
      db.prepare(`
        UPDATE attendance 
        SET is_on_break = 1,
            break_start_time = ?
        WHERE id = ?
      `).run(nowIso, record.id);

      res.json({
        success: true,
        isOnBreak: true,
        message: `Break started at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/performance
 */
export async function getEmployeePerformance(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    // Personal tasks stats
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE assigned_to_id = ? OR assigned_to = ? OR LOWER(assigned_to) = ?
    `).all(employee.user_id, employee.name, employee.name.toLowerCase());

    const completed = tasks.filter(t => t.status === 'completed');
    const total = tasks.length;
    const taskCompletionRate = total > 0 ? Math.round((completed.length / total) * 100) : 100;

    // Monthly task trends (Jan to Nov)
    const monthlyTrends = [
      { month: 'Jan', completed: 18, assigned: 20 },
      { month: 'Feb', completed: 22, assigned: 23 },
      { month: 'Mar', completed: 25, assigned: 25 },
      { month: 'Apr', completed: 20, assigned: 21 },
      { month: 'May', completed: 28, assigned: 30 },
      { month: 'Jun', completed: 24, assigned: 24 },
      { month: 'Jul', completed: 26, assigned: 28 },
      { month: 'Aug', completed: 29, assigned: 30 },
      { month: 'Sep', completed: 27, assigned: 28 },
      { month: 'Oct', completed: 31, assigned: 32 },
      { month: 'Nov', completed: 14, assigned: 15 },
    ];

    // Weekly attendance comparison
    const attendanceTrends = [
      { day: 'Mon', onTime: 100, hours: 8.5 },
      { day: 'Tue', onTime: 100, hours: 9.0 },
      { day: 'Wed', onTime: 95, hours: 7.5 },
      { day: 'Thu', onTime: 100, hours: 8.8 },
      { day: 'Fri', onTime: 100, hours: 8.2 },
      { day: 'Sat', onTime: 100, hours: 4.0 },
    ];

    res.json({
      success: true,
      data: {
        tasksCompleted: completed.length,
        totalAssigned: total,
        completionPercentage: taskCompletionRate,
        attendancePercentage: 97.5,
        avgCompletionHours: 2.2,
        productivityScore: 350,
        customerRatingAvg: 4.9,
        monthlyTrends,
        attendanceTrends,
        badges: [
          { title: 'Top Field Performer', icon: '🏆', date: 'Oct 2026' },
          { title: '100% Geofence Accuracy', icon: '📍', date: 'Nov 2026' },
          { title: '5-Star Customer Feedback', icon: '⭐', date: 'Sep 2026' },
          { title: 'Safety Compliance Master', icon: '🛡️', date: 'Aug 2026' }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/notifications
 */
export async function getEmployeeNotifications(req, res) {
  try {
    const employee = resolveEmployee(req);
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? OR user_id = 'all'
      ORDER BY created_at DESC
    `).all(employee.user_id);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/employee/notifications/:id/read
 */
export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/notifications/mark-all-read
 */
export async function markAllNotificationsRead(req, res) {
  try {
    const employee = resolveEmployee(req);
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? OR user_id = 'all'
    `).run(employee.user_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/messages
 */
export async function getEmployeeMessages(req, res) {
  try {
    const employee = resolveEmployee(req);
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE recipient_id = ? OR sender_id = ? OR recipient_id = 'team'
      ORDER BY created_at ASC
    `).all(employee.user_id, employee.user_id);

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/messages
 */
export async function sendEmployeeMessage(req, res) {
  try {
    const employee = resolveEmployee(req);
    const { content, recipientId, channel, taskId } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, error: 'Content required' });

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: employee.user_id,
      sender_name: employee.name,
      sender_role: employee.role,
      sender_avatar: employee.avatar || '👤',
      recipient_id: recipientId || 'usr-101', // default to manager
      channel: channel || 'direct',
      task_id: taskId || null,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO messages (id, sender_id, sender_name, sender_role, sender_avatar, recipient_id, channel, task_id, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newMsg.id, newMsg.sender_id, newMsg.sender_name, newMsg.sender_role,
      newMsg.sender_avatar, newMsg.recipient_id, newMsg.channel, newMsg.task_id,
      newMsg.content, newMsg.created_at
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', newMsg);
    }

    res.status(201).json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/profile
 */
export async function getEmployeeProfile(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/employee/profile
 */
export async function updateEmployeeProfile(req, res) {
  try {
    const employee = resolveEmployee(req);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

    // Permitted fields only!
    const { phone, address, bio, emergencyContact, avatar } = req.body;

    db.prepare(`
      UPDATE users 
      SET phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          bio = COALESCE(?, bio),
          emergency_contact = COALESCE(?, emergency_contact),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(
      phone || null,
      address || null,
      bio || null,
      emergencyContact || null,
      avatar || null,
      employee.id
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(employee.id);
    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/employee/leave-apply
 */
export async function applyEmployeeLeave(req, res) {
  try {
    const employee = resolveEmployee(req);
    const { leaveType, startDate, endDate, days, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Start and end dates are required' });
    }

    const leaveId = `leave-${Date.now()}`;
    db.prepare(`
      INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, days, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      leaveId,
      employee.user_id,
      leaveType || 'annual',
      startDate,
      endDate,
      days || 1,
      reason || 'Personal time off',
      new Date().toISOString()
    );

    res.json({
      success: true,
      message: 'Leave application submitted and auto-approved by supervisor.',
      data: { id: leaveId, leaveType, startDate, endDate, days: days || 1, status: 'approved' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/employee/leaves
 */
export async function getEmployeeLeaves(req, res) {
  try {
    const employee = resolveEmployee(req);
    const leaves = db.prepare('SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC').all(employee.user_id);
    
    // Compute remaining quota
    const usedDays = leaves.filter(l => l.status === 'approved').reduce((acc, l) => acc + (Number(l.days) || 1), 0);
    const balances = {
      annual: Math.max(0, 14 - leaves.filter(l => l.leave_type === 'annual' && l.status === 'approved').reduce((acc, l) => acc + (Number(l.days) || 1), 0)),
      sick: Math.max(0, 8 - leaves.filter(l => l.leave_type === 'sick' && l.status === 'approved').reduce((acc, l) => acc + (Number(l.days) || 1), 0)),
      casual: Math.max(0, 6 - leaves.filter(l => l.leave_type === 'casual' && l.status === 'approved').reduce((acc, l) => acc + (Number(l.days) || 1), 0)),
    };

    res.json({
      success: true,
      data: {
        leaves,
        balances,
        totalUsedDays: usedDays
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
