import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const PRISMA = new PrismaClient({
  adapter
})

const CONNECT_DB = async (retries = 10) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await PRISMA.$connect()
      console.log('✅ Kết nối Database thành công!')
      return
    } catch (err) {
      if (i === retries) {
        console.error('🚫 Đã thử 10 lần nhưng không thể kết nối Database.')
        throw err
      }
      console.log(`⚠️ Đang thử lại lần ${i}/${retries} (đợi 3s)...`)
      await new Promise(res => setTimeout(res, 3000))
    }
  }
}

export { PRISMA }
export default CONNECT_DB