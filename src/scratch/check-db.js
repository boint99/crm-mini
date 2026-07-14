import { PRISMA } from '../configs/db.config.js'

async function main() {
  console.log('--- Clearing Admin Account Avatar in DB ---')
  const updatedAccount = await PRISMA.aCCOUNTS.update({
    where: { accountName: 'admin@vienthongact.vn' },
    data: {
      avatar: null
    }
  })
  console.log(`Cleared Avatar in Account ID: ${updatedAccount.accountId}, New Avatar: ${updatedAccount.avatar}`)
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await PRISMA.$disconnect()
  })
