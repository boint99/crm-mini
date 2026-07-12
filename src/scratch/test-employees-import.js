import dotenv from 'dotenv'
dotenv.config()

const API_URL = 'http://localhost:8017/api'

async function testEmployeesImport() {
  console.log('--- STARTING EMPLOYEES IMPORT VALIDATION TESTS ---')

  // 1. Log in to get token
  console.log('Logging in...')
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@crm.com',
      password: 'It@12345'
    })
  })
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status}`)
  }
  const loginData = await loginRes.json()
  const token = loginData.data.accessToken
  console.log('✅ Login successful!')

  // 2. Create a test Company and Department first to use in CSV import
  const suffix = Math.floor(Math.random() * 1000000)
  console.log('\nCreating a test Company...')
  const compRes = await fetch(`${API_URL}/company/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      companyName: 'Import Test Company ' + suffix
    })
  })
  if (!compRes.ok) {
    throw new Error(`Failed to create test Company: ${compRes.status}`)
  }
  const compData = await compRes.json()
  const companyUuid = compData.data.id

  console.log('Creating a test Department linked to the Company...')
  const deptCode = 'IMP_' + suffix
  const deptRes = await fetch(`${API_URL}/organizations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orgUnitCode: deptCode,
      unitName: 'Department for Import ' + suffix,
      companyId: companyUuid
    })
  })
  if (!deptRes.ok) {
    throw new Error(`Failed to create test Department: ${deptRes.status}`)
  }
  console.log(`✅ Setup complete. Test Department Code is: ${deptCode}`)

  const testEmpCode = 'EMP' + suffix.toString().slice(0, 3)

  // 3. Generate CSV content
  const csvText = 
    `employeeCode,firstName,lastName,email,phone,birthDate,unitCode,positionName,status,description\n` +
    `${testEmpCode},Văn,Hợp Lệ,valid_${suffix}@crm.com,0987111222,1995-10-10,${deptCode},,ENABLE,Bản ghi hợp lệ\n` + 
    `ERR2,Lỗi,Thiếu Mã,,0987222333,1996-11-11,${deptCode},,ENABLE,Lỗi mã ngắn quá\n` +
    `EMP333,Lỗi,Sai Ngày,err3@crm.com,0987333444,invalid-date,${deptCode},,ENABLE,Ngày sinh sai`

  console.log('\nTesting POST /import-preview with sample CSV...')
  const previewRes = await fetch(`${API_URL}/employees/import-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ csvText })
  })
  if (!previewRes.ok) {
    throw new Error(`Preview failed with status ${previewRes.status}`)
  }
  const previewData = await previewRes.json()
  const { summary, records } = previewData.data
  console.log('✅ Preview Summary:', summary)
  console.log('Processed Records Detail:')
  records.forEach(r => {
    console.log(`- Line ${r.rowNumber}: [${r.employeeCode}] ${r.firstName} ${r.lastName} | isValid: ${r.isValid} | Errors: ${JSON.stringify(r.errors)}`)
  })

  // Assertions for preview results
  if (summary.total !== 3) throw new Error('Expected 3 parsed rows!')
  if (summary.validCount !== 1) throw new Error('Expected exactly 1 valid row!')
  if (summary.invalidCount !== 2) throw new Error('Expected exactly 2 invalid rows!')

  // 4. Extract valid records and send confirmation
  const validRecords = records.filter(r => r.isValid)
  console.log('\nTesting POST /import-confirm with valid records...')
  const confirmRes = await fetch(`${API_URL}/employees/import-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ records: validRecords })
  })
  if (!confirmRes.ok) {
    throw new Error(`Import confirm failed with status ${confirmRes.status}`)
  }
  const confirmData = await confirmRes.json()
  console.log('✅ Confirm Response:', confirmData.data)
  if (confirmData.data.count !== 1) {
    throw new Error('Expected 1 employee to be imported!')
  }

  // 5. Query the employee to verify database insertion
  console.log('\nVerifying imported employee in database...')
  const listRes = await fetch(`${API_URL}/employees?search=${testEmpCode}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!listRes.ok) {
    throw new Error(`Failed to list employees: ${listRes.status}`)
  }
  const listData = await listRes.json()
  const found = listData.data.find(e => e.employeeCode === testEmpCode)
  if (found) {
    console.log('✅ Imported employee found in database:', found.firstName, found.lastName)
  } else {
    throw new Error('Imported employee NOT found in database!')
  }

  console.log('\n--- ALL IMPORT TESTS PASSED SUCCESSFULLY! ---')
}

testEmployeesImport().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
