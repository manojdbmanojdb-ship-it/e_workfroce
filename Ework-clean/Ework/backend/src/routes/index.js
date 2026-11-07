import express from 'express';
import { checkIn, checkOut, getAttendance } from '../controllers/attendanceController.js';
import { getTasks, createTask, updateTaskStatus, submitProofOfWork, deleteTask } from '../controllers/taskController.js';
import { triggerSOS, resolveSOS, getSOSAlerts } from '../controllers/sosController.js';
import { submitExpense, reviewExpense, getExpenses } from '../controllers/expenseController.js';
import { getAssets, getAssetByCode, assignAsset, createAsset } from '../controllers/assetController.js';
import { sendMessage, getMessages } from '../controllers/chatController.js';
import { getShifts, createShift } from '../controllers/shiftController.js';
import { optimizeCustomRoute, getDailyRoutePreview, dispatchRoute } from '../controllers/routeController.js';
import { triggerDailyDigest, getNotifications, triggerSosTest, triggerCustomerDispatchAlert } from '../controllers/notificationController.js';
import { getGeofencePolygons, createGeofencePolygon, verifyPointInPolygon } from '../controllers/geofenceController.js';
import { signIn, signUp, getUsers, getUser, getSignInLogs, getDatabaseSchema, getSupabaseSignIns } from '../controllers/authController.js';
import {
  getEmployeeDashboardSummary,
  getEmployeeTasks,
  updateEmployeeTaskStatus,
  submitEmployeeTaskProof,
  addEmployeeTaskNote,
  getEmployeeAttendance,
  employeeCheckIn,
  employeeCheckOut,
  employeeBreakToggle,
  getEmployeePerformance,
  getEmployeeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getEmployeeMessages,
  sendEmployeeMessage,
  getEmployeeProfile,
  updateEmployeeProfile,
  applyEmployeeLeave,
  getEmployeeLeaves
} from '../controllers/employeeController.js';
import {
  getPlans,
  registerOrganization,
  verifyOnlinePayment,
  submitManualUPIPayment,
  verifyLicenseKey,
  upgradeSubscription,
  getOrganizationSubscriptionStatus,
  getSuperAdminOverview,
  getSuperAdminOrganizations,
  getSuperAdminLicenses,
  generateLicenseKeySuperAdmin,
  updateLicenseStatus,
  getSuperAdminPayments,
  verifyManualPaymentSuperAdmin,
  updateSubscriptionSuperAdmin
} from '../controllers/subscriptionController.js';
import { authenticateUser, requireManager, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Global auth context extractor
router.use(authenticateUser);

// Health
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ==========================================
// 1. DEDICATED EMPLOYEE PORTAL API ENDPOINTS
// ==========================================
router.get('/employee/dashboard-summary', getEmployeeDashboardSummary);
router.get('/employee/tasks', getEmployeeTasks);
router.patch('/employee/tasks/:id/status', updateEmployeeTaskStatus);
router.patch('/employee/tasks/:id/proof', submitEmployeeTaskProof);
router.post('/employee/tasks/:id/notes', addEmployeeTaskNote);
router.get('/employee/attendance', getEmployeeAttendance);
router.post('/employee/attendance/check-in', employeeCheckIn);
router.post('/employee/attendance/check-out', employeeCheckOut);
router.post('/employee/attendance/break', employeeBreakToggle);
router.get('/employee/performance', getEmployeePerformance);
router.get('/employee/notifications', getEmployeeNotifications);
router.patch('/employee/notifications/:id/read', markNotificationRead);
router.post('/employee/notifications/mark-all-read', markAllNotificationsRead);
router.get('/employee/messages', getEmployeeMessages);
router.post('/employee/messages', sendEmployeeMessage);
router.get('/employee/profile', getEmployeeProfile);
router.patch('/employee/profile', updateEmployeeProfile);
router.post('/employee/leave-apply', applyEmployeeLeave);
router.get('/employee/leaves', getEmployeeLeaves);

// ==========================================
// 2. MANAGER & SHARED CORE API ENDPOINTS
// ==========================================

// Attendance (Shared)
router.post('/attendance/check-in', checkIn);
router.patch('/attendance/check-out/:id', checkOut);
router.get('/attendance', getAttendance);

// Tasks (Shared & Manager Dispatch)
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id/status', updateTaskStatus);
router.patch('/tasks/:id/proof', submitProofOfWork);
router.delete('/tasks/:id', deleteTask);

// SOS
router.post('/sos/trigger', triggerSOS);
router.patch('/sos/:id/resolve', resolveSOS);
router.get('/sos', getSOSAlerts);

// Expenses
router.post('/expenses', submitExpense);
router.patch('/expenses/:id/review', reviewExpense);
router.get('/expenses', getExpenses);

// Assets
router.get('/assets', getAssets);
router.get('/assets/scan/:code', getAssetByCode);
router.post('/assets', createAsset);
router.patch('/assets/:id/assign', assignAsset);

// Chat
router.post('/chat/messages', sendMessage);
router.get('/chat/messages', getMessages);

// Shifts
router.get('/shifts', getShifts);
router.post('/shifts', createShift);

// Route Optimization & Fuel Calculator
router.post('/routes/optimize', optimizeCustomRoute);
router.get('/routes/daily-preview', getDailyRoutePreview);
router.post('/routes/dispatch', dispatchRoute);

// Notifications & Automated Email Digests
router.post('/notifications/customer-dispatch', triggerCustomerDispatchAlert);
router.post('/notifications/daily-digest', triggerDailyDigest);
router.get('/notifications/history', getNotifications);
router.post('/notifications/sos-test', triggerSosTest);

// Multi-Site Geofence Polygons & Verification
router.get('/geofences/polygons', getGeofencePolygons);
router.post('/geofences/polygons', createGeofencePolygon);
router.post('/geofences/verify-polygon', verifyPointInPolygon);

// Authentication & SQLite Database Sign-In
router.post('/auth/sign-in', signIn);
router.post('/auth/sign-up', signUp);
router.get('/auth/users', getUsers);
router.get('/auth/user/:identifier', getUser);
router.get('/auth/sign-in-logs', getSignInLogs);
router.get('/auth/schema', getDatabaseSchema);
router.get('/auth/supabase-sign-ins', getSupabaseSignIns);

// ==========================================
// 3. SAAS SUBSCRIPTIONS & LICENSE MANAGEMENT
// ==========================================
router.get('/subscriptions/plans', getPlans);
router.post('/subscriptions/register-organization', registerOrganization);
router.post('/subscriptions/payments/verify-online', verifyOnlinePayment);
router.post('/subscriptions/payments/submit-manual-upi', submitManualUPIPayment);
router.post('/subscriptions/licenses/verify', verifyLicenseKey);
router.post('/subscriptions/upgrade', upgradeSubscription);
router.get('/subscriptions/organization-status', getOrganizationSubscriptionStatus);
router.get('/subscriptions/organization-status/:orgId', getOrganizationSubscriptionStatus);

// ==========================================
// 4. SUPER ADMIN MANAGEMENT CONSOLE
// ==========================================
router.get('/superadmin/overview', requireSuperAdmin, getSuperAdminOverview);
router.get('/superadmin/organizations', requireSuperAdmin, getSuperAdminOrganizations);
router.get('/superadmin/licenses', requireSuperAdmin, getSuperAdminLicenses);
router.post('/superadmin/licenses/generate', requireSuperAdmin, generateLicenseKeySuperAdmin);
router.patch('/superadmin/licenses/:id/status', requireSuperAdmin, updateLicenseStatus);
router.get('/superadmin/payments', requireSuperAdmin, getSuperAdminPayments);
router.post('/superadmin/payments/:id/verify', requireSuperAdmin, verifyManualPaymentSuperAdmin);
router.patch('/superadmin/subscriptions/:orgId', requireSuperAdmin, updateSubscriptionSuperAdmin);

export default router;
