import ModelCore from '../../model/index.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('aCCOUNTS', 'accountId')
  }

  _mapToUpper(record) {
    if (!record) return null
    return {
      ACCOUNT_ID: record.accountId,
      ACCOUNT_NAME: record.accountName,
      PASSWORD: record.password,
      IS_LOGIN: record.isLogin,
      LOGIN: record.login,
      DESCRIPTION: record.description,
      EMPLOYEE_ID: record.employeeId,
      STATUS: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      EMPLOYEE: record.employee ? {
        EMPLOYEE_ID: record.employee.employeeId,
        FIRST_NAME: record.employee.firstName,
        LAST_NAME: record.employee.lastName
      } : null
    }
  }

  async lists(where = null, includeDeleted = false) {
    const prismaWhere = {}
    if (where) {
      if (where.ACCOUNT_NAME !== undefined) prismaWhere.accountName = where.ACCOUNT_NAME
      if (where.EMPLOYEE_ID !== undefined) prismaWhere.employeeId = Number(where.EMPLOYEE_ID)
      if (where.STATUS !== undefined) prismaWhere.status = where.STATUS
    }

    const list = await super.LISTQUERY(
      {
        where: Object.keys(prismaWhere).length ? prismaWhere : undefined,
        include: {
          employee: {
            select: {
              employeeId: true,
              firstName: true,
              lastName: true
            }
          }
        }
      },
      includeDeleted
    )
    return list.map(item => this._mapToUpper(item))
  }

  async create(createData) {
    const prismaData = {
      accountName: createData.ACCOUNT_NAME,
      password: createData.PASSWORD,
      isLogin: createData.IS_LOGIN || false,
      login: createData.LOGIN || 0,
      description: createData.DESCRIPTION,
      employeeId: createData.EMPLOYEE_ID ? Number(createData.EMPLOYEE_ID) : null,
      status: createData.STATUS || 'ENABLE'
    }
    const record = await super.CREATE(prismaData)
    return this._mapToUpper(record)
  }

  async findByUnique(id, field = 'ACCOUNT_ID', includeDeleted = false) {
    let prismaField = 'accountId'
    let queryVal = id
    if (field === 'ACCOUNT_NAME') {
      prismaField = 'accountName'
    } else {
      queryVal = Number(id)
    }

    const record = await super.FINDBYFIELD_WHERE(
      { [prismaField]: queryVal },
      includeDeleted
    )
    return this._mapToUpper(record)
  }

  async updateById(id, updateData, field = 'ACCOUNT_ID') {
    const prismaData = {}
    if (updateData.PASSWORD !== undefined) prismaData.password = updateData.PASSWORD
    if (updateData.IS_LOGIN !== undefined) prismaData.isLogin = updateData.IS_LOGIN
    if (updateData.LOGIN !== undefined) prismaData.login = updateData.LOGIN
    if (updateData.DESCRIPTION !== undefined) prismaData.description = updateData.DESCRIPTION
    if (updateData.EMPLOYEE_ID !== undefined) prismaData.employeeId = updateData.EMPLOYEE_ID ? Number(updateData.EMPLOYEE_ID) : null
    if (updateData.STATUS !== undefined) prismaData.status = updateData.STATUS

    let prismaField = 'accountId'
    if (field === 'ACCOUNT_NAME') prismaField = 'accountName'

    const record = await super.UPDATE(Number(id), prismaField, prismaData)
    return this._mapToUpper(record)
  }

  async softDeleteById(id, field = 'ACCOUNT_ID') {
    let prismaField = 'accountId'
    if (field === 'ACCOUNT_NAME') prismaField = 'accountName'

    const record = await super.UPDATE(Number(id), prismaField, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
    return this._mapToUpper(record)
  }
}

export const accountsModel = new AccountsModel()
