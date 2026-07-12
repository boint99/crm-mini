import { environments } from '../configs/env.config.js'

const API_URL = `http://localhost:${environments.API_PORT || 8017}/api`

async function testAccountsPaging() {
  console.log('--- STARTING ACCOUNTS PAGINATION & SEARCH TESTS ---')

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

  // 2. Fetch with pagination parameters: page=1, pageSize=1
  console.log('Fetching page 1, size 1...')
  const pagingRes = await fetch(`${API_URL}/accounts?page=1&pageSize=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!pagingRes.ok) {
    throw new Error(`Failed to fetch accounts list: ${pagingRes.status}`)
  }

  const pagingData = await pagingRes.json()
  
  // TDD Check: We expect paginated API to return a structure like: { success: true, data: { list: [...], total: N } }
  // Currently, it returns the raw array of all accounts under "data", without "total" or "list".
  if (pagingData.data.list === undefined || pagingData.data.total === undefined) {
    console.log('❌ Paging test failed: Response does not contain data.list or data.total.')
    console.log('TDD Verification: Red state achieved.')
    process.exit(1)
  }

  // 3. Check page limit
  if (pagingData.data.list.length > 1) {
    throw new Error(`Page size limit was ignored: returned ${pagingData.data.list.length} items instead of 1`)
  }

  console.log(`✅ Pagination works! Page size: ${pagingData.data.list.length}, Total in database: ${pagingData.data.total}`)

  // 4. Test Search
  console.log('Testing search functionality (search=admin)...')
  const searchRes = await fetch(`${API_URL}/accounts?search=admin`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const searchData = await searchRes.json()
  const matched = searchData.data.list.every(acc => acc.accountName.toLowerCase().includes('admin') || (acc.description && acc.description.toLowerCase().includes('admin')))
  
  if (!matched) {
    throw new Error('Search returned non-matching items!')
  }
  console.log('✅ Search test passed!')

  // 5. Test Filter by Status
  console.log('Testing filter by status (status=ENABLE)...')
  const filterRes = await fetch(`${API_URL}/accounts?status=ENABLE`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const filterData = await filterRes.json()
  const statusMatched = filterData.data.list.every(acc => acc.status === 'ENABLE')

  if (!statusMatched) {
    throw new Error('Status filter returned disabled items!')
  }
  console.log('✅ Filter test passed!')
  console.log('--- ALL ACCOUNTS PAGINATION & SEARCH TESTS PASSED ---')
}

testAccountsPaging().catch((err) => {
  console.error('❌ Test failed:', err.message)
  process.exit(1)
})
