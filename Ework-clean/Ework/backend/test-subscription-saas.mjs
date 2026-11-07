// Comprehensive Verification Suite for Freemium & Paid Subscription SaaS Architecture
import db from './src/config/database.js';
import { PLANS_CONFIG } from './src/controllers/subscriptionController.js';

const API_BASE = 'http://localhost:5000/api';

async function runSaaSTests() {
  console.log('===============================================================');
  console.log('🚀 Running E-WorkForce Freemium + Paid Subscription Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Subscription Plans API
    console.log('--- Step 1: Verify Subscription Plans ---');
    const plansRes = await fetch(`${API_BASE}/subscriptions/plans`);
    const plansData = await plansRes.json();
    assert(plansData.success && plansData.plans.length === 3, '1. GET /subscriptions/plans returns 3 tiers (Free, Professional, Enterprise)');
    assert(plansData.plans.find(p => p.id === 'free')?.employeeLimit === 5, '1a. Free plan correctly enforces 5 employee limit');

    // 2. Free Organization Registration
    console.log('\n--- Step 2: Register Free Organization ---');
    const testFreeOrgEmail = `free.org.${Date.now()}@test.com`;
    const testFreeMgrEmail = `mgr.free.${Date.now()}@test.com`;
    const freeRegRes = await fetch(`${API_BASE}/subscriptions/register-organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: 'Alpha Free Tech Solutions',
        businessEmail: testFreeOrgEmail,
        phone: '+91 98111-22334',
        industry: 'Field Telemetry & IT',
        orgSize: '1-10 employees',
        managerName: 'Arun Kumar',
        managerEmail: testFreeMgrEmail,
        password: 'Workforce@2026',
        confirmPassword: 'Workforce@2026',
        plan: 'free'
      })
    });
    const freeRegData = await freeRegRes.json();
    assert(freeRegData.success && freeRegData.organization?.id, '2. Free organization registers immediately without license key');
    assert(freeRegData.subscription?.plan === 'free' && freeRegData.subscription?.employee_limit === 5, '2a. Free subscription record created with 5 employee limit');
    const freeOrgId = freeRegData.organization.id;
    const freeMgrId = freeRegData.user.user_id;

    // 3. Test Free Plan Employee Limit (Adding 5 employees should pass, 6th must fail)
    console.log('\n--- Step 3: Test Free Plan Employee Limits ---');
    for (let i = 1; i <= 4; i++) {
      const empRes = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': freeMgrId },
        body: JSON.stringify({
          name: `Free Worker ${i}`,
          email: `free.emp.${i}.${Date.now()}@test.com`,
          password: 'Workforce@2026',
          role: 'Field Technician',
          organization_id: freeOrgId
        })
      });
      const empData = await empRes.json();
      assert(empData.success, `3.${i}. Added employee #${i + 1} within Free plan limit`);
    }

    // Now attempt to add 6th staff member (exceeding limit of 5)
    const overLimitRes = await fetch(`${API_BASE}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': freeMgrId },
      body: JSON.stringify({
        name: 'Over Limit Worker',
        email: `overlimit.${Date.now()}@test.com`,
        password: 'Workforce@2026',
        role: 'Field Technician',
        organization_id: freeOrgId
      })
    });
    const overLimitData = await overLimitRes.json();
    assert(overLimitRes.status === 403 && overLimitData.error?.includes('limit reached'), '3.5. Backend blocks 6th employee on Free plan with 403 limit warning');

    // 4. Paid Registration without License Key (Must fail)
    console.log('\n--- Step 4: Paid Registration Validation (Missing & Invalid Keys) ---');
    const noKeyRes = await fetch(`${API_BASE}/subscriptions/register-organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: 'Pro Fleet Services',
        businessEmail: `pro.${Date.now()}@test.com`,
        managerName: 'Pooja Verma',
        managerEmail: `pooja.${Date.now()}@test.com`,
        password: 'Workforce@2026',
        plan: 'professional',
        licenseKey: ''
      })
    });
    const noKeyData = await noKeyRes.json();
    assert(noKeyRes.status === 400 && noKeyData.error?.includes('license key is required'), '4. Paid registration without license key is rejected');

    // Invalid Key test
    const invalidKeyRes = await fetch(`${API_BASE}/subscriptions/register-organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: 'Pro Fleet Services',
        businessEmail: `pro.${Date.now()}@test.com`,
        managerName: 'Pooja Verma',
        managerEmail: `pooja.${Date.now()}@test.com`,
        password: 'Workforce@2026',
        plan: 'professional',
        licenseKey: 'EWF-FAKE-KEY-9999'
      })
    });
    assert(invalidKeyRes.status === 400, '4a. Invalid license key is rejected');

    // 5. Online Payment Gateway Verification & Automatic License Generation
    console.log('\n--- Step 5: Online Payment Verification & License Generation ---');
    const onlinePayRes = await fetch(`${API_BASE}/subscriptions/payments/verify-online`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Pooja Verma',
        customerEmail: 'pooja.pro@profleet.com',
        organizationName: 'Pro Fleet Global Ltd',
        plan: 'professional',
        amount: 1999,
        paymentMethod: 'card_online'
      })
    });
    const onlinePayData = await onlinePayRes.json();
    assert(onlinePayData.success && onlinePayData.licenseKey?.startsWith('EWF-PRO-'), '5. Online payment verified and unique EWF-PRO license issued');
    const issuedProKey = onlinePayData.licenseKey;

    // 6. Paid Organization Registration with Issued License Key
    console.log('\n--- Step 6: Paid Organization Registration with License Key ---');
    const proRegRes = await fetch(`${API_BASE}/subscriptions/register-organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: 'Pro Fleet Global Ltd',
        businessEmail: `pro.fleet.${Date.now()}@profleet.com`,
        phone: '+91 99887-11223',
        industry: 'Logistics & Fleet Dispatch',
        orgSize: '11-50 employees',
        managerName: 'Pooja Verma',
        managerEmail: `pooja.mgr.${Date.now()}@profleet.com`,
        password: 'Workforce@2026',
        confirmPassword: 'Workforce@2026',
        plan: 'professional',
        licenseKey: issuedProKey
      })
    });
    const proRegData = await proRegRes.json();
    assert(proRegData.success && proRegData.subscription?.plan === 'professional' && proRegData.subscription?.employee_limit === 100, '6. Paid organization successfully registered and activated with 100 capacity');

    // 7. Prevent Duplicate Activation of Same License Key
    console.log('\n--- Step 7: Duplicate License Key Activation Check ---');
    const duplicateLicRes = await fetch(`${API_BASE}/subscriptions/register-organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: 'Imposter Org Ltd',
        businessEmail: `imposter.${Date.now()}@test.com`,
        managerName: 'Bad Actor',
        managerEmail: `badactor.${Date.now()}@test.com`,
        password: 'Workforce@2026',
        plan: 'professional',
        licenseKey: issuedProKey
      })
    });
    const duplicateData = await duplicateLicRes.json();
    assert(duplicateLicRes.status === 400 && duplicateData.error?.includes('already been activated'), '7. Re-use of activated license key is blocked');

    // 8. Manual UPI Payment Flow & Super Admin Verification
    console.log('\n--- Step 8: Manual UPI Payment Submission & Super Admin Approval ---');
    const upiSubmitRes = await fetch(`${API_BASE}/subscriptions/payments/submit-manual-upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Vivek Oberoi',
        customerEmail: 'vivek@hvacindia.com',
        organizationName: 'HVAC India Enterprises',
        plan: 'enterprise',
        amount: 4999,
        utrNumber: `UTR${Date.now().toString().slice(-8)}`
      })
    });
    const upiData = await upiSubmitRes.json();
    assert(upiData.success && upiData.status === 'pending', '8. Manual UPI payment submitted with UTR proof (pending verification)');
    const pendingPaymentId = upiData.paymentId;

    // Super Admin Approves Manual Payment
    const approvePayRes = await fetch(`${API_BASE}/superadmin/payments/${pendingPaymentId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'superadmin@ework.com'
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const approvePayData = await approvePayRes.json();
    assert(approvePayData.success && approvePayData.licenseKey?.startsWith('EWF-ENT-'), '8a. Super Admin verified UPI payment and issued EWF-ENT license key');
    const issuedEntKey = approvePayData.licenseKey;

    // 9. Free-to-Paid In-Place Upgrade
    console.log('\n--- Step 9: Free-to-Paid Upgrade ---');
    const upgradeRes = await fetch(`${API_BASE}/subscriptions/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': freeMgrId
      },
      body: JSON.stringify({
        organizationId: freeOrgId,
        licenseKey: issuedEntKey
      })
    });
    const upgradeData = await upgradeRes.json();
    assert(upgradeData.success && upgradeData.subscription?.plan === 'enterprise' && upgradeData.subscription?.employee_limit === 1000, '9. Free organization seamlessly upgraded to Enterprise without account duplication');

    // Verify employee can now be added to former free organization
    const afterUpgradeEmpRes = await fetch(`${API_BASE}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': freeMgrId },
      body: JSON.stringify({
        name: 'Enterprise Worker Post-Upgrade',
        email: `ent.postup.${Date.now()}@test.com`,
        password: 'Workforce@2026',
        role: 'Field Engineer',
        organization_id: freeOrgId
      })
    });
    const afterUpgradeData = await afterUpgradeEmpRes.json();
    assert(afterUpgradeData.success, '9a. Staff addition unlocked after upgrading to Enterprise');

    // 10. Super Admin Dashboard Metrics
    console.log('\n--- Step 10: Super Admin Console Endpoints ---');
    const saOverviewRes = await fetch(`${API_BASE}/superadmin/overview`, {
      headers: { 'x-user-email': 'superadmin@ework.com' }
    });
    const saOverviewData = await saOverviewRes.json();
    assert(saOverviewData.success && saOverviewData.metrics?.totalOrganizations > 0, '10. Super Admin overview reports organizations and revenue statistics');

    console.log('\n===============================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Fatal Test Error:', err);
  }
}

runSaaSTests();
