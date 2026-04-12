import ModelCore from '../core/model.core.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('ACCOUNTS', 'ACCOUNT_ID')
  }

  async lists() {
    return await super.LISTQUERY({
      where: { DELETED_AT: null },
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
    delete account.DELETED_AT
    return account
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'ACCOUNT_CODE')
  }

  async findById(id) {
    return await super.FINDBYFIELD_WHERE({ ACCOUNT_ID: id, DELETED_AT: null })
  }

  async findByUnique(id, field = 'ACCOUNT_ID') {
    return await super.FINDBYUNIQUE(id, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'ACCOUNT_ID', updateData)
  }

  async deleteById(id) {
    return await super.UPDATE(id, 'ACCOUNT_ID', { DELETED_AT: new Date() })
  }
}

export const accountsModel = new AccountsModel()
