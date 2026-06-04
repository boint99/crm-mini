import ModelCore from '../../model/index.js'

class AccountsModel extends ModelCore {
  constructor() {
    super('aCCOUNTS', 'accountId')
  }

  /**
   * Map Prisma record → response theo đúng schema SQL
   * Field names khớp với @map() trong Prisma schema
   */
  _mapResponse(record) {
    if (!record) return null
    return {
      accountId: record.accountId,
      accountName: record.accountName,
      password: record.password,
      isLogin: record.isLogin,
      login: record.login,
      description: record.description,
      employeeId: record.employeeId,
      status: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      employee: record.employee ? {
        employeeId: record.employee.employeeId,
        firstName: record.employee.firstName,
        lastName: record.employee.lastName
      } : undefined
    }
  }

  async lists(where = null, includeDeleted = false) {
    const prismaWhere = {}
    if (where) {
      if (where.accountName !== undefined) prismaWhere.accountName = where.accountName
      if (where.employeeId !== undefined) prismaWhere.employeeId = Number(where.employeeId)
      if (where.status !== undefined) prismaWhere.status = where.status
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
    return list.map(item => this._mapResponse(item))
  }

  async create(createData) {
    const prismaData = {
      accountName: createData.accountName,
      password: createData.password,
      isLogin: createData.isLogin || false,
      login: createData.login || 0,
      description: createData.description,
      employeeId: createData.employeeId ? Number(createData.employeeId) : null,
      status: createData.status || 'ENABLE'
    }
    const record = await super.CREATE(prismaData)
    return this._mapResponse(record)
  }

  async findByUnique(id, field = 'accountId', includeDeleted = false) {
    let prismaField = 'accountId'
    let queryVal = id
    if (field === 'accountName') {
      prismaField = 'accountName'
    } else {
      queryVal = Number(id)
    }

    const record = await super.FINDBYFIELD_WHERE(
      { [prismaField]: queryVal },
      includeDeleted
    )
    return this._mapResponse(record)
  }

  async updateById(id, updateData, field = 'accountId') {
    const prismaData = {}
    if (updateData.password !== undefined) prismaData.password = updateData.password
    if (updateData.isLogin !== undefined) prismaData.isLogin = updateData.isLogin
    if (updateData.login !== undefined) prismaData.login = updateData.login
    if (updateData.description !== undefined) prismaData.description = updateData.description
    if (updateData.employeeId !== undefined) prismaData.employeeId = updateData.employeeId ? Number(updateData.employeeId) : null
    if (updateData.status !== undefined) prismaData.status = updateData.status

    let prismaField = 'accountId'
    if (field === 'accountName') prismaField = 'accountName'

    const record = await super.UPDATE(Number(id), prismaField, prismaData)
    return this._mapResponse(record)
  }

  async softDeleteById(id, field = 'accountId') {
    let prismaField = 'accountId'
    if (field === 'accountName') prismaField = 'accountName'

    const record = await super.UPDATE(Number(id), prismaField, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
    return this._mapResponse(record)
  }
}

export const accountsModel = new AccountsModel()
