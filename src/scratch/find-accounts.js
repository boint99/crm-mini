import { PRISMA } from '../configs/db.config.js'

async function main() {
  const accounts = await PRISMA.aCCOUNTS.findMany({
    select: {
      accountId: true,
      accountName: true
    }
  })
  console.log(JSON.stringify(accounts, null, 2))
}

main().catch(console.error)
