import ModelCore from '../core/model.core.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('ACCOUNTS', 'ACCOUNT_ID')
  }

  async lists(where = null, includeDeleted = false) {
    return await super.LISTQUERY(
      {
        where,
        include: {
          EMPLOYEE: {
            select: {
              EMPLOYEE_ID: true,
              EMPLOYEE_CODE: true,
              FIRST_NAME: true,
              LAST_NAME: true
            }
          }
        }
      },
      includeDeleted
    )
  }

  async create(createData) {
    return await super.CREATE(createData)
  }

  async findByUnique(id, includeDeleted = false) {
    return await super.FINDBYFIELD_WHERE(
      { ACCOUNT_ID: id },
      includeDeleted
    )
  }

  async updateById(id, updateData, field = 'ACCOUNT_ID') {
    return await super.UPDATE(id, updateData, field)
  }

  async softDeleteById(id, field = 'ACCOUNT_ID') {
    return await super.UPDATE(id, {
      DELETED_AT: new Date(),
      STATUS: 'DISABLED'
    }, field)
  }
}

export const accountsModel = new AccountsModel()