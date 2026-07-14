import { PRISMA } from '../configs/db.config.js'
import bcrypt from 'bcrypt'
import { saltRoundsPassword } from '../utils/constants.js'

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', saltRoundsPassword)
  await PRISMA.aCCOUNTS.update({
    where: { accountId: 1 },
    data: {
      password: hashedPassword
    }
  })
  console.log('Password for admin@crm.com has been reset to: admin123')
}

main().catch(console.error)
