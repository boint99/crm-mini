import { PRISMA } from '../configs/db.config.js'

async function run() {
  try {
    console.log('--- ALTERING DATABASE SCHEMA ---')
    await PRISMA.$executeRawUnsafe(`
      ALTER TABLE "ACCOUNTS" ADD COLUMN IF NOT EXISTS "AVATAR" VARCHAR(255);
    `)
    await PRISMA.$executeRawUnsafe(`
      ALTER TABLE "ACCOUNTS" ADD COLUMN IF NOT EXISTS "NOTIFICATION_SETTINGS" JSONB;
    `)
    console.log('✅ Altered table ACCOUNTS successfully!')
  } catch (err) {
    console.error('❌ Error altering database:', err.message)
  } finally {
    await PRISMA.$disconnect()
  }
}

run()
