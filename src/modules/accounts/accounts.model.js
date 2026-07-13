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
        employeeCode: record.employee.employeeCode,
        firstName: record.employee.firstName,
        lastName: record.employee.lastName,
        company: record.employee.orgUnit?.company ? {
          id: record.employee.orgUnit.company.id,
          companyName: record.employee.orgUnit.company.companyName
        } : undefined
      } : undefined,
      roles: record.accountRoles ? record.accountRoles
        .filter(ar => ar.deletedAt === null && ar.role !== null)
        .map(ar => ({
          roleId: ar.role.roleId,
          roleName: ar.role.roleName,
          roleCode: ar.role.roleCode
        })) : []
    }
  }

  async lists(params = {}, includeDeleted = false) {
    const { page, pageSize, search, status, roleId } = params

    const prismaWhere = {
      deletedAt: includeDeleted ? undefined : null
    }

    if (status) {
      prismaWhere.status = status
    }

    if (params.companyId) {
      prismaWhere.employee = {
        orgUnit: {
          company: {
            id: params.companyId
          }
        }
      }
    }

    if (roleId) {
      prismaWhere.accountRoles = {
        some: {
          roleId: Number(roleId),
          deletedAt: null
        }
      }
    }

    if (search && search.trim()) {
      const keyword = search.trim()
      prismaWhere.OR = [
        { accountName: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ]
    }

    const total = await this.model.count({ where: prismaWhere })

    const findOptions = {
      where: prismaWhere,
      orderBy: { accountId: 'asc' },
      include: {
        employee: {
          select: {
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            orgUnit: {
              select: {
                company: true
              }
            }
          }
        },
        accountRoles: {
          where: { deletedAt: null },
          include: {
            role: true
          }
        }
      }
    }

    if (page !== undefined || pageSize !== undefined) {
      const pageNum = Number(page) || 1
      const sizeNum = Number(pageSize) || 10
      findOptions.skip = (pageNum - 1) * sizeNum
      findOptions.take = sizeNum
    }

    const list = await this.model.findMany(findOptions)

    return {
      total,
      list: list.map(item => this._mapResponse(item))
    }
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

  _resolveFieldAndValue(id, field = null) {
    let prismaField = field
    let queryVal = id

    if (!prismaField) {
      const isUuid = typeof id === 'string' && id.length === 36 && id.includes('-')
      if (isUuid) {
        prismaField = 'id'
      } else if (typeof id === 'string' && isNaN(Number(id))) {
        prismaField = 'accountName'
      } else {
        prismaField = 'accountId'
        queryVal = Number(id)
      }
    } else {
      if (prismaField === 'accountId') {
        queryVal = Number(id)
      }
    }

    return { prismaField, queryVal }
  }

  async findByUnique(id, field = null, includeDeleted = false) {
    const { prismaField, queryVal } = this._resolveFieldAndValue(id, field)

    const record = await this.model.findFirst({
      where: this._buildWhere({ [prismaField]: queryVal }, includeDeleted),
      include: {
        employee: {
          select: {
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            orgUnit: {
              select: {
                company: true
              }
            }
          }
        },
        accountRoles: {
          where: { deletedAt: null },
          include: {
            role: true
          }
        }
      }
    })
    return this._mapResponse(record)
  }

  async updateById(id, updateData, field = null) {
    const prismaData = {}
    if (updateData.password !== undefined) prismaData.password = updateData.password
    if (updateData.isLogin !== undefined) prismaData.isLogin = updateData.isLogin
    if (updateData.login !== undefined && typeof updateData.login !== 'boolean') prismaData.login = Number(updateData.login)
    if (updateData.description !== undefined) prismaData.description = updateData.description
    if (updateData.employeeId !== undefined) prismaData.employeeId = updateData.employeeId ? Number(updateData.employeeId) : null
    if (updateData.status !== undefined) prismaData.status = updateData.status

    const { prismaField, queryVal } = this._resolveFieldAndValue(id, field)

    const record = await super.UPDATE(queryVal, prismaField, prismaData)
    return this._mapResponse(record)
  }

  async softDeleteById(id, field = null) {
    const { prismaField, queryVal } = this._resolveFieldAndValue(id, field)

    const record = await super.UPDATE(queryVal, prismaField, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
    return this._mapResponse(record)
  }


  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }
}

export const accountsModel = new AccountsModel()
