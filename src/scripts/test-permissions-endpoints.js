/**
 * Script kiểm thử tính năng Search và Pagination của API /api/permissions
 */
import http from 'http'
import { environments } from '../configs/env.config.js'

const PORT = environments.API_PORT || 8017
const BASE_URL = `http://localhost:${PORT}/api`

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`)
    const payload = body ? JSON.stringify(body) : null

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    }
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload)
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          let parsedData = data
          try {
            parsedData = JSON.parse(data)
          } catch {
            // Ignore non-JSON response
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedData
          })
        })
      }
    )

    req.on('error', (err) => reject(err))
    if (payload) req.write(payload)
    req.end()
  })
}

async function runTests() {
  console.log('\n======================================================')
  console.log('🚀 KIỂM THỬ API TÌM KIẾM VÀ PHÂN TRANG PERMISSIONS (OFFSET-BASED)')
  console.log('======================================================\n')

  let passed = 0
  let failed = 0

  function assertTest(name, condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`)
      passed++
    } else {
      console.log(`❌ [FAIL] ${name} - ${message}`)
      failed++
    }
  }

  try {
    // 1. Đăng nhập Admin để lấy token
    const loginRes = await request('POST', '/auth/login', {
      email: 'admin@vienthongact.vn',
      password: 'It@12345'
    })

    if (loginRes.status !== 200) {
      console.error('❌ Đăng nhập Admin thất bại!')
      process.exit(1)
    }

    const token = loginRes.body.data.accessToken
    const headers = { Authorization: `Bearer ${token}` }

    // 2. Test Pagination (Mặc định 20 kết quả, có total và list)
    const page1Res = await request('GET', '/permissions?page=1&limit=20', null, headers)
    assertTest(
      'Phân trang: Trả về total và list tối đa 20 bản ghi',
      page1Res.status === 200 && page1Res.body?.data?.list?.length <= 20 && typeof page1Res.body?.data?.total === 'number',
      `Status: ${page1Res.status}, List Count: ${page1Res.body?.data?.list?.length}, Total: ${page1Res.body?.data?.total}`
    )

    // Gọi trang 2
    const page2Res = await request('GET', '/permissions?page=2&limit=20', null, headers)
    assertTest(
      'Phân trang: Lấy trang thứ 2 thành công',
      page2Res.status === 200 && Array.isArray(page2Res.body?.data?.list),
      `Status: ${page2Res.status}, List Count: ${page2Res.body?.data?.list?.length}`
    )

    // 3. Test Search (Tìm theo tên quyền, ví dụ "công ty")
    const searchRes = await request('GET', '/permissions?search=công%20ty', null, headers)
    const allMatchesHaveName = searchRes.body?.data?.list?.every(item => 
      item.perName.toLowerCase().includes('công ty')
    )
    assertTest(
      'Tìm kiếm: Chỉ tìm theo tên quyền chứa cụm từ tìm kiếm',
      searchRes.status === 200 && searchRes.body?.data?.list?.length > 0 && allMatchesHaveName,
      `Status: ${searchRes.status}, Matches Count: ${searchRes.body?.data?.list?.length}`
    )

    // 4. Test Nopaginate (Lấy toàn bộ quyền cho modal gán quyền)
    const noPaginateRes = await request('GET', '/permissions?nopaginate=true', null, headers)
    assertTest(
      'Nopaginate: Lấy toàn bộ quyền không phân trang',
      noPaginateRes.status === 200 && Array.isArray(noPaginateRes.body?.data) && noPaginateRes.body?.data?.length > 20,
      `Status: ${noPaginateRes.status}, Array size: ${noPaginateRes.body?.data?.length}`
    )

  } catch (error) {
    console.error('❌ Lỗi kiểm thử:', error)
  }

  console.log('\n======================================================')
  console.log(`📊 KẾT QUẢ: ${passed} PASSED | ${failed} FAILED`)
  console.log('======================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
