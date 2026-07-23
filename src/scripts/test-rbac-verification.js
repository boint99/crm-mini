/**
 * Script kiểm thử liên thông (Integration Test) hệ thống RBAC & Dynamic Route Authorization
 *
 * Kiểm tra các tình huống phân quyền thực tế:
 * 1. Gọi GET /api/auth/profile để kiểm tra permissions trả về
 * 2. Gọi GET /api/companies bằng tài khoản ADMIN/SuperAdmin -> Pass (200)
 * 3. Tạo tài khoản Test (không phân quyền) -> Gọi GET /api/companies -> Blocked (403)
 */
import http from 'http'
import { environments } from '../configs/env.config.js'
import { PRISMA } from '../configs/db.config.js'
import bcrypt from 'bcrypt'
import { saltRoundsPassword } from '../utils/constants.js'
import { v7 as uuidv7 } from 'uuid'

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

async function runRbacTests() {
  console.log('\n======================================================')
  console.log('🚀 KIỂM THỬ LIÊN THÔNG HỆ THỐNG PHÂN QUYỀN ĐỘNG (RBAC)')
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

  // Khởi tạo các biến test
  const adminEmail = 'admin@vienthongact.vn'
  const adminPassword = 'It@12345'
  const testEmail = 'rbac.test.user@crm.com'
  const testPassword = 'Password123'
  let testAccountId = null

  try {
    // -------------------------------------------------------------------------
    // Bước chuẩn bị: Dọn dẹp tài khoản cũ (nếu có) trước khi tạo
    // -------------------------------------------------------------------------
    const oldTestAccount = await PRISMA.aCCOUNTS.findFirst({
      where: { accountName: testEmail }
    })
    if (oldTestAccount) {
      await PRISMA.rEFRESH_TOKENS.deleteMany({ where: { accountId: oldTestAccount.accountId } })
      await PRISMA.aCCOUNT_ROLES.deleteMany({ where: { accountId: oldTestAccount.accountId } })
      await PRISMA.aCCOUNTS.delete({ where: { accountId: oldTestAccount.accountId } })
    }

    const hashedPassword = await bcrypt.hash(testPassword, saltRoundsPassword)
    const testAccount = await PRISMA.aCCOUNTS.create({
      data: {
        id: uuidv7(),
        accountName: testEmail,
        password: hashedPassword,
        isLogin: true,
        status: 'ENABLE',
        description: 'Tài khoản test phân quyền RBAC'
      }
    })
    testAccountId = testAccount.accountId
    console.log(`ℹ️ Đã tạo tài khoản test thường (ID: ${testAccountId})`)

    // -------------------------------------------------------------------------
    // 1. Đăng nhập tài khoản Admin
    // -------------------------------------------------------------------------
    const adminLoginRes = await request('POST', '/auth/login', {
      email: adminEmail,
      password: adminPassword
    })

    assertTest(
      `Đăng nhập tài khoản Admin (${adminEmail}) thành công`,
      adminLoginRes.status === 200 && adminLoginRes.body?.data?.accessToken,
      `Status: ${adminLoginRes.status}, Body: ${JSON.stringify(adminLoginRes.body)}`
    )

    if (adminLoginRes.status === 200) {
      const adminToken = adminLoginRes.body.data.accessToken

      // 1.1. Kiểm tra API profile trả về permissions của Admin
      const adminProfileRes = await request('GET', '/auth/profile', null, {
        Authorization: `Bearer ${adminToken}`
      })

      const hasPermissionsArray = Array.isArray(adminProfileRes.body?.data?.permissions)
      assertTest(
        'GET /auth/profile trả về danh sách permissions dưới dạng mảng',
        adminProfileRes.status === 200 && hasPermissionsArray,
        `Status: ${adminProfileRes.status}, Body: ${JSON.stringify(adminProfileRes.body)}`
      )

      if (hasPermissionsArray) {
        console.log(`ℹ️ Số lượng permissions của Admin nhận được: ${adminProfileRes.body.data.permissions.length}`)
      }

      // 1.2. Gọi API được phân quyền (ví dụ GET /api/companies) -> Phải thành công 200
      const getCompaniesAdminRes = await request('GET', '/companies', null, {
        Authorization: `Bearer ${adminToken}`
      })

      assertTest(
        'Gọi GET /api/companies bằng tài khoản Admin -> Pass (HTTP 200)',
        getCompaniesAdminRes.status === 200,
        `Status: ${getCompaniesAdminRes.status}, Body: ${JSON.stringify(getCompaniesAdminRes.body)}`
      )
    }

    // -------------------------------------------------------------------------
    // 2. Đăng nhập tài khoản Test thường (không được phân quyền)
    // -------------------------------------------------------------------------
    const testLoginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: testPassword
    })

    assertTest(
      'Đăng nhập tài khoản Test thường thành công',
      testLoginRes.status === 200 && testLoginRes.body?.data?.accessToken,
      `Status: ${testLoginRes.status}, Body: ${JSON.stringify(testLoginRes.body)}`
    )

    if (testLoginRes.status === 200) {
      const testToken = testLoginRes.body.data.accessToken

      // 2.1. Kiểm tra API profile của tài khoản test thường -> permissions phải rỗng
      const testProfileRes = await request('GET', '/auth/profile', null, {
        Authorization: `Bearer ${testToken}`
      })

      const permissionsCount = testProfileRes.body?.data?.permissions?.length || 0
      assertTest(
        'Tài khoản test thường không có permissions',
        testProfileRes.status === 200 && permissionsCount === 0,
        `Status: ${testProfileRes.status}, Permissions Count: ${permissionsCount}`
      )

      // 2.2. Gọi API GET /api/companies -> Phải bị chặn 403 Forbidden
      const getCompaniesTestRes = await request('GET', '/companies', null, {
        Authorization: `Bearer ${testToken}`
      })

      assertTest(
        'Gọi GET /api/companies bằng tài khoản thường -> Blocked (HTTP 403 Forbidden)',
        getCompaniesTestRes.status === 403,
        `Status: ${getCompaniesTestRes.status}, Body: ${JSON.stringify(getCompaniesTestRes.body)}`
      )
    }

  } catch (err) {
    console.error('❌ Lỗi trong quá trình chạy test RBAC:', err)
  } finally {
    // -------------------------------------------------------------------------
    // Dọn dẹp dữ liệu: Xóa tài khoản Test
    // -------------------------------------------------------------------------
    if (testAccountId) {
      try {
        await PRISMA.rEFRESH_TOKENS.deleteMany({
          where: { accountId: testAccountId }
        })
        await PRISMA.aCCOUNT_ROLES.deleteMany({
          where: { accountId: testAccountId }
        })
        await PRISMA.aCCOUNTS.delete({
          where: { accountId: testAccountId }
        })
        console.log('ℹ️ Đã xóa dọn dẹp tài khoản test thường.')
      } catch (err) {
        console.error('⚠️ Lỗi khi dọn dẹp tài khoản test:', err.message)
      }
    }
    await PRISMA.$disconnect()
  }

  console.log('\n======================================================')
  console.log(`📊 KẾT QUẢ KHIỂM THỬ RBAC: ${passed} PASSED | ${failed} FAILED`)
  console.log('======================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

runRbacTests()
