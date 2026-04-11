import ModelCore from '../core/model.core.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('ACCOUNTS', 'ACCOUNT_ID')
  }

  async lists() {
    return await super.LISTQUERY({
      orderBy: { ACCOUNT_ID: 'asc' },
      include: {
        EMPLOYEE: {
          select: {
            EMPLOYEE_ID: true,
            FIRST_NAME: true,
            LAST_NAME: true,
            EMPLOYEE_CODE: true
          }
        }
      }
    })
  }

  async create(createData) {
    const account = await super.CREATE(createData)

    delete account.PASSWORD
    delete account.DELETE_AT
    return account
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'ACCOUNT_CODE')
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'ACCOUNT_ID')
  }

  async findByUnique(id, field = 'ACCOUNT_ID') {
    return await super.FINDBYUNIQUE(id, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'ACCOUNT_ID', updateData)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'ACCOUNT_ID')
  }
}

export const accountsModel = new AccountsModel()
