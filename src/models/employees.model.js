import BaseModel from '../core/model.core.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('EMPLOYEES', 'EMPLOYEE_CODE')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listQuery(status, info) {
    const where = {
      ...(status ? { STATUS: status } : {}),
      ...(info ? { EMPLOYEE_ID: Number(info) } : {})
    }

    if (info) {
      return await this.model.findFirst({
        where,
        include: {
          POSITION: { select: { POSITION_ID: true, POSITION_CODE: true, POSITION_NAME: true, LEVEL: true, STATUS: true } },
          ORG_UNIT: {
            select: {
              ORG_UNIT_ID: true,
              UNIT_CODE: true,
              UNIT_NAME: true,
              UNIT_TYPE: true,
              STATUS: true,
              DIVISION: {
                select: {
                  DIVISION_ID: true,
                  DIVISION_CODE: true,
                  DIVISION_NAME: true,
                  STATUS: true,
                  COMPANY: {
                    select: {
                      COMPANY_ID: true,
                      COMPANY_CODE: true,
                      COMPANY_NAME: true,
                      STATUS: true
                    }
                  }
                }
              },
              PARENT_UNIT: { select: { ORG_UNIT_ID: true, UNIT_CODE: true, UNIT_NAME: true, UNIT_TYPE: true } },
              CHILD_UNITS: { select: { ORG_UNIT_ID: true, UNIT_CODE: true, UNIT_NAME: true, UNIT_TYPE: true, STATUS: true } },
              BRANCH: { select: { BRANCH_ID: true, BRANCH_CODE: true, BRANCH_NAME: true, LOCATION: true, STATUS: true } }
            }
          },
          VIETTEL: { select: { VIETTEL_ID: true, VIETTEL_CODE: true, VIETTEL_EMAIL: true, STATUS: true } },
          ACCOUNTS: {
            select: {
              ACCOUNT_ID: true,
              ACCOUNT_CODE: true,
              IS_LOGIN: true,
              LOGIN: true,
              STATUS: true,
              ACCOUNT_ROLES: {
                select: {
                  AR_ID: true,
                  AR_CODE: true,
                  ROLE: {
                    select: {
                      ROLE_ID: true,
                      ROLE_CODE: true,
                      ROLE_NAME: true,
                      DESCRIPTION: true,
                      STATUS: true,
                      PERMISSIONS: {
                        select: {
                          PER_ID: true,
                          PER_CODE: true,
                          PER_NAME: true,
                          STATUS: true,
                          NOTES: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          IPS: {
            select: {
              IP_ID: true,
              HOST: true,
              DEVICE_TYPE: true,
              STATUS: true,
              VLAN: {
                select: {
                  VLAN_ID: true,
                  VLAN_CODE: true,
                  VLAN_NAME: true,
                  NETWORK: true,
                  DEFAULT_GATEWAY: true,
                  IP_RANGE: true,
                  STATUS: true
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
        POSITION: { select: { POSITION_ID: true, POSITION_NAME: true, LEVEL: true } },
        ORG_UNIT: {
          select: {
            ORG_UNIT_ID: true,
            UNIT_NAME: true,
            UNIT_TYPE: true,
            PARENT_UNIT: { select: { ORG_UNIT_ID: true, UNIT_NAME: true, UNIT_TYPE: true } }
          }
        },
        VIETTEL: { select: { VIETTEL_ID: true, VIETTEL_CODE: true, VIETTEL_EMAIL: true } }
      },
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
  }

  async create(createData) {
    const { ORG_UNIT_ID, POSITION_ID, VIETTEL_ID, ...rest } = createData

    const payload = {
      ...rest,
      EMAIL: rest.EMAIL ? rest.EMAIL.toLowerCase() : undefined,
      BIRTH_DATE: rest.BIRTH_DATE ? new Date(rest.BIRTH_DATE) : undefined,
      ORG_UNIT: ORG_UNIT_ID ? { connect: { ORG_UNIT_ID: Number(ORG_UNIT_ID) } } : undefined,
      POSITION: POSITION_ID ? { connect: { POSITION_ID: Number(POSITION_ID) } } : undefined,
      VIETTEL: VIETTEL_ID ? { connect: { VIETTEL_ID: Number(VIETTEL_ID) } } : undefined
    }

    return await super.CREATE(payload)
  }
  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'EMPLOYEE_CODE')
  }

  async updateById(id, updateData) {
    const { ORG_UNIT_ID, POSITION_ID, VIETTEL_ID, ...rest } = updateData
    const payload = {
      ...rest,
      EMAIL: rest.EMAIL ? rest.EMAIL.toLowerCase() : undefined,
      BIRTH_DATE: rest.BIRTH_DATE ? new Date(rest.BIRTH_DATE) : undefined,
      ORG_UNIT: ORG_UNIT_ID ? { connect: { ORG_UNIT_ID: Number(ORG_UNIT_ID) } } : undefined,
      POSITION: POSITION_ID ? { connect: { POSITION_ID: Number(POSITION_ID) } } : undefined,
      VIETTEL: VIETTEL_ID ? { connect: { VIETTEL_ID: Number(VIETTEL_ID) } } : undefined
    }

    return await super.UPDATE(id, 'EMPLOYEE_ID', payload)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'EMPLOYEE_ID')
  }
  async findbyField (id, field) {
    return await super.FINDBYFIELD(id, field)
  }
  async deleteById(id) {
    return await super.DELETEBYID(id, 'EMPLOYEE_ID')
  }
}

export const employeesModel = new EmployeesModel()

