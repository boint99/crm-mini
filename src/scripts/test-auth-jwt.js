import http from 'http'
import { environments } from '../configs/env.config.js'

const PORT = environments.API_PORT || 8017
const BASE_URL = `http://localhost:${PORT}/api`

// Helper function to send HTTP requests
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
          } catch {}
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
  console.log('🚀 KIỂM THỬ HỆ THỐNG ĐĂNG NHẬP VÀ JWT (AUTH TEST SUITE)')
  console.log(`📡 Target API: ${BASE_URL}`)
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
    // --------------------------------------------------------
    // TC-01: Thiếu Email
    // --------------------------------------------------------
    const tc1 = await request('POST', '/auth/login', { password: 'password123' })
    assertTest(
      'TC-01: Đăng nhập thiếu Email -> HTTP 400',
      tc1.status === 400 && tc1.body?.message?.includes('Email is required'),
      `Kỳ vọng 400, thực tế ${tc1.status} (${JSON.stringify(tc1.body)})`
    )

    // --------------------------------------------------------
    // TC-02: Thiếu Mật khẩu
    // --------------------------------------------------------
    const tc2 = await request('POST', '/auth/login', { email: 'boint99@gmail.com' })
    assertTest(
      'TC-02: Đăng nhập thiếu Password -> HTTP 400',
      tc2.status === 400 && tc2.body?.message?.includes('Password is required'),
      `Kỳ vọng 400, thực tế ${tc2.status} (${JSON.stringify(tc2.body)})`
    )

    // --------------------------------------------------------
    // TC-03: Email không tồn tại
    // --------------------------------------------------------
    const tc3 = await request('POST', '/auth/login', {
      email: 'nonexistent_account_12345@crm.com',
      password: 'It@12345'
    })
    assertTest(
      'TC-03: Email không tồn tại -> HTTP 401',
      tc3.status === 401 && tc3.body?.message?.includes('Invalid email or password'),
      `Kỳ vọng 401, thực tế ${tc3.status}`
    )

    // --------------------------------------------------------
    // TC-04: Sai mật khẩu
    // --------------------------------------------------------
    const tc4 = await request('POST', '/auth/login', {
      email: 'boint99@gmail.com',
      password: 'wrong_password_xyz'
    })
    assertTest(
      'TC-04: Sai mật khẩu -> HTTP 401',
      tc4.status === 401 && tc4.body?.message?.includes('Invalid email or password'),
      `Kỳ vọng 401, thực tế ${tc4.status}`
    )

    // --------------------------------------------------------
    // TC-05: Gọi Protected API không có Token
    // --------------------------------------------------------
    const tc5 = await request('GET', '/auth/profile')
    assertTest(
      'TC-05: Truy cập Protected API không có Token -> HTTP 401 (MISSING_TOKEN)',
      tc5.status === 401 && tc5.body?.code === 'MISSING_TOKEN',
      `Kỳ vọng 401 MISSING_TOKEN, thực tế ${tc5.status} (${tc5.body?.code})`
    )

    // --------------------------------------------------------
    // TC-06: Gọi Protected API với Access Token không hợp lệ / sai chữ ký
    // --------------------------------------------------------
    const tc6 = await request('GET', '/auth/profile', null, {
      Authorization: 'Bearer invalid.token.signature'
    })
    assertTest(
      'TC-06: Access Token sai định dạng/chữ ký -> HTTP 401 (INVALID_TOKEN)',
      tc6.status === 401 && tc6.body?.code === 'INVALID_TOKEN',
      `Kỳ vọng 401 INVALID_TOKEN, thực tế ${tc6.status}`
    )

    // --------------------------------------------------------
    // TC-07: Đăng nhập thành công (Happy Path)
    // --------------------------------------------------------
    const tc7 = await request('POST', '/auth/login', {
      email: 'boint99@gmail.com',
      password: 'It@12345'
    })

    // Trích xuất refreshToken từ Cookie Header
    const setCookieHeader = tc7.headers['set-cookie'] || []
    let refreshToken = null
    for (const cookieStr of setCookieHeader) {
      if (cookieStr.startsWith('refreshToken=')) {
        refreshToken = cookieStr.split(';')[0].replace('refreshToken=', '')
      }
    }

    const isLoginOk = tc7.status === 200 && tc7.body?.data?.accessToken && refreshToken
    assertTest(
      'TC-07: Đăng nhập tài khoản hợp lệ -> HTTP 200, trả về AccessToken & Cookie RefreshToken',
      isLoginOk,
      `Kỳ vọng 200 có token, thực tế ${tc7.status} (${JSON.stringify(tc7.body)})`
    )

    if (isLoginOk) {
      const accessToken = tc7.body.data.accessToken

      // --------------------------------------------------------
      // TC-08: Gọi Protected API với Access Token hợp lệ
      // --------------------------------------------------------
      const tc8 = await request('GET', '/auth/profile', null, {
        Authorization: `Bearer ${accessToken}`
      })
      assertTest(
        'TC-08: Truy cập Protected API bằng Access Token hợp lệ -> HTTP 200',
        tc8.status === 200 && tc8.body?.data?.accountId,
        `Kỳ vọng 200 có profile data, thực tế ${tc8.status}`
      )

      // --------------------------------------------------------
      // TC-09: Dùng Refresh Token để truy cập Protected API (Sai token type / secret)
      // --------------------------------------------------------
      const tc9 = await request('GET', '/auth/profile', null, {
        Authorization: `Bearer ${refreshToken}`
      })
      assertTest(
        'TC-09: Dùng Refresh Token thay cho Access Token -> HTTP 401',
        tc9.status === 401 && (tc9.body?.code === 'INVALID_TOKEN_TYPE' || tc9.body?.code === 'INVALID_TOKEN'),
        `Kỳ vọng 401, thực tế ${tc9.status} (${tc9.body?.code})`
      )

      // --------------------------------------------------------
      // TC-10: Cấp lại Access Token mới bằng Refresh Token
      // --------------------------------------------------------
      const tc10 = await request('POST', '/auth/refresh-token', { refreshToken })
      const isRefreshOk = tc10.status === 200 && tc10.body?.data?.accessToken
      assertTest(
        'TC-10: Refresh Token hợp lệ -> Cấp Access Token mới (HTTP 200)',
        isRefreshOk,
        `Kỳ vọng 200 có accessToken mới, thực tế ${tc10.status}`
      )

      // --------------------------------------------------------
      // TC-11: Đăng xuất (Logout)
      // --------------------------------------------------------
      const tc11 = await request('POST', '/auth/logout', { refreshToken }, {
        Authorization: `Bearer ${accessToken}`
      })
      assertTest(
        'TC-11: Đăng xuất tài khoản -> HTTP 200',
        tc11.status === 200,
        `Kỳ vọng 200, thực tế ${tc11.status}`
      )

      // --------------------------------------------------------
      // TC-12: Sử dụng Refresh Token đã đăng xuất/bị thu hồi
      // --------------------------------------------------------
      const tc12 = await request('POST', '/auth/refresh-token', { refreshToken })
      assertTest(
        'TC-12: Dùng Refresh Token đã bị thu hồi/đăng xuất -> HTTP 401',
        tc12.status === 401,
        `Kỳ vọng 401, thực tế ${tc12.status}`
      )
    }

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error(`❌ Không thể kết nối tới Backend Server tại ${BASE_URL}`)
      console.error(`👉 NGUYÊN NHÂN: Server backend chưa được chạy trên port ${PORT}.`)
      console.error('👉 CÁCH KHẮC PHỤC: Hãy mở 1 terminal mới và chạy: npm run dev (hoặc yarn dev)\n')
    } else {
      console.error('\n❌ Lỗi trong quá trình chạy test:', err)
    }
  }

  console.log('\n======================================================')
  console.log(`📊 KẾT QUẢ KHIỂM THỬ: ${passed} PASSED | ${failed} FAILED`)
  console.log('======================================================\n')
}

runTests()
