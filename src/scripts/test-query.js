import { PRISMA } from '../configs/db.config.js'

async function run() {
  try {
    console.log('--- TESTING DATABASE QUERY ---')
    const result = await PRISMA.$queryRaw`SELECT 1 as val;`
    console.log('✅ Query succeeded:', result)
    
    const account = await PRISMA.aCCOUNTS.findFirst()
    console.log('✅ Found account:', account ? account.accountName : 'None')
  } catch (err) {
    console.error('❌ Query failed:', err.message)
  } finally {
    await PRISMA.$disconnect()
  }
}

run()
