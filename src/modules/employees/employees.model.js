import BaseModel from '../../model/index.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('eMPLOYEES', 'employeeId')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listQuery(status, info) {
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

    if (info) {
      return await this.model.findFirst({
        where,
        include: {
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
          viettel: { select: { id: true, viettelId: true, viettelEmail: true, status: true } },
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
                      permissions: {
                        select: {
                          perId: true,
                          perName: true,
                          status: true,
                          notes: true
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
                select: {
                  vlanId: true,
                  vlanName: true,
                  network: true,
                  defaultGateway: true,
                  ipRange: true,
                  status: true
                }
              }
            }
          }
        }
      })
    }

    return await super.LISTQUERY({
      where: Object.keys(where).length ? where : undefined,
      include: {
        position: { select: { id: true, positionId: true, positionName: true, level: true } },
        orgUnit: {
          select: {
            id: true,
            orgUnitId: true,
            unitName: true,
            unitType: true,
            parentUnit: { select: { id: true, orgUnitId: true, unitName: true, unitType: true } }
          }
        },
        viettel: { select: { id: true, viettelId: true, viettelEmail: true } }
      },
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
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

