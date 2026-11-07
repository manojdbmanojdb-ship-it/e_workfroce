import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path: backend/ework.db
const dbDir = path.resolve(__dirname, '../../');
const dbPath = path.join(dbDir, 'ework.db');

console.log(`[Database] Initializing SQLite database at: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// Initialize Tables
export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Field Staff',
      department TEXT NOT NULL DEFAULT 'Operations',
      designation TEXT DEFAULT 'Field Technician',
      reporting_manager TEXT DEFAULT 'Rajesh Kumar',
      joining_date TEXT DEFAULT '2024-03-15',
      phone TEXT,
      avatar TEXT DEFAULT '👤',
      badge TEXT DEFAULT 'Active Staff',
      address TEXT DEFAULT 'New Delhi, India',
      bio TEXT DEFAULT 'Dedicated field operations specialist for E-Workforce.',
      emergency_contact TEXT DEFAULT '+91 98111-00998',
      leave_balance_annual INTEGER DEFAULT 14,
      leave_balance_sick INTEGER DEFAULT 8,
      leave_balance_casual INTEGER DEFAULT 4,
      sign_in TEXT,
      sign_in_count INTEGER DEFAULT 0,
      sign_in_ip TEXT DEFAULT '127.0.0.1',
      sign_in_device TEXT DEFAULT 'Web Browser',
      sign_in_status TEXT DEFAULT 'Active',
      created_at TEXT NOT NULL
    );
  `);

  // Ensure any missing columns exist on users
  const userColumns = [
    { name: 'designation', def: 'TEXT DEFAULT "Field Specialist"' },
    { name: 'reporting_manager', def: 'TEXT DEFAULT "Rajesh Kumar"' },
    { name: 'joining_date', def: 'TEXT DEFAULT "2024-03-15"' },
    { name: 'address', def: 'TEXT DEFAULT "New Delhi, India"' },
    { name: 'bio', def: 'TEXT DEFAULT "Dedicated workforce specialist."' },
    { name: 'emergency_contact', def: 'TEXT DEFAULT "+91 98111-00998"' },
    { name: 'leave_balance_annual', def: 'INTEGER DEFAULT 14' },
    { name: 'leave_balance_sick', def: 'INTEGER DEFAULT 8' },
    { name: 'leave_balance_casual', def: 'INTEGER DEFAULT 4' },
    { name: 'sign_in', def: 'TEXT' },
    { name: 'organization_id', def: 'TEXT DEFAULT "org-demo-default"' },
  ];

  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const existingColNames = tableInfo.map(c => c.name);
    for (const col of userColumns) {
      if (!existingColNames.includes(col.name)) {
        console.log(`[Database] Adding column "${col.name}" to users table...`);
        db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def};`);
      }
    }
  } catch (err) {
    console.warn('[Database] Column check warning for users:', err.message);
  }

  // 2. Sign In Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sign_in_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      sign_in TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      device TEXT,
      method TEXT DEFAULT 'password_auth'
    );
  `);

  // -------------------------------------------------------------
  // SaaS Freemium & Subscription Architecture Tables
  // -------------------------------------------------------------

  // 2a. Organizations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_email TEXT NOT NULL,
      phone TEXT,
      industry TEXT,
      org_size TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    );
  `);

  // 2b. Subscriptions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      employee_limit INTEGER DEFAULT 5,
      license_key TEXT,
      features TEXT,
      start_date TEXT NOT NULL,
      expiry_date TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 2c. Organization License Keys Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      license_key TEXT UNIQUE NOT NULL,
      plan TEXT NOT NULL,
      duration_days INTEGER DEFAULT 365,
      status TEXT NOT NULL DEFAULT 'available',
      organization_id TEXT,
      organization_name TEXT,
      payment_id TEXT,
      created_by TEXT DEFAULT 'superadmin',
      activated_at TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 2d. Payments & UPI Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      plan TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_method TEXT NOT NULL,
      payment_ref TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      license_key TEXT,
      verified_by TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT NOT NULL,
      assigned_to_id TEXT,
      assigned_by TEXT DEFAULT 'Dispatch Manager',
      destination_lat REAL DEFAULT 28.6315,
      destination_lng REAL DEFAULT 77.2167,
      address TEXT DEFAULT 'Connaught Place, New Delhi',
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'assigned',
      proof_photo_urls TEXT DEFAULT '[]',
      signature_url TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_rating INTEGER DEFAULT 0,
      customer_feedback TEXT,
      completion_notes TEXT,
      notes TEXT DEFAULT '[]',
      accepted_at TEXT,
      started_at TEXT,
      paused_at TEXT,
      completed_at TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 4. Attendance Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      break_start_time TEXT,
      break_end_time TEXT,
      break_minutes INTEGER DEFAULT 0,
      is_on_break INTEGER DEFAULT 0,
      work_minutes INTEGER DEFAULT 0,
      overtime_minutes INTEGER DEFAULT 0,
      check_in_lat REAL DEFAULT 28.6318,
      check_in_lng REAL DEFAULT 77.2170,
      check_out_lat REAL,
      check_out_lng REAL,
      is_within_geofence INTEGER DEFAULT 1,
      verification_method TEXT DEFAULT 'gps_geofence',
      status TEXT DEFAULT 'present',
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      task_id TEXT,
      is_read INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'normal',
      created_at TEXT NOT NULL
    );
  `);

  // 6. Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_avatar TEXT DEFAULT '👤',
      recipient_id TEXT NOT NULL,
      channel TEXT DEFAULT 'direct',
      task_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 7. Leave Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days INTEGER DEFAULT 1,
      reason TEXT,
      status TEXT DEFAULT 'approved',
      created_at TEXT NOT NULL
    );
  `);

  // -------------------------------------------------------------
  // Seed Default Users if needed
  // -------------------------------------------------------------
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (countRow.count === 0) {
    console.log('[Database] Seeding initial users into ework.db...');
    const seedUsers = [
      {
        user_id: 'usr-101',
        name: 'Rajesh Kumar',
        email: 'manager@ework.com',
        password: 'Workforce@2026',
        role: 'Operations Manager',
        department: 'Headquarters Dispatch',
        designation: 'Operations Director',
        reporting_manager: 'Executive Board',
        phone: '+91 98101-22334',
        avatar: '👔',
        badge: 'Admin Console',
        sign_in: new Date(Date.now() - 3600000).toISOString(),
        sign_in_count: 5,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        user_id: 'usr-102',
        name: 'Rahul Sharma',
        email: 'rahul@ework.com',
        password: 'Workforce@2026',
        role: 'Senior Technician',
        department: 'Delhi Central Hub',
        designation: 'Senior Field Technician',
        reporting_manager: 'Rajesh Kumar',
        phone: '+91 98112-40912',
        avatar: '🔧',
        badge: 'Field Tech',
        sign_in: new Date(Date.now() - 7200000).toISOString(),
        sign_in_count: 14,
        created_at: new Date(Date.now() - 86400000 * 25).toISOString()
      },
      {
        user_id: 'usr-103',
        name: 'Priya Patel',
        email: 'priya@ework.com',
        password: 'Workforce@2026',
        role: 'Sales Executive',
        department: 'Mumbai Tech Hub',
        designation: 'Senior Field Sales Lead',
        reporting_manager: 'Rajesh Kumar',
        phone: '+91 98220-55123',
        avatar: '💼',
        badge: 'Field Sales',
        sign_in: new Date(Date.now() - 14400000).toISOString(),
        sign_in_count: 8,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        user_id: 'usr-104',
        name: 'Sneha Rao',
        email: 'sneha@ework.com',
        password: 'Workforce@2026',
        role: 'Quality Inspector',
        department: 'Hyderabad Zone',
        designation: 'Lead Safety & Quality Auditor',
        reporting_manager: 'Rajesh Kumar',
        phone: '+91 99001-33211',
        avatar: '📋',
        badge: 'Auditor',
        sign_in: new Date(Date.now() - 28800000).toISOString(),
        sign_in_count: 11,
        created_at: new Date(Date.now() - 86400000 * 18).toISOString()
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO users (
        user_id, name, email, password, role, department, designation, reporting_manager,
        phone, avatar, badge, sign_in, sign_in_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of seedUsers) {
      insertStmt.run(
        u.user_id, u.name, u.email, u.password, u.role,
        u.department, u.designation, u.reporting_manager,
        u.phone, u.avatar, u.badge, u.sign_in,
        u.sign_in_count, u.created_at
      );
    }
  }

  // -------------------------------------------------------------
  // Seed Sample Tasks if empty
  // -------------------------------------------------------------
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  if (taskCount.count === 0) {
    console.log('[Database] Seeding initial field tasks...');
    const now = Date.now();
    const seedTasks = [
      {
        id: 'task-402',
        title: 'HVAC Compressor Diagnostic & Repair #T-402',
        description: 'Comprehensive inspection of 45-ton roof chiller compressor. Check voltage fluctuations, replace burnt capacitors, verify pressure safety relief valves.',
        assigned_to: 'Rahul Sharma',
        assigned_to_id: 'usr-102',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 28.6318,
        destination_lng: 77.2170,
        address: 'Connaught Place, Block B, New Delhi',
        due_date: new Date(now + 86400000).toISOString(),
        priority: 'high',
        status: 'in_progress',
        proof_photo_urls: JSON.stringify(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80']),
        customer_name: 'Vikram Malhotra',
        customer_phone: '+91 98112-40912',
        customer_rating: 5,
        customer_feedback: 'Rahul was extremely prompt, diagnosed capacitor failure in 15 mins.',
        completion_notes: 'Replaced 45uF capacitor, cleaned copper coils, pressure tested at 120 PSI.',
        notes: JSON.stringify([
          { id: 'note-1', author: 'Rahul Sharma', text: 'Arrived at Connaught Place facility. Access granted by building engineer.', createdAt: new Date(now - 3600000).toISOString() },
          { id: 'note-2', author: 'Rajesh Kumar', text: 'Please ensure high-pressure cutoff switch is calibrated.', createdAt: new Date(now - 1800000).toISOString() }
        ]),
        accepted_at: new Date(now - 7200000).toISOString(),
        started_at: new Date(now - 3600000).toISOString(),
        created_at: new Date(now - 86400000).toISOString(),
        updated_at: new Date(now - 1800000).toISOString()
      },
      {
        id: 'task-409',
        title: 'Emergency Circuit Breaker Tripping Diagnostic #T-409',
        description: 'Main incoming 415V distribution panel keeps tripping under peak afternoon load. Test thermal relay and insulation resistance.',
        assigned_to: 'Rahul Sharma',
        assigned_to_id: 'usr-102',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 28.6305,
        destination_lng: 77.2155,
        address: 'Barakhamba Road, DCM Building, Floor 4',
        due_date: new Date(now + 14400000).toISOString(),
        priority: 'urgent',
        status: 'assigned',
        proof_photo_urls: JSON.stringify([]),
        notes: JSON.stringify([]),
        created_at: new Date(now - 7200000).toISOString(),
        updated_at: new Date(now - 7200000).toISOString()
      },
      {
        id: 'task-415',
        title: 'Quarterly Rooftop Chiller Unit Preventive Maintenance #T-415',
        description: 'Scheduled multi-point maintenance: inspect coolant level, clean air intake filters, test condenser fans, log operational temperature delta.',
        assigned_to: 'Rahul Sharma',
        assigned_to_id: 'usr-102',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 28.4986,
        destination_lng: 77.0878,
        address: 'DLF Cyber City, Tower C, Gurugram',
        due_date: new Date(now + 86400000 * 3).toISOString(),
        priority: 'medium',
        status: 'accepted',
        proof_photo_urls: JSON.stringify([]),
        notes: JSON.stringify([]),
        accepted_at: new Date(now - 14400000).toISOString(),
        created_at: new Date(now - 86400000 * 2).toISOString(),
        updated_at: new Date(now - 14400000).toISOString()
      },
      {
        id: 'task-395',
        title: 'Fiber Switchboard Terminal Overhaul #T-395',
        description: 'Replace worn junction box connectors and rewire 24 fiber optic patch lines.',
        assigned_to: 'Rahul Sharma',
        assigned_to_id: 'usr-102',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 28.5492,
        destination_lng: 77.2533,
        address: 'Nehru Place Tech Hub, South Delhi',
        due_date: new Date(now - 86400000).toISOString(),
        priority: 'medium',
        status: 'completed',
        proof_photo_urls: JSON.stringify(['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80']),
        customer_name: 'Rohan Sen',
        customer_phone: '+91 98105-66778',
        customer_rating: 5,
        customer_feedback: 'Flawless job, zero network packets dropped during handover.',
        completion_notes: 'All patch cables rerouted and heat-shrink tagged with QR IDs.',
        completed_at: new Date(now - 86400000).toISOString(),
        is_verified: 1,
        created_at: new Date(now - 86400000 * 3).toISOString(),
        updated_at: new Date(now - 86400000).toISOString()
      },
      {
        id: 'task-501',
        title: 'Enterprise SaaS Solution Demo - Sharma Traders #C-118',
        description: 'Conduct on-site product presentation to Managing Director and Procurement Officers.',
        assigned_to: 'Priya Patel',
        assigned_to_id: 'usr-103',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 19.0760,
        destination_lng: 72.8777,
        address: 'Bandra Kurla Complex (BKC), Mumbai',
        due_date: new Date(now + 86400000).toISOString(),
        priority: 'high',
        status: 'in_progress',
        proof_photo_urls: JSON.stringify([]),
        notes: JSON.stringify([]),
        accepted_at: new Date(now - 10000000).toISOString(),
        started_at: new Date(now - 3000000).toISOString(),
        created_at: new Date(now - 86400000).toISOString(),
        updated_at: new Date(now - 3000000).toISOString()
      },
      {
        id: 'task-601',
        title: 'Quarterly Fire Extinguisher Testing & NFC Audit #A-552',
        description: 'Test all 14 fire extinguishers, inspect pressure gauges, update NFC compliance inspection tags.',
        assigned_to: 'Sneha Rao',
        assigned_to_id: 'usr-104',
        assigned_by: 'Rajesh Kumar (Operations Manager)',
        destination_lat: 17.4435,
        destination_lng: 78.3772,
        address: 'Hitec City, Phase 2, Hyderabad',
        due_date: new Date(now + 86400000).toISOString(),
        priority: 'high',
        status: 'in_progress',
        proof_photo_urls: JSON.stringify(['https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80']),
        customer_name: 'Ananya Deshmukh',
        customer_rating: 5,
        customer_feedback: 'All 14 extinguishers inspected thoroughly and tagged with NFC barcodes.',
        notes: JSON.stringify([]),
        created_at: new Date(now - 86400000).toISOString(),
        updated_at: new Date(now - 10000000).toISOString()
      }
    ];

    const insertTaskStmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, assigned_to, assigned_to_id, assigned_by,
        destination_lat, destination_lng, address, due_date, priority,
        status, proof_photo_urls, customer_name, customer_phone, customer_rating,
        customer_feedback, completion_notes, notes, accepted_at, started_at,
        completed_at, is_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of seedTasks) {
      insertTaskStmt.run(
        t.id, t.title, t.description, t.assigned_to, t.assigned_to_id, t.assigned_by,
        t.destination_lat, t.destination_lng, t.address, t.due_date, t.priority,
        t.status, t.proof_photo_urls, t.customer_name || null, t.customer_phone || null,
        t.customer_rating || 0, t.customer_feedback || null, t.completion_notes || null,
        t.notes, t.accepted_at || null, t.started_at || null,
        t.completed_at || null, t.is_verified || 0, t.created_at, t.updated_at
      );
    }
  }

  // -------------------------------------------------------------
  // Seed Sample Attendance Records for Employees
  // -------------------------------------------------------------
  const attCount = db.prepare('SELECT COUNT(*) as count FROM attendance').get();
  if (attCount.count === 0) {
    console.log('[Database] Seeding realistic monthly attendance records...');
    const insertAttStmt = db.prepare(`
      INSERT INTO attendance (
        id, user_id, user_name, date, check_in_time, check_out_time,
        break_minutes, work_minutes, overtime_minutes, check_in_lat, check_in_lng,
        is_within_geofence, verification_method, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Past 10 working days
    const usersList = [
      { id: 'usr-102', name: 'Rahul Sharma' },
      { id: 'usr-103', name: 'Priya Patel' },
      { id: 'usr-104', name: 'Sneha Rao' }
    ];

    const today = new Date();
    for (let dayOffset = 1; dayOffset <= 12; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);
      if (d.getDay() === 0) continue; // Skip Sunday

      const dateStr = d.toISOString().split('T')[0];
      for (const u of usersList) {
        const isLate = (dayOffset % 6 === 0);
        const inHour = isLate ? 9 : 8;
        const inMinute = isLate ? 35 : Math.floor(Math.random() * 20) + 15;
        const checkIn = new Date(d);
        checkIn.setHours(inHour, inMinute, 0, 0);

        const checkOut = new Date(d);
        checkOut.setHours(17, 30 + Math.floor(Math.random() * 45), 0, 0);

        const workMins = Math.round((checkOut - checkIn) / 60000) - 45; // minus lunch
        const otMins = Math.max(0, workMins - 480);

        insertAttStmt.run(
          `att-${u.id}-${dateStr}`,
          u.id,
          u.name,
          dateStr,
          checkIn.toISOString(),
          checkOut.toISOString(),
          45,
          workMins,
          otMins,
          28.6318,
          77.2170,
          1,
          'gps_geofence',
          isLate ? 'late' : 'present',
          isLate ? 'Traffic congestion on Ring Road' : 'On-time geofenced punch',
          checkIn.toISOString()
        );
      }
    }

    // Today's active check-in for Rahul Sharma
    const todayStr = today.toISOString().split('T')[0];
    const todayCheckIn = new Date();
    todayCheckIn.setHours(8, 30, 0, 0);
    insertAttStmt.run(
      `att-usr-102-${todayStr}`,
      'usr-102',
      'Rahul Sharma',
      todayStr,
      todayCheckIn.toISOString(),
      null,
      15,
      0,
      0,
      28.6318,
      77.2170,
      1,
      'gps_geofence',
      'present',
      'Morning on-duty shift check-in',
      todayCheckIn.toISOString()
    );
  }

  // -------------------------------------------------------------
  // Seed Notifications
  // -------------------------------------------------------------
  const notifCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
  if (notifCount.count === 0) {
    console.log('[Database] Seeding employee notifications...');
    const insertNotifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, task_id, is_read, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleNotifs = [
      {
        id: 'notif-1',
        user_id: 'usr-102',
        type: 'task_assigned',
        title: 'Emergency Task Assigned',
        message: 'You have been assigned to "Emergency Circuit Breaker Tripping Diagnostic #T-409" at Barakhamba Road.',
        task_id: 'task-409',
        is_read: 0,
        priority: 'urgent',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'notif-2',
        user_id: 'usr-102',
        type: 'task_approved',
        title: 'Proof of Work Approved',
        message: 'Task #T-395 (Fiber Switchboard Terminal Overhaul) was approved by Manager Rajesh Kumar with 5/5 stars.',
        task_id: 'task-395',
        is_read: 0,
        priority: 'high',
        created_at: new Date(Date.now() - 28800000).toISOString()
      },
      {
        id: 'notif-3',
        user_id: 'usr-102',
        type: 'deadline_approaching',
        title: 'Task Deadline Approaching',
        message: 'HVAC Compressor Diagnostic #T-402 is due tomorrow at 2:00 PM.',
        task_id: 'task-402',
        is_read: 1,
        priority: 'normal',
        created_at: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 'notif-4',
        user_id: 'usr-102',
        type: 'attendance_reminder',
        title: 'Daily Attendance Reminder',
        message: 'Remember to punch your GPS Check-In upon arriving at your first site.',
        task_id: null,
        is_read: 1,
        priority: 'normal',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'notif-5',
        user_id: 'all',
        type: 'manager_announcement',
        title: 'Company Announcement: Q4 Safety Standards',
        message: 'All field staff must wear ISO-certified high-visibility vests and insulated gloves on all electrical service orders.',
        task_id: null,
        is_read: 0,
        priority: 'high',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];

    for (const n of sampleNotifs) {
      insertNotifStmt.run(n.id, n.user_id, n.type, n.title, n.message, n.task_id, n.is_read, n.priority, n.created_at);
    }
  }

  // -------------------------------------------------------------
  // Seed Messages
  // -------------------------------------------------------------
  const msgCount = db.prepare('SELECT COUNT(*) as count FROM messages').get();
  if (msgCount.count === 0) {
    console.log('[Database] Seeding initial employee communication messages...');
    const insertMsgStmt = db.prepare(`
      INSERT INTO messages (id, sender_id, sender_name, sender_role, sender_avatar, recipient_id, channel, task_id, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleMsgs = [
      {
        id: 'msg-1',
        sender_id: 'usr-101',
        sender_name: 'Rajesh Kumar',
        sender_role: 'Operations Manager',
        sender_avatar: '👔',
        recipient_id: 'usr-102',
        channel: 'direct',
        task_id: 'task-402',
        content: 'Hi Rahul, customer at Connaught Place requested that you test the thermostat sensor after replacing the capacitor.',
        created_at: new Date(Date.now() - 5400000).toISOString()
      },
      {
        id: 'msg-2',
        sender_id: 'usr-102',
        sender_name: 'Rahul Sharma',
        sender_role: 'Senior Technician',
        sender_avatar: '🔧',
        recipient_id: 'usr-101',
        channel: 'direct',
        task_id: 'task-402',
        content: 'Understood, Mr. Rajesh. I have the digital multimeter ready and will verify both low and high temperature cutoffs.',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-3',
        sender_id: 'usr-101',
        sender_name: 'Rajesh Kumar',
        sender_role: 'Operations Manager',
        sender_avatar: '👔',
        recipient_id: 'team',
        channel: 'announcements',
        task_id: null,
        content: 'Great work team on maintaining a 98% on-time dispatch rate this week! Keep it up.',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    for (const m of sampleMsgs) {
      insertMsgStmt.run(m.id, m.sender_id, m.sender_name, m.sender_role, m.sender_avatar, m.recipient_id, m.channel, m.task_id, m.content, m.created_at);
    }
  }

  // -------------------------------------------------------------
  // Seed Default SaaS Organization & Super Admin Architecture
  // -------------------------------------------------------------
  try {
    const orgExists = db.prepare('SELECT id FROM organizations WHERE id = ?').get('org-demo-default');
    if (!orgExists) {
      console.log('[Database] Seeding default SaaS organization and subscription...');
      db.prepare(`
        INSERT INTO organizations (id, name, business_email, phone, industry, org_size, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'org-demo-default',
        'Apex Field Services Pvt Ltd',
        'ops@apexfield.com',
        '+91 98111-00998',
        'HVAC & Electrical Maintenance',
        '11-50 employees',
        'active',
        new Date(Date.now() - 86400000 * 30).toISOString()
      );

      db.prepare(`
        INSERT INTO subscriptions (id, organization_id, plan, status, employee_limit, license_key, features, start_date, expiry_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'sub-demo-default',
        'org-demo-default',
        'professional',
        'active',
        100,
        'EWF-PRO-DEFAULT-DEMO',
        JSON.stringify({
          live_gps: true,
          route_playback: true,
          geofence_checkin: true,
          advanced_reports: true,
          sos_panic: true,
          custom_polygons: true,
          export_csv: true
        }),
        new Date(Date.now() - 86400000 * 30).toISOString(),
        new Date(Date.now() + 86400000 * 335).toISOString(),
        new Date(Date.now() - 86400000 * 30).toISOString()
      );
    }

    // Seed Super Admin Account
    const superAdminExists = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('superadmin@ework.com');
    if (!superAdminExists) {
      console.log('[Database] Seeding Super Admin user account (superadmin@ework.com)...');
      db.prepare(`
        INSERT INTO users (
          user_id, name, email, password, role, department,
          phone, avatar, badge, sign_in, sign_in_count,
          sign_in_ip, sign_in_device, sign_in_status, organization_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-superadmin',
        'Super Admin Officer',
        'superadmin@ework.com',
        'Workforce@2026',
        'Super Admin',
        'Executive SaaS Management',
        '+91 99999-00001',
        '⚡',
        'Global Super Admin',
        new Date().toISOString(),
        1,
        '127.0.0.1',
        'Console',
        'Active',
        'org-demo-default',
        new Date().toISOString()
      );
    }

    // Seed Available Demo License Keys
    const demoKeys = [
      { key: 'EWF-PRO-2026-DEMO', plan: 'professional', days: 365 },
      { key: 'EWF-ENT-2026-DEMO', plan: 'enterprise', days: 365 },
      { key: 'EWF-PRO-TEST-9921', plan: 'professional', days: 365 }
    ];
    for (const lic of demoKeys) {
      const exists = db.prepare('SELECT id FROM licenses WHERE license_key = ?').get(lic.key);
      if (!exists) {
        db.prepare(`
          INSERT INTO licenses (id, license_key, plan, duration_days, status, created_by, created_at)
          VALUES (?, ?, ?, ?, 'available', 'system_seed', ?)
        `).run(`lic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, lic.key, lic.plan, lic.days, new Date().toISOString());
      }
    }

    // Seed Pending Manual UPI Payment for testing verification
    const samplePay = db.prepare('SELECT id FROM payments WHERE transaction_id = ?').get('UPI-TXN-984421');
    if (!samplePay) {
      db.prepare(`
        INSERT INTO payments (id, transaction_id, customer_name, customer_email, organization_name, plan, amount, currency, payment_method, payment_ref, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(
        'pay-sample-01',
        'UPI-TXN-984421',
        'Vikramaditya Logistics',
        'vikram@vlogistics.in',
        'V-Logistics India Corp',
        'professional',
        1999,
        'INR',
        'upi_manual',
        'UTR99482103819',
        new Date(Date.now() - 3600000 * 2).toISOString()
      );
    }
  } catch (saErr) {
    console.warn('[Database] SaaS architecture seeding note:', saErr.message);
  }

  console.log('[Database] SQLite ework.db is ready and operational.');
}

export default db;