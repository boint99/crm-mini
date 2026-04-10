import ModelCore from '../core/model.core.js'
import { PRISMA } from '../configs/db.config.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('ACCOUNTS', 'ACCOUNT_ID')
  }

  async listAll() {
    return await PRISMA.ACCOUNTS.findMany({
      orderBy: { ACCOUNT_ID: 'asc' },
      include: {
        EMPLOYEE: {
          select: {
            EMPLOYEE_ID: true,
            NAME: true,
            EMPLOYEE_CODE: true
          }
        }
      }
    })
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'ACCOUNT_CODE')
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'ACCOUNT_ID')
  }

  async updateById(id, updateData) {
    return await PRISMA.ACCOUNTS.update({
      where: { ACCOUNT_ID: id },
      data: updateData,
      include: {
        EMPLOYEE: {
          select: {
            EMPLOYEE_ID: true,
            NAME: true,
            EMPLOYEE_CODE: true
          }
        }
      }
    })
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'ACCOUNT_ID')
  }
}

export const accountsModel = new AccountsModel()
