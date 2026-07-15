import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { v7 as uuidv7 } from 'uuid'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prismaBase = new PrismaClient({
  adapter
})

const PRISMA = prismaBase.$extends({
  query: {
    $allModels: {
      async create({ _model, args, query }) {
        if (args.data && !args.data.id) {
          args.data.id = uuidv7()
        }
        return query(args)
      },
      async createMany({ _model, args, query }) {
        if (Array.isArray(args.data)) {
          for (const item of args.data) {
            if (item && !item.id) {
              item.id = uuidv7()
            }
          }
        } else if (args.data && !args.data.id) {
          args.data.id = uuidv7()
        }
        return query(args)
      },
      async upsert({ _model, args, query }) {
        if (args.create && !args.create.id) {
          args.create.id = uuidv7()
        }
        return query(args)
      }
    }
  }
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
