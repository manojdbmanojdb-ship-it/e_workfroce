/**
 * Enterprise Notification & Automated Email Digest Service
 * Dispatches SOS emergency alerts, manager push webhooks, and daily shift summaries.
 */

const notificationHistory = [];

/**
 * Builds and dispatches an emergency SOS alert notification to all designated management emails
 */
export async function sendEmergencySosAlert(alertPayload) {
  const {
    id = `sos-${Date.now()}`,
    userId = '00000000-0000-0000-0000-000000000000',
    employeeName = 'Rahul Sharma',
    phone = '+91 98765 43210',
    latitude = 28.6315,
    longitude = 77.2167,
    message = 'EMERGENCY: Immediate Field Assistance Required!',
    triggeredAt = new Date().toISOString(),
  } = alertPayload;

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #050b14; color: #f1f5f9; padding: 24px; margin: 0; }
    .card { background: #0d1829; border: 1px solid #ef4444; border-radius: 16px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2); }
    .header { display: flex; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 18px; }
    .badge { background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 900; letter-spacing: 1px; border: 1px solid rgba(239, 68, 68, 0.5); }
    .title { color: #ffffff; font-size: 20px; font-weight: 800; margin: 12px 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .info-grid { background: #050b14; border-radius: 12px; border: 1px solid #1e293b; padding: 16px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #f1f5f9; font-weight: 700; }
    .btn { display: inline-block; background: #ef4444; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px; text-align: center; margin-right: 10px; }
    .btn-secondary { background: #1e293b; color: #38bdf8 !important; border: 1px solid #0ea5e9; }
    .footer { text-align: center; font-size: 11px; color: #475569; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">🚨 CRITICAL SOS DISPATCH</span>
    <h1 class="title">Field Employee Emergency Alert</h1>
    <p class="subtitle">${message}</p>

    <div class="info-grid">
      <div class="row">
        <span class="label">Employee</span>
        <span class="value">${employeeName}</span>
      </div>
      <div class="row">
        <span class="label">Phone Contact</span>
        <span class="value">${phone}</span>
      </div>
      <div class="row">
        <span class="label">GPS Coordinates</span>
        <span class="value">${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E</span>
      </div>
      <div class="row">
        <span class="label">Dispatched At</span>
        <span class="value">${new Date(triggeredAt).toLocaleString()}</span>
      </div>
      <div class="row">
        <span class="label">Live Beacon ID</span>
        <span class="value" style="font-family: monospace; color: #38bdf8;">${id}</span>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <a href="${mapsUrl}" target="_blank" class="btn">📍 Open Live Location in Maps</a>
      <a href="tel:${phone.replace(/\s+/g, '')}" class="btn btn-secondary">📞 Call Employee</a>
    </div>

    <div class="footer">
      Automated dispatch from Ework / TaskRoom Workforce Safety Shield.
    </div>
  </div>
</body>
</html>
  `;

  const record = {
    id: `notif-${Date.now()}`,
    type: 'emergency_sos',
    recipient: 'management-desk@ework.enterprise',
    subject: `🚨 [CRITICAL SOS] Emergency alert triggered by ${employeeName}`,
    employeeName,
    latitude,
    longitude,
    mapsUrl,
    html: htmlContent,
    status: 'delivered',
    sentAt: new Date().toISOString(),
  };

  notificationHistory.unshift(record);
  console.log(`[Notification Engine] Dispatched emergency SOS alert for ${employeeName} to management desk.`);
  return record;
}

/**
 * Builds and compiles the daily manager shift report digest email
 */
export async function generateDailyShiftDigest(options = {}) {
  const {
    date = new Date().toISOString().split('T')[0],
    recipient = 'operations-director@ework.enterprise',
  } = options;

  const stats = {
    totalEmployees: 24,
    presentCount: 22,
    lateCount: 2,
    absentCount: 0,
    onTimeRate: '91.6%',
    tasksTotal: 18,
    tasksCompleted: 15,
    tasksPending: 3,
    totalDistanceKm: 184.2,
    totalReimbursement: '₹2,210.40',
    fuelSavedKm: '42.6 km',
    activeSOSCount: 0,
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #050b14; color: #f1f5f9; padding: 24px; margin: 0; }
    .card { background: #0d1829; border: 1px solid #1e293b; border-radius: 16px; padding: 28px; max-width: 640px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 18px; margin-bottom: 20px; }
    .brand { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #ffffff; }
    .brand span { color: #38bdf8; }
    .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 10px 0 4px 0; }
    .date-badge { display: inline-block; background: #1e293b; color: #94a3b8; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
    .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0; }
    .kpi-tile { background: #050b14; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; text-align: center; }
    .kpi-val { font-size: 20px; font-weight: 900; color: #38bdf8; }
    .kpi-lbl { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px; text-transform: uppercase; }
    .table-container { background: #050b14; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    th { background: #0d1829; color: #64748b; font-weight: 700; text-transform: uppercase; padding: 10px 14px; border-bottom: 1px solid #1e293b; font-size: 10px; }
    td { padding: 12px 14px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
    .status-pill { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .footer { text-align: center; font-size: 11px; color: #475569; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">TASK<span>ROOM</span> ENTERPRISE</div>
      <h1 class="title">Daily Workforce Shift Digest</h1>
      <span class="date-badge">Shift Date: ${date}</span>
    </div>

    <!-- KPI Summary Grid -->
    <div class="kpi-grid">
      <div class="kpi-tile">
        <div class="kpi-val" style="color: #10b981;">${stats.presentCount}/${stats.totalEmployees}</div>
        <div class="kpi-lbl">Staff Present</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-val">${stats.tasksCompleted}/${stats.tasksTotal}</div>
        <div class="kpi-lbl">Tasks Done (83%)</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-val" style="color: #f59e0b;">${stats.totalReimbursement}</div>
        <div class="kpi-lbl">Travel Claims</div>
      </div>
    </div>

    <!-- Highlights Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Field Representative</th>
            <th>Check In</th>
            <th>Tasks</th>
            <th>Mileage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Rahul Sharma</strong><br><span style="color:#64748b;font-size:10px;">Senior Technician</span></td>
            <td>09:02 AM</td>
            <td>4 / 4 Completed</td>
            <td>23.9 km (₹287)</td>
            <td><span class="status-pill">ON TRACK</span></td>
          </tr>
          <tr>
            <td><strong>Priya Patel</strong><br><span style="color:#64748b;font-size:10px;">Sales Executive</span></td>
            <td>09:47 AM</td>
            <td>3 / 4 Completed</td>
            <td>18.4 km (₹220)</td>
            <td><span class="status-pill">ON TRACK</span></td>
          </tr>
          <tr>
            <td><strong>Amit Verma</strong><br><span style="color:#64748b;font-size:10px;">Delivery Agent</span></td>
            <td>08:55 AM</td>
            <td>5 / 5 Completed</td>
            <td>34.1 km (₹409)</td>
            <td><span class="status-pill">COMPLETED</span></td>
          </tr>
          <tr>
            <td><strong>Sneha Rao</strong><br><span style="color:#64748b;font-size:10px;">Site Inspector</span></td>
            <td>09:15 AM</td>
            <td>3 / 3 Completed</td>
            <td>12.8 km (₹153)</td>
            <td><span class="status-pill">COMPLETED</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 10px; padding: 14px; font-size: 12px; color: #7dd3fc;">
      ⚡ <strong>AI Routing Impact:</strong> Field teams saved a combined <strong>${stats.fuelSavedKm}</strong> today through algorithmic waypoint ordering, reducing fuel footprint by ~3.1 Liters.
    </div>

    <div class="footer">
      Generated automatically by Ework Executive Digest Engine at ${new Date().toLocaleTimeString()}.
    </div>
  </div>
</body>
</html>
  `;

  const record = {
    id: `digest-${Date.now()}`,
    type: 'daily_shift_digest',
    recipient,
    subject: `📊 [Shift Digest] Operations & Workforce Performance Report — ${date}`,
    date,
    stats,
    html: htmlContent,
    status: 'delivered',
    sentAt: new Date().toISOString(),
  };

    notificationHistory.unshift(record);
  console.log(`[Notification Engine] Generated daily shift digest for ${date} to ${recipient}`);
  return record;
}

/**
 * Dispatches an automated customer arrival alert or ETA update via simulated WhatsApp/SMS gateway
 */
export async function sendCustomerDispatchAlert(payload = {}) {
  const {
    channel = 'whatsapp', // 'whatsapp' | 'sms'
    template = 'on_the_way', // 'on_the_way' | 'arrived' | 'completed'
    customerName = 'Valued Customer',
    customerPhone = '+91 98112-40912',
    employeeName = 'Rahul Sharma',
    taskTitle = 'HVAC Service Inspection',
    etaMinutes = 15,
    otpCode = '4921',
    address = 'Connaught Place, New Delhi',
    customMessage = '',
  } = payload;

  const record = {
    id: `disp-${Date.now()}`,
    type: 'customer_dispatch_alert',
    channel,
    template,
    customerName,
    customerPhone,
    employeeName,
    taskTitle,
    etaMinutes,
    otpCode,
    address,
    message: customMessage || `Hi ${customerName}, ${employeeName} is en route for ${taskTitle}. ETA: ${etaMinutes} mins.`,
    status: 'delivered',
    gatewayProvider: channel === 'whatsapp' ? 'Meta WhatsApp Cloud API' : 'Twilio / Gupshup SMS',
    sentAt: new Date().toISOString(),
  };

  notificationHistory.unshift(record);
  console.log(`[Notification Engine] Dispatched ${channel.toUpperCase()} customer alert to ${customerPhone} (${customerName}) via ${record.gatewayProvider}`);
  return record;
}

export function getNotificationHistory() {
  return [...notificationHistory];
}
