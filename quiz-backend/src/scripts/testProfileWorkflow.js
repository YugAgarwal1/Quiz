const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- STARTING PROFILE & SEMESTER CHANGE REQUEST TEST ---');

  // 1. Login as Student
  const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@quizbird.com', password: 'Student@123456' })
  });
  const studentLoginData = await studentLoginRes.json();
  if (!studentLoginData.success) throw new Error('Student login failed: ' + studentLoginData.message);
  console.log('✔ Student logged in:', studentLoginData.user.name, 'Enrolled in Sem ID:', studentLoginData.user.semester_id);
  const studentToken = studentLoginData.token;

  // 2. Update Student Profile (Avatar + Name + College)
  const testAvatarBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const updateRes = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      name: 'Yug Student Test',
      college: 'Studylink Academy',
      avatar: testAvatarBase64
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success) throw new Error('Profile update failed: ' + updateData.message);
  console.log('✔ Student profile updated:', updateData.user.name, 'Avatar saved len:', updateData.user.avatar?.length);

  // 3. Submit or fetch Semester Change Request
  let createdRequestId;
  const myReqsRes = await fetch(`${API_BASE}/auth/semester-requests`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const myReqsData = await myReqsRes.json();
  const existingPending = myReqsData.requests?.find(r => r.status === 'pending');

  if (existingPending) {
    createdRequestId = existingPending.id;
    console.log('✔ Found existing pending request ID:', createdRequestId);
  } else {
    const reqRes = await fetch(`${API_BASE}/auth/semester-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        requested_semester_id: 2,
        reason: 'Promoted to Semester VII - New batch'
      })
    });
    const reqData = await reqRes.json();
    if (!reqData.success) throw new Error('Semester request failed: ' + reqData.message);
    console.log('✔ Semester transfer request submitted. Request ID:', reqData.request?.id);
    createdRequestId = reqData.request.id;
  }

  // 4. Login as Admin
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@quizbird.com', password: 'Admin@123456' })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success) throw new Error('Admin login failed: ' + adminLoginData.message);
  console.log('✔ Admin logged in:', adminLoginData.user.name);
  const adminToken = adminLoginData.token;

  // 5. Admin lists semester requests
  const listReqRes = await fetch(`${API_BASE}/admin/semester-requests?status=pending`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listReqData = await listReqRes.json();
  console.log('listReqData:', listReqData);
  if (!listReqData.success) throw new Error('Failed to get requests: ' + listReqData.message);
  console.log(`✔ Admin retrieved ${listReqData.requests?.length} pending request(s)`);

  // 6. Admin approves the request
  const approveRes = await fetch(`${API_BASE}/admin/semester-requests/${createdRequestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'approved',
      admin_comment: 'Approved for Semester VII entry.'
    })
  });
  const approveData = await approveRes.json();
  if (!approveData.success) throw new Error('Approval failed: ' + approveData.message);
  console.log('✔ Admin approved request. Message:', approveData.message);

  // 7. Re-fetch student profile and verify semester was updated to 2 (Sem VII)
  const studentMeRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const studentMeData = await studentMeRes.json();
  console.log('✔ Verified updated student details:');
  console.log('   - Name:', studentMeData.user.name);
  console.log('   - Semester ID:', studentMeData.user.semester_id);
  console.log('   - Semester Name:', studentMeData.user.semester_name);
  console.log('   - Has Avatar:', Boolean(studentMeData.user.avatar));

  if (studentMeData.user.semester_id === 2) {
    console.log('🎉 ALL PROFILE & SEMESTER CHANGE TESTS PASSED SUCCESSFULLY!');
  } else {
    throw new Error(`Expected semester_id to be 2, but got ${studentMeData.user.semester_id}`);
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
