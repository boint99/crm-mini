import { environments } from '../configs/env.config.js'

const API_URL = `http://localhost:${environments.API_PORT || 8017}/api`

async function testCompanyEnforcement() {
  console.log('--- STARTING COMPANY ENFORCEMENT VALIDATION TESTS ---')

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
  console.log('✅ Login successful!')

  // --- DEPARTMENT CREATION TESTS ---
  console.log('\nTesting Department creation without companyId...')
  const deptNoCompanyRes = await fetch(`${API_URL}/organizations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orgUnitCode: 'TEST_DEPT_FAIL',
      unitName: 'Department Without Company'
    })
  })
  if (deptNoCompanyRes.status === 400) {
    const errorData = await deptNoCompanyRes.json()
    console.log('✅ Department creation without companyId failed with 400 as expected:', errorData.message)
  } else {
    throw new Error(`Expected Department without company to fail with 400 but got: ${deptNoCompanyRes.status}`)
  }

  // --- EMPLOYEE CREATION TESTS ---
  console.log('\nTesting Employee creation without unitId...')
  const empNoUnitRes = await fetch(`${API_URL}/employees/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeCode: 'EMP_FAIL_CODE',
      firstName: 'NoUnit',
      lastName: 'Employee',
      status: 'ENABLE',
      email: 'nounit@crm.com'
    })
  })
  if (empNoUnitRes.status === 400) {
    const errorData = await empNoUnitRes.json()
    console.log('✅ Employee creation without unitId failed with 400 as expected:', errorData.message)
  } else {
    throw new Error(`Expected Employee without unitId to fail with 400 but got: ${empNoUnitRes.status}`)
  }

  // --- ACCOUNT CREATION TESTS ---
  console.log('\nTesting Account creation without employeeCode...')
  const accNoEmpRes = await fetch(`${API_URL}/accounts/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      accountName: 'noemp@crm.com',
      password: 'Password123!',
      status: 'ENABLE'
    })
  })
  if (accNoEmpRes.status === 400) {
    const errorData = await accNoEmpRes.json()
    console.log('✅ Account creation without employeeCode failed with 400 as expected:', errorData.message)
  } else {
    throw new Error(`Expected Account without employeeCode to fail with 400 but got: ${accNoEmpRes.status}`)
  }

  // --- SUCCESS PATHS ---
  const suffix = Math.floor(Math.random() * 1000000)

  // A. Create Company
  console.log('\nCreating a test Company...')
  const compRes = await fetch(`${API_URL}/company/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      companyName: 'Test Company Enforcement ' + suffix
    })
  })
  if (!compRes.ok) {
    throw new Error(`Failed to create test Company: ${compRes.status}`)
  }
  const compData = await compRes.json()
  const companyUuid = compData.data.id
  console.log('✅ Test Company created with UUID:', companyUuid)

  // B. Create Department with Company
  console.log('\nCreating a test Department linked to the Company...')
  const deptRes = await fetch(`${API_URL}/organizations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orgUnitCode: 'DEPT_' + suffix,
      unitName: 'Department With Company ' + suffix,
      companyId: companyUuid
    })
  })
  if (!deptRes.ok) {
    throw new Error(`Failed to create test Department: ${deptRes.status}`)
  }
  const deptData = await deptRes.json()
  const deptUuid = deptData.data.id
  console.log('✅ Test Department created with UUID:', deptUuid)

  // C. Create Employee with Department
  console.log('\nCreating a test Employee linked to the Department...')
  const empCode = 'EMP_' + suffix
  const empRes = await fetch(`${API_URL}/employees/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeCode: empCode,
      firstName: 'Success',
      lastName: 'Employee',
      status: 'ENABLE',
      email: `successemployee_${suffix}@crm.com`,
      unitId: deptUuid
    })
  })
  if (!empRes.ok) {
    throw new Error(`Failed to create test Employee: ${empRes.status}`)
  }
  console.log('✅ Test Employee created successfully.')

  // D. Create Account with Employee
  console.log('\nCreating a test Account linked to the Employee...')
  const accRes = await fetch(`${API_URL}/accounts/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      accountName: `successemployee_${suffix}@crm.com`,
      password: 'Password123!',
      status: 'ENABLE',
      employeeCode: empCode
    })
  })
  if (!accRes.ok) {
    throw new Error(`Failed to create test Account: ${accRes.status}`)
  }
  console.log('✅ Test Account created successfully.')

  console.log('\n--- ALL COMPANY ENFORCEMENT TESTS PASSED SUCCESSFULLY! ---')
}

testCompanyEnforcement().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
