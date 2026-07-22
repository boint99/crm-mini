/**
 * Script gán toàn bộ Permissions cho ADMIN_ROLE (roleId=1)
 *
 * Chạy: npm run seed:assign-permissions
 * Idempotent: chỉ gán permission chưa tồn tại, bỏ qua nếu đã gán
 */
import { PRISMA } from '../configs/db.config.js'

async function assignAllPermissionsToAdminRole() {
  const ADMIN_ROLE_ID = 1
  const GRANTED_BY_ACCOUNT_ID = 1 // Super Admin

  console.log('🚀 Bắt đầu gán permissions cho ADMIN_ROLE...\n')

  // 1. Kiểm tra ADMIN_ROLE tồn tại
  const adminRole = await PRISMA.rOLES.findUnique({
    where: { roleId: ADMIN_ROLE_ID }
  })

  if (!adminRole) {
    console.error('❌ ADMIN_ROLE (roleId=1) chưa tồn tại. Chạy setup-superadmin trước.')
    await PRISMA.$disconnect()
    process.exit(1)
  }

  // 2. Kiểm tra Super Admin account tồn tại
  const superAdmin = await PRISMA.aCCOUNTS.findUnique({
    where: { accountId: GRANTED_BY_ACCOUNT_ID }
  })

  if (!superAdmin) {
    console.error('❌ Super Admin (accountId=1) chưa tồn tại. Chạy setup-superadmin trước.')
    await PRISMA.$disconnect()
    process.exit(1)
  }

  // 3. Lấy toàn bộ permissions active
  const allPermissions = await PRISMA.pERMISSIONS.findMany({
    where: { status: 'ENABLE', deletedAt: null }
  })

  console.log(`  📋 Tổng permissions trong DB: ${allPermissions.length}`)

  // 4. Lấy danh sách permissions đã gán cho ADMIN_ROLE
  const existingAssignments = await PRISMA.rOLE_PERMISSIONS.findMany({
    where: { roleId: ADMIN_ROLE_ID, deletedAt: null }
  })

  const existingPerIds = new Set(existingAssignments.map(rp => rp.perId))

  let created = 0
  let skipped = 0

  for (const perm of allPermissions) {
    if (existingPerIds.has(perm.perId)) {
      skipped++
      continue
    }

    try {
      await PRISMA.rOLE_PERMISSIONS.create({
        data: {
          roleId: ADMIN_ROLE_ID,
          perId: perm.perId,
          grantedBy: GRANTED_BY_ACCOUNT_ID
        }
      })
      created++
      console.log(`  ✅ Gán: ${perm.perCode} (${perm.method} ${perm.apiPath})`)
    } catch (error) {
      console.error(`  ❌ Lỗi [${perm.perCode}]:`, error.message)
    }
  }

  console.log('\n════════════════════════════════════════')
  console.log(`  📊 Kết quả: Gán mới=${created} | Đã có=${skipped}`)
  console.log(`  🔑 Role: ${adminRole.roleName} (roleId=${ADMIN_ROLE_ID})`)
  console.log('════════════════════════════════════════\n')

  await PRISMA.$disconnect()
}

assignAllPermissionsToAdminRole().catch(async (e) => {
  console.error('❌ Assign failed:', e)
  await PRISMA.$disconnect()
  process.exit(1)
})
