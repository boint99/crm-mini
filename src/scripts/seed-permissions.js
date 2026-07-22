/**
 * Script Seed Permissions — Đồng bộ toàn bộ API Routes vào bảng PERMISSIONS
 *
 * Chạy: npm run seed:permissions
 * Idempotent: chạy lại nhiều lần không tạo trùng (upsert theo perCode)
 */
import { PRISMA } from '../configs/db.config.js'

// =====================================================================
// Danh sách toàn bộ 59 route cần phân quyền (khớp RBAC.md mục 8)
// =====================================================================
const ALL_PERMISSIONS = [
  // ── Quản lý Tổ chức ──
  { perCode: 'companies.list',   perName: 'Danh sách công ty',          method: 'GET',    apiPath: '/api/companies' },
  { perCode: 'companies.create', perName: 'Tạo công ty',                method: 'POST',   apiPath: '/api/companies' },
  { perCode: 'companies.update', perName: 'Cập nhật công ty',           method: 'PUT',    apiPath: '/api/companies/:id' },
  { perCode: 'companies.delete', perName: 'Xóa công ty',               method: 'DELETE',  apiPath: '/api/companies/:id' },

  { perCode: 'organizations.list',   perName: 'Danh sách đơn vị tổ chức', method: 'GET',    apiPath: '/api/organizations' },
  { perCode: 'organizations.create', perName: 'Tạo đơn vị tổ chức',      method: 'POST',   apiPath: '/api/organizations' },
  { perCode: 'organizations.update', perName: 'Cập nhật đơn vị tổ chức', method: 'PUT',    apiPath: '/api/organizations/:id' },
  { perCode: 'organizations.delete', perName: 'Xóa đơn vị tổ chức',     method: 'DELETE',  apiPath: '/api/organizations/:id' },

  { perCode: 'branches.list',   perName: 'Danh sách chi nhánh',    method: 'GET',    apiPath: '/api/branches' },
  { perCode: 'branches.create', perName: 'Tạo chi nhánh',          method: 'POST',   apiPath: '/api/branches' },
  { perCode: 'branches.update', perName: 'Cập nhật chi nhánh',     method: 'PUT',    apiPath: '/api/branches/:id' },
  { perCode: 'branches.delete', perName: 'Xóa chi nhánh',          method: 'DELETE',  apiPath: '/api/branches/:id' },

  { perCode: 'positions.list',           perName: 'Danh sách chức vụ',          method: 'GET',  apiPath: '/api/positions' },
  { perCode: 'positions.create',         perName: 'Tạo chức vụ',               method: 'POST', apiPath: '/api/positions' },
  { perCode: 'positions.import-preview', perName: 'Xem trước import chức vụ',   method: 'POST', apiPath: '/api/positions/import-preview' },
  { perCode: 'positions.import-confirm', perName: 'Xác nhận import chức vụ',    method: 'POST', apiPath: '/api/positions/import-confirm' },
  { perCode: 'positions.update',         perName: 'Cập nhật chức vụ',           method: 'PUT',  apiPath: '/api/positions/:id' },
  { perCode: 'positions.delete',         perName: 'Xóa chức vụ',               method: 'DELETE', apiPath: '/api/positions/:id' },

  // ── Quản lý Nhân sự ──
  { perCode: 'employees.list',           perName: 'Danh sách nhân viên',        method: 'GET',  apiPath: '/api/employees' },
  { perCode: 'employees.create',         perName: 'Tạo nhân viên',             method: 'POST', apiPath: '/api/employees' },
  { perCode: 'employees.import-preview', perName: 'Xem trước import nhân viên', method: 'POST', apiPath: '/api/employees/import-preview' },
  { perCode: 'employees.import-confirm', perName: 'Xác nhận import nhân viên',  method: 'POST', apiPath: '/api/employees/import-confirm' },
  { perCode: 'employees.update',         perName: 'Cập nhật nhân viên',         method: 'PUT',  apiPath: '/api/employees/:id' },
  { perCode: 'employees.delete',         perName: 'Xóa nhân viên',             method: 'DELETE', apiPath: '/api/employees/:id' },

  { perCode: 'viettel-employees.list',   perName: 'Danh sách NV Viettel',   method: 'GET',    apiPath: '/api/viettel-employees' },
  { perCode: 'viettel-employees.create', perName: 'Tạo NV Viettel',         method: 'POST',   apiPath: '/api/viettel-employees' },
  { perCode: 'viettel-employees.update', perName: 'Cập nhật NV Viettel',    method: 'PUT',    apiPath: '/api/viettel-employees/:id' },
  { perCode: 'viettel-employees.delete', perName: 'Xóa NV Viettel',         method: 'DELETE',  apiPath: '/api/viettel-employees/:id' },

  { perCode: 'viettel-branches.list',   perName: 'Danh sách CN Viettel',   method: 'GET',    apiPath: '/api/viettel-branches' },
  { perCode: 'viettel-branches.create', perName: 'Tạo CN Viettel',         method: 'POST',   apiPath: '/api/viettel-branches' },
  { perCode: 'viettel-branches.update', perName: 'Cập nhật CN Viettel',    method: 'PUT',    apiPath: '/api/viettel-branches/:id' },
  { perCode: 'viettel-branches.delete', perName: 'Xóa CN Viettel',         method: 'DELETE',  apiPath: '/api/viettel-branches/:id' },

  // ── Quản lý Mạng ──
  { perCode: 'vlans.list',   perName: 'Danh sách VLAN',   method: 'GET',    apiPath: '/api/vlans' },
  { perCode: 'vlans.create', perName: 'Tạo VLAN',         method: 'POST',   apiPath: '/api/vlans' },
  { perCode: 'vlans.update', perName: 'Cập nhật VLAN',    method: 'PUT',    apiPath: '/api/vlans/:id' },
  { perCode: 'vlans.delete', perName: 'Xóa VLAN',         method: 'DELETE',  apiPath: '/api/vlans/:id' },

  { perCode: 'ip-addresses.list',   perName: 'Danh sách IP',   method: 'GET',    apiPath: '/api/ip-addresses' },
  { perCode: 'ip-addresses.create', perName: 'Tạo IP',         method: 'POST',   apiPath: '/api/ip-addresses' },
  { perCode: 'ip-addresses.update', perName: 'Cập nhật IP',    method: 'PUT',    apiPath: '/api/ip-addresses/:id' },
  { perCode: 'ip-addresses.delete', perName: 'Xóa IP',         method: 'DELETE',  apiPath: '/api/ip-addresses/:id' },

  // ── Quản lý Tài khoản & Phân quyền ──
  { perCode: 'accounts.list',           perName: 'Danh sách tài khoản',       method: 'GET',    apiPath: '/api/accounts' },
  { perCode: 'accounts.create',         perName: 'Tạo tài khoản',             method: 'POST',   apiPath: '/api/accounts' },
  { perCode: 'accounts.update',         perName: 'Cập nhật tài khoản',        method: 'PUT',    apiPath: '/api/accounts/:id' },
  { perCode: 'accounts.reset-password', perName: 'Reset mật khẩu tài khoản',  method: 'PATCH',  apiPath: '/api/accounts/:id/reset-password' },
  { perCode: 'accounts.delete',         perName: 'Xóa tài khoản',             method: 'DELETE',  apiPath: '/api/accounts/:id' },

  { perCode: 'permissions.list',   perName: 'Danh sách quyền',   method: 'GET',    apiPath: '/api/permissions' },
  { perCode: 'permissions.create', perName: 'Tạo quyền',         method: 'POST',   apiPath: '/api/permissions' },
  { perCode: 'permissions.update', perName: 'Cập nhật quyền',    method: 'PUT',    apiPath: '/api/permissions/:id' },
  { perCode: 'permissions.delete', perName: 'Xóa quyền',         method: 'DELETE',  apiPath: '/api/permissions/:id' },

  { perCode: 'roles.list',               perName: 'Danh sách vai trò',       method: 'GET',    apiPath: '/api/roles' },
  { perCode: 'roles.create',             perName: 'Tạo vai trò',             method: 'POST',   apiPath: '/api/roles' },
  { perCode: 'roles.update',             perName: 'Cập nhật vai trò',        method: 'PUT',    apiPath: '/api/roles/:id' },
  { perCode: 'roles.delete',             perName: 'Xóa vai trò',             method: 'DELETE',  apiPath: '/api/roles/:id' },
  { perCode: 'roles.permissions.list',   perName: 'Xem quyền của vai trò',   method: 'GET',    apiPath: '/api/roles/:id/permissions' },
  { perCode: 'roles.permissions.assign', perName: 'Gán quyền cho vai trò',   method: 'POST',   apiPath: '/api/roles/:id/permissions' },

  { perCode: 'account-roles.list',   perName: 'Danh sách gán vai trò',       method: 'GET',    apiPath: '/api/account-roles' },
  { perCode: 'account-roles.create', perName: 'Gán vai trò cho tài khoản',   method: 'POST',   apiPath: '/api/account-roles' },
  { perCode: 'account-roles.delete', perName: 'Thu hồi vai trò',             method: 'DELETE',  apiPath: '/api/account-roles/:id' }
]

// =====================================================================
// Main
// =====================================================================
async function seedPermissions() {
  console.log('🚀 Bắt đầu seed permissions...\n')

  let created = 0
  let updated = 0
  let skipped = 0

  for (const perm of ALL_PERMISSIONS) {
    try {
      const existing = await PRISMA.pERMISSIONS.findFirst({
        where: { perCode: perm.perCode }
      })

      if (existing) {
        // Kiểm tra có thay đổi không
        const needsUpdate =
          existing.method !== perm.method ||
          existing.apiPath !== perm.apiPath ||
          existing.perName !== perm.perName

        if (needsUpdate) {
          await PRISMA.pERMISSIONS.update({
            where: { perId: existing.perId },
            data: {
              method: perm.method,
              apiPath: perm.apiPath,
              perName: perm.perName
            }
          })
          updated++
          console.log(`  ✏️  Updated: ${perm.perCode}`)
        } else {
          skipped++
        }
      } else {
        await PRISMA.pERMISSIONS.create({
          data: {
            perCode: perm.perCode,
            perName: perm.perName,
            method: perm.method,
            apiPath: perm.apiPath,
            status: 'ENABLE'
          }
        })
        created++
        console.log(`  ✅ Created: ${perm.perCode}`)
      }
    } catch (error) {
      console.error(`  ❌ Error [${perm.perCode}]:`, error.message)
    }
  }

  console.log('\n════════════════════════════════════════')
  console.log(`  📊 Kết quả: Created=${created} | Updated=${updated} | Skipped=${skipped}`)
  console.log(`  📋 Tổng permissions trong hệ thống: ${ALL_PERMISSIONS.length}`)
  console.log('════════════════════════════════════════\n')

  await PRISMA.$disconnect()
}

seedPermissions().catch(async (e) => {
  console.error('❌ Seed failed:', e)
  await PRISMA.$disconnect()
  process.exit(1)
})
