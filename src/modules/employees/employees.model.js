import BaseModel from '../../model/index.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('eMPLOYEES', 'employeeId')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listQuery(status, info, unitId, companyId, branchId, search, page, limit) {
    const where = {
      ...(status ? { status } : {})
    }

    if (info) {
      const isUuid = typeof info === 'string' && info.length === 36 && info.includes('-')
      const isNumber = !isNaN(Number(info))
      if (isUuid) {
        where.id = info
      } else if (isNumber) {
        where.employeeId = Number(info)
      } else {
        where.employeeCode = info
      }
    }

    // Filter theo company/unit/branch thông qua relation orgUnit
    if (unitId || companyId || branchId) {
      where.orgUnit = {
        ...(unitId ? { id: unitId } : {}),
        ...(companyId ? { company: { id: companyId } } : {}),
        ...(branchId ? { branch: { id: branchId } } : {})
      }
    }

    // Search theo employeeCode, firstName, lastName, email (case-insensitive)
    if (search && search.trim()) {
      const keywords = search.trim().split(/\s+/)
      const searchConditions = keywords.map(keyword => ({
        OR: [
          { employeeCode: { contains: keyword, mode: 'insensitive' } },
          { firstName: { contains: keyword, mode: 'insensitive' } },
          { lastName: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } }
        ]
      }))
      where.AND = [...(where.AND || []), ...searchConditions]
    }

    if (info) {
      return await this.model.findFirst({
        where,
        select: {
          id: true,
          employeeId: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          birthDate: true,
          description: true,
          status: true,
          position: { select: { id: true, positionId: true, positionName: true, level: true, status: true } },
          orgUnit: {
            select: {
              id: true,
              orgUnitId: true,
              unitName: true,
              unitType: true,
              status: true,
              companyId: true,
              parentUnitId: true,
              branchId: true,
              parentUnit: { select: { id: true, orgUnitId: true, unitName: true, unitType: true } },
              childUnits: { select: { id: true, orgUnitId: true, unitName: true, unitType: true, status: true } },
              branch: { select: { id: true, branchId: true, branchName: true, location: true, status: true } }
            }
          },
          viettel: { select: { id: true, viettelId: true, viettelCode: true, viettelEmail: true, status: true } },
          accounts: {
            select: {
              accountId: true,
              isLogin: true,
              login: true,
              status: true,
              accountRoles: {
                select: {
                  arId: true,
                  role: {
                    select: {
                      roleId: true,
                      roleName: true,
                      description: true,
                      status: true,
                      rolePermissions: {
                        select: {
                          permission: { select: { perId: true, perName: true, status: true, notes: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          ips: {
            select: {
              ipId: true,
              host: true,
              deviceType: true,
              status: true,
              vlan: {
                select: { vlanId: true, vlanName: true, network: true, defaultGateway: true, ipRange: true, status: true }
              }
            }
          }
        }
      })
    }

    const pageNum = page ? Number(page) : undefined
    const limitNum = limit ? Number(limit) : undefined

    const findOptions = {
      where: Object.keys(where).length ? where : undefined,
      include: {
        position: { select: { id: true, positionId: true, positionName: true, level: true } },
        orgUnit: {
          select: {
            id: true,
            orgUnitId: true,
            unitName: true,
            unitType: true,
            parentUnit: { select: { id: true, orgUnitId: true, unitName: true, unitType: true } },
            company: { select: { id: true, companyId: true, companyName: true } },
            branch: { select: { id: true, branchId: true, branchName: true } }
          }
        },
        viettel: { select: { id: true, viettelId: true, viettelEmail: true } }
      },
      orderBy: { [this.defaultOrderBy]: 'asc' }
    }

    const total = await this.model.count({
      where: this._buildWhere(Object.keys(where).length ? where : undefined)
    })

    if (pageNum !== undefined && limitNum !== undefined) {
      const maxPage = Math.max(1, Math.ceil(total / limitNum))
      const correctedPage = pageNum > maxPage ? maxPage : pageNum
      findOptions.skip = (correctedPage - 1) * limitNum
      findOptions.take = limitNum
    }

    const list = await super.LISTQUERY(findOptions)

    return {
      total,
      list
    }
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByUnique(id, field = 'id') {
    return await super.FINDBYUNIQUE(id, field)
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'id', updateData)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'id')
  }
}

export const employeesModel = new EmployeesModel()

