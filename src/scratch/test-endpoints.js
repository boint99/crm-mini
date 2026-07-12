import { environments } from '../configs/env.config.js'

const API_URL = `http://localhost:${environments.API_PORT || 8017}/api`

async function testAuthEndpoints() {
  console.log('--- STARTING AUTH ENDPOINT TESTS ---')
  
  // 1. Login to get token
  console.log('Logging in...')
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@crm.com', password: 'It@12345' })
  })
  
  if (!loginRes.ok) {
    throw new Error(`Failed to login: ${loginRes.status}`)
  }
  
  const loginData = await loginRes.json()
  const token = loginData.data.accessToken
  console.log('✅ Login succeeded! Token retrieved.')

  // 2. Test Get Profile
  console.log('Testing GET /auth/profile...')
  const profileRes = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (profileRes.status === 404) {
    console.log('❌ GET /auth/profile returned 404 as expected (Not implemented yet).')
  } else if (!profileRes.ok) {
    throw new Error(`GET /auth/profile failed: ${profileRes.status}`)
  } else {
    const profileData = await profileRes.json()
    console.log('✅ GET /auth/profile succeeded! Profile data:', profileData.data.accountName)
  }

  // 3. Test Update Profile
  console.log('Testing PUT /auth/profile...')
  const updateRes = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: 'Super',
      lastName: 'Admin',
      phone: '0987654321',
      avatar: 'https://example.com/avatar.jpg',
      notificationSettings: { emailNotifications: true }
    })
  })
  
  if (updateRes.status === 404) {
    console.log('❌ PUT /auth/profile returned 404 as expected (Not implemented yet).')
  } else if (!updateRes.ok) {
    throw new Error(`PUT /auth/profile failed: ${updateRes.status}`)
  } else {
    const updateData = await updateRes.json()
    console.log('✅ PUT /auth/profile succeeded! New avatar:', updateData.data.avatar)
  }

  // 4. Test Change Password
  console.log('Testing PUT /auth/change-password...')
  const changePasswordRes = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      oldPassword: 'It@12345',
      newPassword: 'It@12345New'
    })
  })

  if (changePasswordRes.status === 404) {
    console.log('❌ PUT /auth/change-password returned 404 as expected (Not implemented yet).')
    console.log('TDD Verification: Red state achieved.')
    return
  } else if (!changePasswordRes.ok) {
    throw new Error(`PUT /auth/change-password failed: ${changePasswordRes.status}`)
  }
  
  console.log('✅ PUT /auth/change-password succeeded!')

  // 5. Verify old password fails login
  console.log('Verifying old password fails...')
  const oldLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@crm.com', password: 'It@12345' })
  })
  if (oldLoginRes.status === 401 || oldLoginRes.status === 400) {
    console.log('✅ Old password failed login as expected.')
  } else {
    throw new Error(`Old password login did not fail: ${oldLoginRes.status}`)
  }

  // 6. Login with new password
  console.log('Logging in with new password...')
  const newLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@crm.com', password: 'It@12345New' })
  })
  if (!newLoginRes.ok) {
    throw new Error(`New password login failed: ${newLoginRes.status}`)
  }
  const newLoginData = await newLoginRes.json()
  const newToken = newLoginData.data.accessToken
  console.log('✅ New password login succeeded!')

  // 7. Revert password to clean up
  console.log('Reverting password to clean up...')
  const revertRes = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newToken}`
    },
    body: JSON.stringify({
      oldPassword: 'It@12345New',
      newPassword: 'It@12345'
    })
  })
  if (!revertRes.ok) {
    throw new Error(`Reverting password failed: ${revertRes.status}`)
  }
  console.log('✅ Password reverted successfully! Cleanup complete.')
  console.log('--- ALL AUTH ENDPOINT TESTS PASSED ---')
}

testAuthEndpoints().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
