import db from '../config/database.js';
import supabase from '../config/supabase.js';

/**
 * Handle user sign-in and update the "sign_in" column in the SQLite database
 * POST /api/auth/sign-in
 */
export async function signIn(req, res) {
  try {
    const { email, password, name, role, department, device } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();
    const userDevice = device || req.headers['user-agent'] || 'Web Dashboard';
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

    // 1. Look up user in SQLite database
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      // If user doesn't exist yet, automatically create their account row with sign_in timestamp
      const newUserId = `usr-${Date.now().toString().slice(-4)}`;
      const userName = name || cleanEmail.split('@')[0];
      const userRole = role || (cleanEmail.includes('manager') ? 'Operations Manager' : 'Field Specialist');
      const userDept = department || 'Field Operations';
      const userAvatar = userRole.includes('Manager') ? '👔' : '👤';

      db.prepare(`
        INSERT INTO users (
          user_id, name, email, password, role, department,
          phone, avatar, badge, sign_in, sign_in_count,
          sign_in_ip, sign_in_device, sign_in_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newUserId, userName, cleanEmail, password || 'Workforce@2026', userRole, userDept,
        '+91 98000-00000', userAvatar, userRole, now, 1,
        clientIp, userDevice, 'Active', now
      );

      user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    } else {
      // 2. Existing user: update the "sign_in" column and increment sign_in_count
      db.prepare(`
        UPDATE users 
        SET sign_in = ?,
            sign_in_count = sign_in_count + 1,
            sign_in_device = ?,
            sign_in_ip = ?,
            sign_in_status = 'Active'
        WHERE id = ?
      `).run(now, userDevice, clientIp, user.id);

      // Re-fetch updated row to return exact database record
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    // 3. Insert audit log into sign_in_history table
    db.prepare(`
      INSERT INTO sign_in_history (user_id, name, email, role, sign_in, ip_address, device, method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.user_id, user.name, user.email, user.role,
      now, clientIp, userDevice, 'password_auth'
    );

    // 4. Sync employee sign-in details to Supabase table (as shown in Supabase dashboard)
    try {
      const supabasePayload = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Field Operations',
        phone: user.phone || '+91 98000-00000',
        avatar: user.avatar || '👤',
        badge: user.badge || user.role,
        sign_in: now,
        sign_in_count: user.sign_in_count,
        ip_address: clientIp,
        device: userDevice,
        status: 'Active'
      };
      await supabase.from('employee_sign_ins').insert([supabasePayload]);
      await supabase.from('sign_in').insert([supabasePayload]);
    } catch (sbErr) {
      console.warn('[Supabase Sync Notice]:', sbErr.message);
    }

    // Broadcast WebSocket login event if io is mounted
    const io = req.app?.get('io');
    if (io) {
      io.emit('user_signed_in', {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        sign_in: user.sign_in
      });
    }

    res.json({
      success: true,
      message: `User ${user.name} signed in successfully. Database "sign_in" column updated!`,
      user: {
        ...user,
        userId: user.user_id,
        sign_in: user.sign_in,          // Dedicated database column requested by user
        signInCount: user.sign_in_count,
        signInDevice: user.sign_in_device,
        signInIp: user.sign_in_ip,
        status: user.sign_in_status,
        createdAt: user.created_at
      },
      databaseInfo: {
        engine: 'SQLite 3 (Persistent Database)',
        file: 'backend/ework.db',
        table: 'users',
        targetColumn: 'sign_in',
        signInTimestamp: user.sign_in
      }
    });

  } catch (err) {
    console.error('[AuthController] Sign In Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Handle new account creation / sign-up
 * POST /api/auth/sign-up
 */
export async function signUp(req, res) {
  try {
    const { name, email, password, role, department, phone, organization_id } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Determine organization ID
    const orgId = organization_id || req.user?.organization_id || 'org-demo-default';

    // Verify Organization Subscription & Employee Limits
    const orgSub = db.prepare('SELECT * FROM subscriptions WHERE organization_id = ?').get(orgId);
    if (orgSub) {
      if (orgSub.status === 'expired' || orgSub.status === 'suspended') {
        return res.status(403).json({
          success: false,
          error: `Your organization subscription is ${orgSub.status}. Please renew your plan to add new employees.`
        });
      }

      const currentStaffCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE organization_id = ?').get(orgId)?.count || 0;
      if (currentStaffCount >= orgSub.employee_limit) {
        return res.status(403).json({
          success: false,
          error: `Subscription limit reached (${orgSub.employee_limit} employees on the ${orgSub.plan.toUpperCase()} plan). Upgrade your subscription to add more staff.`
        });
      }
    }

    const now = new Date().toISOString();
    const newUserId = `usr-${Date.now().toString().slice(-4)}`;
    const userRole = role || 'Field Staff';
    const userDept = department || 'Field Operations';
    const avatar = userRole.includes('Manager') ? '👔' : '👤';

    db.prepare(`
      INSERT INTO users (
        user_id, name, email, password, role, department,
        phone, avatar, badge, sign_in, sign_in_count,
        sign_in_ip, sign_in_device, sign_in_status, organization_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUserId, name.trim(), cleanEmail, password || 'Workforce@2026', userRole, userDept,
      phone || '+91 98000-00000', avatar, userRole, now, 1,
      req.ip || '127.0.0.1', 'Web Registration', 'Active', orgId, now
    );

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    // Audit log
    db.prepare(`
      INSERT INTO sign_in_history (user_id, name, email, role, sign_in, ip_address, device, method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.user_id, user.name, user.email, user.role,
      now, req.ip || '127.0.0.1', 'Web Registration', 'new_account_signup'
    );

    // Sync to Supabase table
    try {
      const supabasePayload = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Field Operations',
        phone: user.phone || '+91 98000-00000',
        avatar: user.avatar || '👤',
        badge: user.badge || user.role,
        sign_in: now,
        sign_in_count: 1,
        ip_address: req.ip || '127.0.0.1',
        device: 'Web Registration',
        status: 'Active'
      };
      await supabase.from('employee_sign_ins').insert([supabasePayload]);
      await supabase.from('sign_in').insert([supabasePayload]);
    } catch (sbErr) {
      console.warn('[Supabase Sync Notice]:', sbErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account registered and signed in! Database row created with "sign_in" column timestamp.',
      user: {
        ...user,
        userId: user.user_id,
        sign_in: user.sign_in,
        signInCount: user.sign_in_count,
        createdAt: user.created_at
      }
    });

  } catch (err) {
    console.error('[AuthController] Sign Up Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch all users from SQLite database table "users"
 * GET /api/auth/users
 */
export async function getUsers(req, res) {
  try {
    const users = db.prepare('SELECT id, user_id, name, email, role, department, phone, avatar, badge, sign_in, sign_in_count, sign_in_status, sign_in_device, created_at FROM users ORDER BY id ASC').all();
    res.json({
      success: true,
      count: users.length,
      database: 'ework.db',
      table: 'users',
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch a single user by email or user_id
 * GET /api/auth/user/:identifier
 */
export async function getUser(req, res) {
  try {
    const { identifier } = req.params;
    const user = db.prepare(`
      SELECT id, user_id, name, email, role, department, phone, avatar, badge, sign_in, sign_in_count, sign_in_status, sign_in_device, created_at 
      FROM users 
      WHERE LOWER(email) = ? OR user_id = ? OR id = ?
    `).get(identifier.toLowerCase(), identifier, identifier);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found in database.' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch audit logs of sign-ins
 * GET /api/auth/sign-in-logs
 */
export async function getSignInLogs(req, res) {
  try {
    const logs = db.prepare('SELECT * FROM sign_in_history ORDER BY id DESC LIMIT 50').all();
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get schema information showing the "sign_in" column in SQLite
 * GET /api/auth/schema
 */
export async function getDatabaseSchema(req, res) {
  try {
    const columns = db.prepare("PRAGMA table_info(users)").all();
    res.json({
      success: true,
      databaseFile: 'backend/ework.db',
      table: 'users',
      columns: columns.map(c => ({
        cid: c.cid,
        name: c.name,
        type: c.type,
        notnull: c.notnull,
        dflt_value: c.dflt_value,
        pk: c.pk
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch employee sign-in rows from Supabase database
 * GET /api/auth/supabase-sign-ins
 */
export async function getSupabaseSignIns(req, res) {
  try {
    let { data, error } = await supabase
      .from('employee_sign_ins')
      .select('*')
      .order('sign_in', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('sign_in')
        .select('*')
        .order('sign_in', { ascending: false });
      if (fallback.data && fallback.data.length > 0) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        tableCreated: false,
        hint: 'Table not yet created in Supabase. Run 03_employee_sign_in.sql in Supabase SQL editor.'
      });
    }

    res.json({
      success: true,
      source: 'Supabase Cloud Database',
      project: 'ptxfxtxwytrzznswudlc',
      table: 'employee_sign_ins',
      count: data?.length || 0,
      data: data || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

