import { generateDailyShiftDigest, sendEmergencySosAlert, getNotificationHistory, sendCustomerDispatchAlert } from '../services/notificationService.js';

/**
 * POST /api/notifications/customer-dispatch
 * Dispatches an automated WhatsApp / SMS customer arrival alert, ETA, or completion receipt
 */
export async function triggerCustomerDispatchAlert(req, res) {
  try {
    const alert = await sendCustomerDispatchAlert(req.body);
    res.json({ success: true, message: 'Customer notification dispatched successfully!', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/notifications/daily-digest
 * Trigger and compile the daily management email digest
 */
export async function triggerDailyDigest(req, res) {
  try {
    const { date, recipient } = req.body || {};
    const digest = await generateDailyShiftDigest({ date, recipient });
    res.json({ success: true, message: 'Daily shift digest compiled and dispatched successfully!', data: digest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/notifications/history
 * Fetch audit logs of all outgoing email dispatches and SOS webhooks
 */
export async function getNotifications(req, res) {
  try {
    const history = getNotificationHistory();
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/notifications/sos-test
 * Trigger a simulated SOS alert with custom coordinates
 */
export async function triggerSosTest(req, res) {
  try {
    const { employeeName, latitude, longitude, message } = req.body || {};
    const alert = await sendEmergencySosAlert({
      employeeName: employeeName || 'Rahul Sharma',
      latitude: latitude || 28.6315,
      longitude: longitude || 77.2167,
      message: message || 'EMERGENCY TEST: Verification of manager dispatch pipeline',
    });
    res.json({ success: true, message: 'Test emergency notification dispatched!', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
