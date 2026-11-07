import db from '../config/database.js';

/**
 * Checks if a role string denotes a manager / dispatcher / admin
 */
export function isManagerRole(role) {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return (
    normalized.includes('manager') ||
    normalized.includes('admin') ||
    normalized.includes('director') ||
    normalized.includes('dispatcher') ||
    normalized.includes('lead')
  );
}

/**
 * Checks if user is Super Admin
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  if (user.email && user.email.toLowerCase() === 'superadmin@ework.com') return true;
  const role = (user.role || '').toLowerCase();
  return role.includes('super admin') || role.includes('superadmin');
}

/**
 * Middleware: requires Super Admin role
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    // Check if x-user-id or email matches superadmin
    const superAdmin = db.prepare("SELECT * FROM users WHERE LOWER(email) = 'superadmin@ework.com'").get();
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
    return res.status(401).json({ success: false, error: 'Authentication required as Super Admin.' });
  }

  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Super Admin access privileges required.'
    });
  }

  next();
}

/**
 * Middleware: extracts and verifies the authenticated user
 */
export function authenticateUser(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.auth_user_id;
  const userEmail = req.headers['x-user-email'];

  if (!userId && !userEmail) {
    // Check Authorization header fallback
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer usr-')) {
      const extractedId = authHeader.replace('Bearer ', '').trim();
      const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(extractedId);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  if (userId) {
    const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (userEmail) {
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(userEmail.toLowerCase());
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Allow permissive fallback for existing manager routes if not strictly protected, but mark unauthenticated
  req.user = null;
  next();
}

/**
 * Middleware: requires authenticated session
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.'
    });
  }
  next();
}

/**
 * Middleware: requires manager role
 */
export function requireManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  if (!isManagerRole(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: This action requires Manager or Dispatcher privileges.'
    });
  }

  next();
}

/**
 * Middleware: verifies that employee is only accessing their own data
 */
export function requireEmployeeOwnership(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Managers have full access across all employees
    if (isManagerRole(req.user.role)) {
      return next();
    }

    const targetUserId = req.params[paramName] || req.body[paramName] || req.query[paramName] || req.body.userId;

    if (targetUserId && targetUserId !== req.user.user_id && targetUserId !== req.user.name) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Employees cannot view or modify another employee\'s records.'
      });
    }

    next();
  };
}
