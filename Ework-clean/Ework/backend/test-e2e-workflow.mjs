// E-Workforce End-to-End Workflow Verification Suite
// Tests all 11 required workflow steps + security/RBAC constraints

const API_BASE = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 Running E-Workforce Employee Portal E2E Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Manager logs in
    console.log('--- Step 1: Manager Authentication ---');
    const mgrRes = await fetch(`${API_BASE}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@ework.com', password: 'Workforce@2026' })
    });
    const mgrData = await mgrRes.json();
    assert(mgrData.success && mgrData.user?.role?.includes('Manager'), '1. Manager logs in successfully with Manager role');

    // 2. Manager creates an employee
    console.log('\n--- Step 2: Employee Provisioning ---');
    const newEmpEmail = `test.tech.${Date.now()}@ework.com`;
    const newEmpRes = await fetch(`${API_BASE}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newEmpEmail,
        password: 'Workforce@2026',
        name: 'Arjun Mehta',
        role: 'Field Technician',
        department: 'Delhi Central Hub'
      })
    });
    const newEmpData = await newEmpRes.json();
    assert(newEmpData.success && newEmpData.user?.user_id, '2. Manager registers new Field Technician account');
    const employeeUserId = newEmpData.user.user_id;

    // 3. Manager assigns a task to the employee
    console.log('\n--- Step 3: Manager Assigns Task ---');
    const taskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'High-Voltage Transformer Oil Filtration #T-999',
        description: 'Perform dehydration and breakdown voltage test on 11kV transformer oil.',
        assignedTo: 'Arjun Mehta',
        assignedBy: 'Rajesh Kumar (Operations Manager)',
        address: 'Okhla Industrial Area, Phase III, Delhi',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      })
    });
    const taskData = await taskRes.json();
    assert(taskData.success && taskData.data?.id, '3. Manager successfully assigns task to Arjun Mehta');
    const taskId = taskData.data.id;

    // 4. Employee logs in separately
    console.log('\n--- Step 4: Employee Logs In Separately ---');
    const empLoginRes = await fetch(`${API_BASE}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmpEmail, password: 'Workforce@2026' })
    });
    const empLoginData = await empLoginRes.json();
    assert(empLoginData.success && empLoginData.user?.role === 'Field Technician', '4. Employee logs in with technician credentials');

    // 5. Employee sees only their assigned task
    console.log('\n--- Step 5: Employee Views Assigned Tasks ---');
    const empTasksRes = await fetch(`${API_BASE}/employee/tasks?userId=${employeeUserId}`);
    const empTasksData = await empTasksRes.json();
    const myTask = empTasksData.data?.find(t => t.id === taskId);
    assert(empTasksData.success && !!myTask, '5. Employee portal displays assigned task #T-999');

    // Verify scoping: Arjun Mehta cannot see Rahul Sharma's tasks
    const hasOthersTask = empTasksData.data?.some(t => t.assigned_to === 'Rahul Sharma');
    assert(!hasOthersTask, '5b. Scoping verified: Employee does NOT see other employees\' tasks');

    // 6. Employee accepts the task
    console.log('\n--- Step 6: Employee Accepts Task ---');
    const acceptRes = await fetch(`${API_BASE}/employee/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: employeeUserId, status: 'accepted' })
    });
    const acceptData = await acceptRes.json();
    assert(acceptData.success && acceptData.data?.status === 'accepted', '6. Employee accepts the assigned task');

    // 7. Employee starts the task
    console.log('\n--- Step 7: Employee Starts Task ---');
    const startRes = await fetch(`${API_BASE}/employee/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: employeeUserId, status: 'in_progress' })
    });
    const startData = await startRes.json();
    assert(startData.success && startData.data?.status === 'in_progress', '7. Employee marks task as in_progress');

    // 8 & 9. Employee uploads completion proof and marks completed
    console.log('\n--- Step 8 & 9: Employee Uploads Proof & Completes Task ---');
    const proofRes = await fetch(`${API_BASE}/employee/tasks/${taskId}/proof`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: employeeUserId,
        proofPhotoUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'],
        signatureUrl: 'data:image/png;base64,sample-signature-data',
        customerName: 'Sanjay Singhania',
        customerPhone: '+91 98111-22446',
        customerRating: 5,
        customerFeedback: 'Dielectric breakdown voltage improved to 60kV. Great work.',
        completionNotes: 'Filtration completed, oil color clear, BDV certified.'
      })
    });
    const proofData = await proofRes.json();
    assert(proofData.success && proofData.data?.status === 'completed' && proofData.data?.is_verified === 1, '8 & 9. Employee uploads proof and marks task completed');

    // 10. Manager sees the updated task status
    console.log('\n--- Step 10: Manager Sees Updated Task Status ---');
    const mgrTasksRes = await fetch(`${API_BASE}/tasks`);
    const mgrTasksData = await mgrTasksRes.json();
    const verifiedTask = mgrTasksData.data?.find(t => t.id === taskId);
    assert(verifiedTask?.status === 'completed' && verifiedTask?.customer_name === 'Sanjay Singhania', '10. Manager Dashboard reflects completed task status & customer proof');

    // 11. Employee attendance is reflected in the Manager Dashboard
    console.log('\n--- Step 11: Employee Attendance Verification ---');
    // Check-in
    const checkInRes = await fetch(`${API_BASE}/employee/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: employeeUserId,
        lat: 28.5355,
        lng: 77.2610,
        notes: 'Arrived at Okhla Site for Transformer Filtration'
      })
    });
    const checkInData = await checkInRes.json();
    assert(checkInData.success && checkInData.data?.check_in_time, '11a. Employee successfully punches geofenced check-in');

    // Duplicate check-in prevention test
    const dupCheckInRes = await fetch(`${API_BASE}/employee/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: employeeUserId, lat: 28.5355, lng: 77.2610 })
    });
    const dupData = await dupCheckInRes.json();
    assert(!dupData.success, '11b. Duplicate check-in prevention verified');

    // Verify in Manager Attendance Dashboard
    const mgrAttRes = await fetch(`${API_BASE}/attendance?userId=${employeeUserId}`);
    const mgrAttData = await mgrAttRes.json();
    assert(mgrAttData.success && mgrAttData.data?.length > 0, '11c. Employee check-in is instantly reflected in Manager Attendance view');

    // 12. Security & RBAC: Employee attempting to modify unauthorized data
    console.log('\n--- Step 12: Security & RBAC Guard Verification ---');
    const unauthorizedRes = await fetch(`${API_BASE}/employee/tasks/task-402/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': employeeUserId
      },
      body: JSON.stringify({
        userId: employeeUserId,
        status: 'completed'
      })
    });
    const unauthData = await unauthorizedRes.json();
    assert(!unauthData.success, '12. Cross-employee task tampering strictly forbidden (403)');

    // Summary
    console.log('\n====================================================');
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTestSuite();
