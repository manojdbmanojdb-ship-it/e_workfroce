import db from '../config/database.js';

// ==========================================
// Plan Definitions & Feature Configurations
// ==========================================
export const PLANS_CONFIG = {
  free: {
    id: 'free',
    name: 'Free Starter',
    priceINR: 0,
    priceUSD: 0,
    billingPeriod: 'forever free',
    employeeLimit: 5,
    description: 'Perfect for small crews, evaluating GPS geofencing, and testing field dispatch.',
    features: {
      live_gps: true,
      geofence_checkin: true,
      proof_of_work: true,
      task_dispatch: true,
      route_playback: false,
      advanced_reports: false,
      sos_panic_broadcast: false,
      custom_polygons: false,
      export_csv: false
    },
    highlights: [
      'Up to 5 Field Technicians',
      'Live GPS Tracking Map',
      'Geofenced Shift Punch-In (150m)',
      'Photo & Digital Signature Proof',
      'Employee & Manager Web Portals',
      'Offline-First Task Execution'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional Team',
    priceINR: 1999,
    priceUSD: 19,
    billingPeriod: 'per month',
    employeeLimit: 100,
    description: 'For growing fleets needing full route playback, automated reports, and unlimited capacity.',
    features: {
      live_gps: true,
      geofence_checkin: true,
      proof_of_work: true,
      task_dispatch: true,
      route_playback: true,
      advanced_reports: true,
      sos_panic_broadcast: true,
      custom_polygons: false,
      export_csv: true
    },
    highlights: [
      'Up to 100 Field Personnel',
      'Turn-by-Turn Route Playback & Trail',
      'Automated Mileage & Fuel Calculator',
      'Emergency SOS Panic Alert Broadcast',
      'Custom PDF Certificates & CSV Export',
      'Priority 24/7 Email & Chat Support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Scale',
    priceINR: 4999,
    priceUSD: 49,
    billingPeriod: 'per month',
    employeeLimit: 1000,
    description: 'For mission-critical operations requiring multi-hub polygons, audit certificates, and dedicated SLAs.',
    features: {
      live_gps: true,
      geofence_checkin: true,
      proof_of_work: true,
      task_dispatch: true,
      route_playback: true,
      advanced_reports: true,
      sos_panic_broadcast: true,
      custom_polygons: true,
      export_csv: true
    },
    highlights: [
      'Up to 1,000 Field Staff & Multi-Hubs',
      'Multi-Site Polygon Geofence Zones',
      'Cryptographic SHA-256 Audit Trail',
      'Full REST API & Custom Webhooks',
      'Dedicated Technical Account Manager',
      '99.98% Enterprise Uptime SLA'
    ]
  }
};

/**
 * Generate a unique license key formatted like: EWF-PRO-XXXX-XXXX
 */
function generateKey(plan = 'professional') {
  const prefix = plan === 'enterprise' ? 'EWF-ENT' : 'EWF-PRO';
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${part1}-${part2}`;
}

/**
 * 1. GET /api/subscriptions/plans
 */
export function getPlans(req, res) {
  try {
    return res.json({
      success: true,
      plans: Object.values(PLANS_CONFIG)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 2. POST /api/subscriptions/register-organization
 * Supports both Free (instant, no license) and Paid (requires valid license)
 */
export function registerOrganization(req, res) {
  try {
    const {
      orgName,
      businessEmail,
      phone,
      industry,
      orgSize,
      managerName,
      managerEmail,
      password,
      confirmPassword,
      plan = 'free',
      licenseKey
    } = req.body;

    // Basic Validation
    if (!orgName || !businessEmail || !managerName || !managerEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required organization and manager details.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.'
      });
    }

    const cleanManagerEmail = managerEmail.trim().toLowerCase();
    const cleanBusinessEmail = businessEmail.trim().toLowerCase();

    // Check if user email is already registered
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanManagerEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `An account with email "${cleanManagerEmail}" already exists. Please sign in or use a different email.`
      });
    }

    const planKey = (plan || 'free').toLowerCase();
    const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.free;
    const now = new Date().toISOString();

    let verifiedLicense = null;

    // Paid Plan License Key Verification
    if (planKey !== 'free') {
      if (!licenseKey || !licenseKey.trim()) {
        return res.status(400).json({
          success: false,
          error: `A valid license key is required for the ${planConfig.name} subscription. Please complete payment or enter your issued key.`
        });
      }

      const cleanKey = licenseKey.trim().toUpperCase();
      verifiedLicense = db.prepare('SELECT * FROM licenses WHERE UPPER(license_key) = ?').get(cleanKey);

      if (!verifiedLicense) {
        return res.status(400).json({
          success: false,
          error: `Invalid license key "${cleanKey}". Please check your purchase confirmation or purchase a subscription.`
        });
      }

      if (verifiedLicense.status === 'active' || verifiedLicense.organization_id) {
        return res.status(400).json({
          success: false,
          error: `License key "${cleanKey}" has already been activated by another organization. Each license key can only be used once.`
        });
      }

      if (verifiedLicense.status === 'revoked' || verifiedLicense.status === 'suspended') {
        return res.status(400).json({
          success: false,
          error: `License key "${cleanKey}" has been suspended or revoked. Please contact support.`
        });
      }

      if (verifiedLicense.plan.toLowerCase() !== planKey) {
        return res.status(400).json({
          success: false,
          error: `License key "${cleanKey}" is designated for the "${verifiedLicense.plan.toUpperCase()}" plan, but you selected "${planKey.toUpperCase()}".`
        });
      }
    }

    // 1. Create Organization
    const orgId = `org-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO organizations (id, name, business_email, phone, industry, org_size, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      orgId,
      orgName.trim(),
      cleanBusinessEmail,
      phone || '+91 98000-00000',
      industry || 'Field Services & Maintenance',
      orgSize || '1-10 employees',
      now
    );

    // 2. Create Initial Manager User
    const userId = `usr-mgr-${Date.now().toString(36)}`;
    const userIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    db.prepare(`
      INSERT INTO users (
        user_id, name, email, password, role, department,
        phone, avatar, badge, sign_in, sign_in_count,
        sign_in_ip, sign_in_device, sign_in_status, organization_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      managerName.trim(),
      cleanManagerEmail,
      password,
      'Operations Manager',
      'Management & Dispatch',
      phone || '+91 98000-00000',
      '👔',
      'Organization Admin',
      now,
      1,
      userIp,
      'Web Dashboard',
      'Active',
      orgId,
      now
    );

    // 3. Create Subscription Record
    const subId = `sub-${Date.now().toString(36)}`;
    const durationDays = verifiedLicense ? (verifiedLicense.duration_days || 365) : 365;
    const expiryDate = planKey === 'free'
      ? null
      : new Date(Date.now() + durationDays * 86400000).toISOString();

    db.prepare(`
      INSERT INTO subscriptions (
        id, organization_id, plan, status, employee_limit,
        license_key, features, start_date, expiry_date, created_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      orgId,
      planKey,
      planConfig.employeeLimit,
      verifiedLicense ? verifiedLicense.license_key : null,
      JSON.stringify(planConfig.features),
      now,
      expiryDate,
      now
    );

    // 4. If Paid, mark License as active
    if (verifiedLicense) {
      db.prepare(`
        UPDATE licenses 
        SET status = 'active',
            organization_id = ?,
            organization_name = ?,
            activated_at = ?,
            expires_at = ?
        WHERE id = ?
      `).run(
        orgId,
        orgName.trim(),
        now,
        expiryDate,
        verifiedLicense.id
      );
    }

    const createdUser = db.prepare('SELECT id, user_id, name, email, role, department, avatar, badge, organization_id FROM users WHERE user_id = ?').get(userId);
    const createdOrg = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId);
    const createdSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);

    return res.status(201).json({
      success: true,
      message: `Organization "${orgName}" registered successfully with ${planConfig.name} subscription!`,
      organization: createdOrg,
      subscription: {
        ...createdSub,
        features: JSON.parse(createdSub.features || '{}')
      },
      user: createdUser
    });
  } catch (err) {
    console.error('[Organization Registration Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 3. POST /api/subscriptions/payments/verify-online
 * Simulates or verifies online payment gateway (Cards, NetBanking, Razorpay/Stripe webhook)
 * Upon successful verification, automatically issues an active license key.
 */
export function verifyOnlinePayment(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      organizationName,
      plan = 'professional',
      amount,
      paymentMethod = 'online_gateway',
      gatewayTxnId
    } = req.body;

    if (!customerEmail || !organizationName) {
      return res.status(400).json({
        success: false,
        error: 'Customer email and organization name are required for payment verification.'
      });
    }

    const planKey = (plan || 'professional').toLowerCase();
    const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.professional;
    const finalAmount = amount || planConfig.priceINR;
    const now = new Date().toISOString();

    const txnId = gatewayTxnId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate unique license key for customer
    const issuedLicenseKey = generateKey(planKey);
    const licenseId = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Insert payment record
    db.prepare(`
      INSERT INTO payments (
        id, transaction_id, customer_name, customer_email, organization_name,
        plan, amount, currency, payment_method, payment_ref, status, license_key,
        verified_by, verified_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, 'completed', ?, 'online_gateway_webhook', ?, ?)
    `).run(
      paymentId,
      txnId,
      customerName || 'Customer',
      customerEmail.trim().toLowerCase(),
      organizationName.trim(),
      planKey,
      finalAmount,
      paymentMethod,
      txnId,
      issuedLicenseKey,
      now,
      now
    );

    // Insert issued license into licenses pool (available for registration)
    db.prepare(`
      INSERT INTO licenses (
        id, license_key, plan, duration_days, status,
        organization_name, payment_id, created_by, created_at
      ) VALUES (?, ?, ?, 365, 'available', ?, ?, 'payment_gateway', ?)
    `).run(
      licenseId,
      issuedLicenseKey,
      planKey,
      organizationName.trim(),
      paymentId,
      now
    );

    return res.json({
      success: true,
      message: 'Payment verified successfully! Your organization license key has been generated.',
      transactionId: txnId,
      licenseKey: issuedLicenseKey,
      plan: planKey,
      planName: planConfig.name,
      amount: finalAmount,
      paymentId: paymentId
    });
  } catch (err) {
    console.error('[Online Payment Verification Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 4. POST /api/subscriptions/payments/submit-manual-upi
 * Customer submits manual UPI payment with UTR / reference number.
 * Creates pending payment record awaiting Super Admin verification.
 */
export function submitManualUPIPayment(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      organizationName,
      plan = 'professional',
      amount,
      utrNumber,
      notes
    } = req.body;

    if (!customerEmail || !organizationName || !utrNumber) {
      return res.status(400).json({
        success: false,
        error: 'Customer email, organization name, and UPI UTR / Transaction Reference number are required.'
      });
    }

    const planKey = (plan || 'professional').toLowerCase();
    const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.professional;
    const finalAmount = amount || planConfig.priceINR;
    const now = new Date().toISOString();

    const txnId = `UPI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const paymentId = `pay-upi-${Date.now()}`;

    db.prepare(`
      INSERT INTO payments (
        id, transaction_id, customer_name, customer_email, organization_name,
        plan, amount, currency, payment_method, payment_ref, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', 'upi_manual', ?, 'pending', ?)
    `).run(
      paymentId,
      txnId,
      customerName || 'Customer',
      customerEmail.trim().toLowerCase(),
      organizationName.trim(),
      planKey,
      finalAmount,
      utrNumber.trim().toUpperCase(),
      now
    );

    return res.status(201).json({
      success: true,
      message: 'UPI payment proof submitted successfully. Super Admin verification is in progress.',
      paymentId: paymentId,
      transactionId: txnId,
      utrNumber: utrNumber.trim().toUpperCase(),
      status: 'pending'
    });
  } catch (err) {
    console.error('[Manual UPI Payment Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 5. POST /api/subscriptions/licenses/verify
 * Validates a license key before registration or upgrade
 */
export function verifyLicenseKey(req, res) {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey) {
      return res.status(400).json({ success: false, error: 'License key is required.' });
    }

    const cleanKey = licenseKey.trim().toUpperCase();
    const license = db.prepare('SELECT * FROM licenses WHERE UPPER(license_key) = ?').get(cleanKey);

    if (!license) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: `License key "${cleanKey}" was not found.`
      });
    }

    if (license.status === 'active' || license.organization_id) {
      return res.status(400).json({
        success: false,
        valid: false,
        status: license.status,
        error: `This license key has already been activated by organization "${license.organization_name || 'Another Organization'}".`
      });
    }

    if (license.status === 'revoked' || license.status === 'suspended') {
      return res.status(400).json({
        success: false,
        valid: false,
        status: license.status,
        error: `This license key is ${license.status}. Please contact E-WorkForce support.`
      });
    }

    const planConfig = PLANS_CONFIG[license.plan.toLowerCase()] || PLANS_CONFIG.professional;

    return res.json({
      success: true,
      valid: true,
      status: 'available',
      licenseKey: license.license_key,
      plan: license.plan,
      planName: planConfig.name,
      durationDays: license.duration_days,
      features: planConfig.features
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 6. POST /api/subscriptions/upgrade
 * Upgrade an existing Free organization to Professional or Enterprise
 */
export function upgradeSubscription(req, res) {
  try {
    const { organizationId, licenseKey } = req.body;
    const user = req.user;

    const orgId = organizationId || user?.organization_id;
    if (!orgId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required.' });
    }

    if (!licenseKey) {
      return res.status(400).json({ success: false, error: 'A valid paid license key is required to upgrade.' });
    }

    const cleanKey = licenseKey.trim().toUpperCase();
    const license = db.prepare('SELECT * FROM licenses WHERE UPPER(license_key) = ?').get(cleanKey);

    if (!license) {
      return res.status(404).json({ success: false, error: `License key "${cleanKey}" is invalid.` });
    }

    if (license.status === 'active' && license.organization_id !== orgId) {
      return res.status(400).json({ success: false, error: 'License key is already activated by another organization.' });
    }

    if (license.status === 'revoked' || license.status === 'suspended') {
      return res.status(400).json({ success: false, error: `License key is ${license.status}.` });
    }

    const targetPlan = license.plan.toLowerCase();
    const planConfig = PLANS_CONFIG[targetPlan] || PLANS_CONFIG.professional;
    const now = new Date().toISOString();
    const durationDays = license.duration_days || 365;
    const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();

    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found.' });
    }

    // Update existing subscription record
    let sub = db.prepare('SELECT * FROM subscriptions WHERE organization_id = ?').get(orgId);
    if (sub) {
      db.prepare(`
        UPDATE subscriptions
        SET plan = ?,
            status = 'active',
            employee_limit = ?,
            license_key = ?,
            features = ?,
            start_date = ?,
            expiry_date = ?
        WHERE id = ?
      `).run(
        targetPlan,
        planConfig.employeeLimit,
        cleanKey,
        JSON.stringify(planConfig.features),
        now,
        expiryDate,
        sub.id
      );
    } else {
      const subId = `sub-${Date.now().toString(36)}`;
      db.prepare(`
        INSERT INTO subscriptions (id, organization_id, plan, status, employee_limit, license_key, features, start_date, expiry_date, created_at)
        VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
      `).run(
        subId,
        orgId,
        targetPlan,
        planConfig.employeeLimit,
        cleanKey,
        JSON.stringify(planConfig.features),
        now,
        expiryDate,
        now
      );
    }

    // Mark license active
    db.prepare(`
      UPDATE licenses
      SET status = 'active',
          organization_id = ?,
          organization_name = ?,
          activated_at = ?,
          expires_at = ?
      WHERE id = ?
    `).run(orgId, org.name, now, expiryDate, license.id);

    const updatedSub = db.prepare('SELECT * FROM subscriptions WHERE organization_id = ?').get(orgId);

    return res.json({
      success: true,
      message: `Organization "${org.name}" successfully upgraded to ${planConfig.name}!`,
      subscription: {
        ...updatedSub,
        features: JSON.parse(updatedSub.features || '{}')
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 7. GET /api/subscriptions/organization-status/:orgId
 */
export function getOrganizationSubscriptionStatus(req, res) {
  try {
    const orgId = req.params.orgId || req.user?.organization_id;
    if (!orgId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required.' });
    }

    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found.' });
    }

    const sub = db.prepare('SELECT * FROM subscriptions WHERE organization_id = ?').get(orgId) || {
      plan: 'free',
      status: 'active',
      employee_limit: 5,
      features: JSON.stringify(PLANS_CONFIG.free.features)
    };

    // Calculate current staff count
    const staffCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE organization_id = ?').get(orgId)?.count || 0;

    const planConfig = PLANS_CONFIG[sub.plan.toLowerCase()] || PLANS_CONFIG.free;

    return res.json({
      success: true,
      organization: org,
      subscription: {
        ...sub,
        features: JSON.parse(sub.features || '{}'),
        planName: planConfig.name,
        currentEmployeeCount: staffCount,
        employeeLimit: sub.employee_limit,
        isAtLimit: staffCount >= sub.employee_limit,
        isExpired: sub.expiry_date && new Date(sub.expiry_date) < new Date(),
        isPaid: sub.plan !== 'free'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// SUPER ADMIN CONSOLE CONTROLLERS
// ==========================================

/**
 * 8. GET /api/superadmin/overview
 */
export function getSuperAdminOverview(req, res) {
  try {
    const totalOrgs = db.prepare('SELECT COUNT(*) as count FROM organizations').get().count;
    const paidOrgs = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE plan != 'free' AND status = 'active'").get().count;
    const freeOrgs = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE plan = 'free' AND status = 'active'").get().count;
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    // Revenue calculations
    const revenueRow = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'").get();
    const totalRevenue = revenueRow?.total || 1999 * paidOrgs;

    const pendingPaymentsCount = db.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'").get().count;
    const availableLicensesCount = db.prepare("SELECT COUNT(*) as count FROM licenses WHERE status = 'available'").get().count;

    return res.json({
      success: true,
      metrics: {
        totalOrganizations: totalOrgs,
        paidOrganizations: paidOrgs,
        freeOrganizations: freeOrgs,
        totalEmployees: totalStaff,
        totalRevenueINR: totalRevenue,
        pendingPayments: pendingPaymentsCount,
        availableLicenses: availableLicensesCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 9. GET /api/superadmin/organizations
 */
export function getSuperAdminOrganizations(req, res) {
  try {
    const orgs = db.prepare(`
      SELECT o.*, s.plan, s.status as sub_status, s.employee_limit, s.license_key, s.expiry_date
      FROM organizations o
      LEFT JOIN subscriptions s ON o.id = s.organization_id
      ORDER BY o.created_at DESC
    `).all();

    // Attach staff count for each org
    const orgsWithCounts = orgs.map(org => {
      const staffCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE organization_id = ?').get(org.id)?.count || 0;
      return {
        ...org,
        current_staff: staffCount,
        plan_name: PLANS_CONFIG[org.plan?.toLowerCase()]?.name || 'Free Starter'
      };
    });

    return res.json({ success: true, organizations: orgsWithCounts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 10. GET /api/superadmin/licenses
 */
export function getSuperAdminLicenses(req, res) {
  try {
    const licenses = db.prepare('SELECT * FROM licenses ORDER BY created_at DESC').all();
    return res.json({ success: true, licenses });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 11. POST /api/superadmin/licenses/generate
 */
export function generateLicenseKeySuperAdmin(req, res) {
  try {
    const { plan = 'professional', durationDays = 365, organizationName } = req.body;
    const planKey = (plan || 'professional').toLowerCase();

    const licenseKey = generateKey(planKey);
    const licenseId = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO licenses (
        id, license_key, plan, duration_days, status,
        organization_name, created_by, created_at
      ) VALUES (?, ?, ?, ?, 'available', ?, 'superadmin_console', ?)
    `).run(
      licenseId,
      licenseKey,
      planKey,
      parseInt(durationDays) || 365,
      organizationName || null,
      now
    );

    const created = db.prepare('SELECT * FROM licenses WHERE id = ?').get(licenseId);
    return res.status(201).json({
      success: true,
      message: `New ${planKey.toUpperCase()} license key generated successfully.`,
      license: created
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 12. PATCH /api/superadmin/licenses/:id/status
 */
export function updateLicenseStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'available', 'active', 'suspended', 'revoked'

    if (!['available', 'active', 'suspended', 'revoked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid license status.' });
    }

    db.prepare('UPDATE licenses SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM licenses WHERE id = ?').get(id);

    // If revoked or suspended, also update matching subscription status
    if (updated?.organization_id && (status === 'suspended' || status === 'revoked')) {
      db.prepare('UPDATE subscriptions SET status = ? WHERE organization_id = ?').run(status, updated.organization_id);
    }

    return res.json({ success: true, license: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 13. GET /api/superadmin/payments
 */
export function getSuperAdminPayments(req, res) {
  try {
    const payments = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
    return res.json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 14. POST /api/superadmin/payments/:id/verify
 * Super Admin verifies & approves manual UPI payment, or rejects it.
 */
export function verifyManualPaymentSuperAdmin(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found.' });
    }

    const now = new Date().toISOString();

    if (action === 'reject') {
      db.prepare(`
        UPDATE payments 
        SET status = 'failed', verified_by = 'superadmin', verified_at = ?
        WHERE id = ?
      `).run(now, id);

      return res.json({ success: true, message: 'Payment rejected.' });
    }

    // Approve: generate license key for the customer
    const issuedKey = generateKey(payment.plan);
    const licId = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Create license
    db.prepare(`
      INSERT INTO licenses (
        id, license_key, plan, duration_days, status,
        organization_name, payment_id, created_by, created_at
      ) VALUES (?, ?, ?, 365, 'available', ?, ?, 'superadmin_verified_upi', ?)
    `).run(
      licId,
      issuedKey,
      payment.plan,
      payment.organization_name,
      payment.id,
      now
    );

    // Update payment record
    db.prepare(`
      UPDATE payments 
      SET status = 'completed', license_key = ?, verified_by = 'superadmin', verified_at = ?
      WHERE id = ?
    `).run(issuedKey, now, id);

    const updatedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: `Manual UPI payment verified! License key "${issuedKey}" issued for organization "${payment.organization_name}".`,
      payment: updatedPayment,
      licenseKey: issuedKey
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 15. PATCH /api/superadmin/subscriptions/:orgId
 * Modify limits, extend expiry, upgrade/downgrade subscription
 */
export function updateSubscriptionSuperAdmin(req, res) {
  try {
    const { orgId } = req.params;
    const { plan, status, employeeLimit, extendDays } = req.body;

    const sub = db.prepare('SELECT * FROM subscriptions WHERE organization_id = ?').get(orgId);
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Subscription not found for this organization.' });
    }

    let newPlan = plan || sub.plan;
    let newStatus = status || sub.status;
    let newLimit = employeeLimit !== undefined ? parseInt(employeeLimit) : sub.employee_limit;

    let newExpiry = sub.expiry_date;
    if (extendDays) {
      const baseDate = sub.expiry_date && new Date(sub.expiry_date) > new Date()
        ? new Date(sub.expiry_date)
        : new Date();
      newExpiry = new Date(baseDate.getTime() + parseInt(extendDays) * 86400000).toISOString();
    }

    const planConfig = PLANS_CONFIG[newPlan.toLowerCase()] || PLANS_CONFIG.free;

    db.prepare(`
      UPDATE subscriptions
      SET plan = ?,
          status = ?,
          employee_limit = ?,
          features = ?,
          expiry_date = ?
      WHERE id = ?
    `).run(
      newPlan,
      newStatus,
      newLimit,
      JSON.stringify(planConfig.features),
      newExpiry,
      sub.id
    );

    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(sub.id);

    return res.json({
      success: true,
      message: 'Subscription updated successfully.',
      subscription: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
