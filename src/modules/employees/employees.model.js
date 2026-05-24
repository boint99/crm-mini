import BaseModel from '../../model/index.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('eMPLOYEES', 'employeeId')
  }

  _mapToUpper(record) {
    if (!record) return null
    return {
      EMPLOYEE_ID: record.employeeId,
      FIRST_NAME: record.firstName,
      LAST_NAME: record.lastName,
      PHONE: record.phone,
      EMAIL: record.email,
      BIRTH_DATE: record.birthDate,
      STATUS: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      POSITION: record.position ? {
        POSITION_ID: record.position.positionId,
        POSITION_NAME: record.position.positionName,
        LEVEL: record.position.level,
        STATUS: record.position.status
      } : null,
      ORG_UNIT: record.orgUnit ? {
        ORG_UNIT_ID: record.orgUnit.orgUnitId,
        UNIT_NAME: record.orgUnit.unitName,
        UNIT_TYPE: record.orgUnit.unitType,
        STATUS: record.orgUnit.status,
        PARENT_UNIT: record.orgUnit.parentUnit ? {
          ORG_UNIT_ID: record.orgUnit.parentUnit.orgUnitId,
          UNIT_NAME: record.orgUnit.parentUnit.unitName,
          UNIT_TYPE: record.orgUnit.parentUnit.unitType
        } : null,
        CHILD_UNITS: record.orgUnit.childUnits ? record.orgUnit.childUnits.map(cu => ({
          ORG_UNIT_ID: cu.orgUnitId,
          UNIT_NAME: cu.unitName,
          UNIT_TYPE: cu.unitType,
          STATUS: cu.status
        })) : [],
        BRANCH: record.orgUnit.branch ? {
          BRANCH_ID: record.orgUnit.branch.branchId,
          BRANCH_NAME: record.orgUnit.branch.branchName,
          LOCATION: record.orgUnit.branch.location,
          STATUS: record.orgUnit.branch.status
        } : null
      } : null,
      VIETTEL: record.viettel ? {
        VIETTEL_ID: record.viettel.viettelId,
        VIETTEL_EMAIL: record.viettel.viettelEmail,
        STATUS: record.viettel.status
      } : null,
      ACCOUNTS: record.accounts ? record.accounts.map(acc => ({
        ACCOUNT_ID: acc.accountId,
        IS_LOGIN: acc.isLogin,
        LOGIN: acc.login,
        STATUS: acc.status,
        ACCOUNT_ROLES: acc.accountRoles ? acc.accountRoles.map(ar => ({
          AR_ID: ar.arId,
          ROLE: ar.role ? {
            ROLE_ID: ar.role.roleId,
            ROLE_NAME: ar.role.roleName,
            DESCRIPTION: ar.role.description,
            STATUS: ar.role.status,
            PERMISSIONS: ar.role.permissions ? ar.role.permissions.map(p => ({
              PER_ID: p.perId,
              PER_NAME: p.perName,
              STATUS: p.status,
              NOTES: p.notes
            })) : []
          } : null
        })) : []
      })) : [],
      IPS: record.ips ? record.ips.map(ip => ({
        IP_ID: ip.ipId,
        HOST: ip.host,
        DEVICE_TYPE: ip.deviceType,
        STATUS: ip.status,
        VLAN: ip.vlan ? {
          VLAN_ID: ip.vlan.vlanId,
          VLAN_NAME: ip.vlan.vlanName,
          NETWORK: ip.vlan.network,
          DEFAULT_GATEWAY: ip.vlan.defaultGateway,
          IP_RANGE: ip.vlan.ipRange,
          STATUS: ip.vlan.status
        } : null
      })) : []
    }
  }

  async lists() {
    const list = await super.LISTALL()
    return list.map(item => this._mapToUpper(item))
  }

  async listQuery(status, info) {
    const where = {
      ...(status ? { status: status } : {}),
      ...(info ? { employeeId: Number(info) } : {})
    }

    if (info) {
      const record = await this.model.findFirst({
        where,
        include: {
          position: { select: { positionId: true, positionName: true, level: true, status: true } },
          orgUnit: {
            select: {
              orgUnitId: true,
              unitName: true,
              unitType: true,
              status: true,
              companyId: true,
              parentUnitId: true,
              branchId: true,
              parentUnit: { select: { orgUnitId: true, unitName: true, unitType: true } },
              childUnits: { select: { orgUnitId: true, unitName: true, unitType: true, status: true } },
              branch: { select: { branchId: true, branchName: true, location: true, status: true } }
            }
          },
          viettel: { select: { viettelId: true, viettelEmail: true, status: true } },
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
      return this._mapToUpper(record)
    }

    const list = await super.LISTQUERY({
      where: Object.keys(where).length ? where : undefined,
      include: {
        position: { select: { positionId: true, positionName: true, level: true } },
        orgUnit: {
          select: {
            orgUnitId: true,
            unitName: true,
            unitType: true,
            parentUnit: { select: { orgUnitId: true, unitName: true, unitType: true } }
          }
        },
        viettel: { select: { viettelId: true, viettelEmail: true } }
      },
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
    return list.map(item => this._mapToUpper(item))
  }

  async create(createData) {
    const { ORG_UNIT_ID, POSITION_ID, VIETTEL_ID, ...rest } = createData

    const payload = {
      firstName: rest.FIRST_NAME,
      lastName: rest.LAST_NAME,
      phone: rest.PHONE,
      email: rest.EMAIL ? rest.EMAIL.toLowerCase() : undefined,
      birthDate: rest.BIRTH_DATE ? new Date(rest.BIRTH_DATE) : undefined,
      status: rest.STATUS || 'ENABLE',
      unitId: ORG_UNIT_ID ? Number(ORG_UNIT_ID) : undefined,
      positionId: POSITION_ID ? Number(POSITION_ID) : undefined,
      viettelId: VIETTEL_ID ? Number(VIETTEL_ID) : undefined
    }

    const record = await super.CREATE(payload)
    return this._mapToUpper(record)
  }

  async updateById(id, updateData) {
    const { ORG_UNIT_ID, POSITION_ID, VIETTEL_ID, ...rest } = updateData
    const payload = {}
    if (rest.FIRST_NAME !== undefined) payload.firstName = rest.FIRST_NAME
    if (rest.LAST_NAME !== undefined) payload.lastName = rest.LAST_NAME
    if (rest.PHONE !== undefined) payload.phone = rest.PHONE
    if (rest.EMAIL !== undefined) payload.email = rest.EMAIL ? rest.EMAIL.toLowerCase() : undefined
    if (rest.BIRTH_DATE !== undefined) payload.birthDate = rest.BIRTH_DATE ? new Date(rest.BIRTH_DATE) : undefined
    if (rest.STATUS !== undefined) payload.status = rest.STATUS

    if (ORG_UNIT_ID !== undefined) payload.unitId = ORG_UNIT_ID ? Number(ORG_UNIT_ID) : null
    if (POSITION_ID !== undefined) payload.positionId = POSITION_ID ? Number(POSITION_ID) : null
    if (VIETTEL_ID !== undefined) payload.viettelId = VIETTEL_ID ? Number(VIETTEL_ID) : null

    const record = await super.UPDATE(id, 'employeeId', payload)
    return this._mapToUpper(record)
  }

  async findById(id) {
    const record = await super.FINDBYUNIQUE(id, 'employeeId')
    return this._mapToUpper(record)
  }

  async findbyField(value, field) {
    let prismaField = field
    if (field === 'EMAIL') prismaField = 'email'
    if (field === 'PHONE') prismaField = 'phone'
    const record = await super.FINDBYFIELD(value, prismaField)
    return this._mapToUpper(record)
  }

  async deleteById(id) {
    const record = await super.DELETEBYID(id, 'employeeId')
    return this._mapToUpper(record)
  }
}

export const employeesModel = new EmployeesModel()

