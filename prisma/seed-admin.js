import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { v7 as uuidv7 } from 'uuid'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function seedSuperAdmin() {
  const ACCOUNT_NAME = 'admin@crm.local'
  const PASSWORD = 'Admin@123'
  const SALT_ROUNDS = 10

  // Kiểm tra đã tồn tại chưa
  const existing = await prisma.aCCOUNTS.findFirst({
    where: { accountName: ACCOUNT_NAME }
  })

  if (existing) {
    console.log(`⚠️  Account "${ACCOUNT_NAME}" đã tồn tại (ACCOUNT_ID: ${existing.accountId})`)
    console.log('   Cập nhật lại password và trạng thái...')

    await prisma.aCCOUNTS.update({
      where: { accountId: existing.accountId },
      data: {
        password: await bcrypt.hash(PASSWORD, SALT_ROUNDS),
        isLogin: true,
        status: 'ENABLE',
        deletedAt: null
      }
    })

    console.log('✅ Đã cập nhật superadmin!')
    console.log(`   Username: ${ACCOUNT_NAME}`)
    console.log(`   Password: ${PASSWORD}`)
    await prisma.$disconnect()
    return
  }

  // Tạo mới
  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS)

  const account = await prisma.aCCOUNTS.create({
    data: {
      id: uuidv7(),
      accountName: ACCOUNT_NAME,
      password: hashedPassword,
      isLogin: true,
      login: 0,
      status: 'ENABLE'
    }
  })

  console.log('✅ Tạo superadmin thành công!')
  console.log(`   ACCOUNT_ID: ${account.accountId}`)
  console.log(`   Email:      ${ACCOUNT_NAME}`)
  console.log(`   Password:   ${PASSWORD}`)
  console.log(`   IS_LOGIN:   true`)
  console.log(`   STATUS:     ENABLE`)

  await prisma.$disconnect()
}

seedSuperAdmin().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
