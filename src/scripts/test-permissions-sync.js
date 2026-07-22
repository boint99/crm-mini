/**
 * Script kiểm tra đồng bộ giữa Express Routes và Database Permissions
 *
 * Nhiệm vụ:
 * 1. Quét toàn bộ routes đã đăng ký trong mã nguồn Express bằng cách map prefix
 * 2. Lấy toàn bộ permissions trong bảng PERMISSIONS
 * 3. Đối chiếu và chỉ ra sự lệch pha (out of sync)
 */
import { PRISMA } from '../configs/db.config.js'
import { companyRoutes } from '../modules/company/company.routes.js'
import { organizationRoutes } from '../modules/organization/organization.routes.js'
import { branchesRoutes } from '../modules/branch/branch.routes.js'
import { positionsRoutes } from '../modules/positions/positions.routes.js'
import { employeesRoutes } from '../modules/employees/employees.routes.js'
import { employeesViettelRoutes } from '../modules/outsources/viettelEmployees/employees.viettel.routes.js'
import { viettelBranchRoutes } from '../modules/outsources/viettelBranch/viettelBranch.routes.js'
import { vlansRoutes } from '../modules/network/vlans/vlans.routes.js'
import { ipsRoutes } from '../modules/network/ips/ips.routes.js'
import { accountsRoutes } from '../modules/accounts/accounts.routes.js'
import { otpRoutes } from '../modules/otp/otp.routes.js'
import { permissionsRoutes } from '../modules/permissions/permissions.routes.js'
import { rolesRoutes } from '../modules/roles/roles.routes.js'
import { accountRolesRoutes } from '../modules/accountRoles/accountRoles.routes.js'
import { authRoutes } from '../modules/auth/auth.routes.js'

// Định nghĩa mapping giữa tiền tố API và Router tương ứng
const routerMapping = [
  { prefix: '/api/companies', router: companyRoutes },
  { prefix: '/api/organizations', router: organizationRoutes },
  { prefix: '/api/branches', router: branchesRoutes },
  { prefix: '/api/positions', router: positionsRoutes },
  { prefix: '/api/employees', router: employeesRoutes },
  { prefix: '/api/viettel-employees', router: employeesViettelRoutes },
  { prefix: '/api/viettel-branches', router: viettelBranchRoutes },
  { prefix: '/api/vlans', router: vlansRoutes },
  { prefix: '/api/ip-addresses', router: ipsRoutes },
  { prefix: '/api/accounts', router: accountsRoutes },
  { prefix: '/api/permissions', router: permissionsRoutes },
  { prefix: '/api/roles', router: rolesRoutes },
  { prefix: '/api/account-roles', router: accountRolesRoutes },
  { prefix: '/api/otp', router: otpRoutes },
  { prefix: '/api/auth', router: authRoutes }
]

function getRoutesFromRouter(router, prefix) {
  const routes = []
  if (!router || !router.stack) return routes

  router.stack.forEach((layer) => {
    if (layer.route) {
      let path = prefix + layer.route.path
      // Bỏ dấu gạch chéo ở cuối nếu có
      if (path.endsWith('/') && path.length > 1) {
        path = path.slice(0, -1)
      }
      const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase())
      methods.forEach((method) => {
        routes.push({ method, path })
      })
    }
  })
  return routes
}

async function verifyPermissionsSync() {
  console.log('\n======================================================')
  console.log('🔍 KIỂM TRA ĐỒNG BỘ ROUTE & PERMISSION (SYNC CHECKER)')
  console.log('======================================================\n')

  try {
    // 1. Quét toàn bộ routes trong code
    const codeRoutes = []
    routerMapping.forEach(({ prefix, router }) => {
      codeRoutes.push(...getRoutesFromRouter(router, prefix))
    })
    
    // Các endpoint công khai hoặc không cần phân quyền động
    const ignoredPaths = [
      '/api/otp/generate',
      '/api/auth'
    ]

    const protectedRoutes = codeRoutes.filter(r => 
      !ignoredPaths.some(ignored => r.path === ignored || r.path.startsWith(ignored + '/'))
    )

    console.log(`📡 Tìm thấy ${protectedRoutes.length} API route được bảo mật trong code.`)

    // 2. Lấy permissions từ DB
    const dbPermissions = await PRISMA.pERMISSIONS.findMany({
      where: { deletedAt: null }
    })
    console.log(`🗄️ Tìm thấy ${dbPermissions.length} permissions hoạt động trong Database.\n`)

    // 3. So khớp
    const missingPermissions = []
    const stalePermissions = []

    // 3.1. Tìm route có trong code nhưng thiếu trong DB
    protectedRoutes.forEach((route) => {
      const isMatched = dbPermissions.some((perm) => {
        if (!perm.apiPath || !perm.method) return false
        
        // Chuẩn hóa param format (ví dụ :id và {id} đều được chấp nhận)
        const normDbPath = perm.apiPath.trim().replace(/\/$/, '').replace(/{id}/g, ':id')
        const normRoutePath = route.path.trim().replace(/\/$/, '')
        
        return perm.method.toUpperCase() === route.method && normDbPath === normRoutePath
      })

      if (!isMatched) {
        missingPermissions.push(route)
      }
    })

    // 3.2. Tìm permission thừa trong DB
    dbPermissions.forEach((perm) => {
      const isMatched = protectedRoutes.some((route) => {
        const normDbPath = (perm.apiPath || '').trim().replace(/\/$/, '').replace(/{id}/g, ':id')
        const normRoutePath = route.path.trim().replace(/\/$/, '')
        
        return (perm.method || '').toUpperCase() === route.method && normDbPath === normRoutePath
      })

      if (!isMatched) {
        stalePermissions.push(perm)
      }
    })

    // 4. In kết quả
    if (missingPermissions.length > 0) {
      console.log('⚠️ [CẢNH BÁO] Phát hiện các API route chưa được khai báo permission trong DB:')
      missingPermissions.forEach((r) => {
        console.log(`  ❌ Thiếu: ${r.method} ${r.path}`)
      })
      console.log('\n👉 Vui lòng thêm các route trên vào file seed-permissions.js và chạy lại seed.\n')
    } else {
      console.log('✅ [ĐỒNG BỘ] Tất cả các API route trong mã nguồn đã được đăng ký đầy đủ trong DB permissions!')
    }

    if (stalePermissions.length > 0) {
      console.log('\nℹ️ [THÔNG TIN] Có permissions trong DB nhưng không tìm thấy route tương ứng trong code (có thể đã bị xóa hoặc đổi tên):')
      stalePermissions.forEach((p) => {
        console.log(`  ⚠️ Thừa: ${p.method} ${p.apiPath} (${p.perCode})`)
      })
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra đồng bộ:', error)
  } finally {
    await PRISMA.$disconnect()
  }
  console.log('\n======================================================\n')
}

verifyPermissionsSync()
