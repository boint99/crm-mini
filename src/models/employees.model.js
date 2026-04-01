import BaseModel from '../core/model.core.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('EMPLOYEES', 'EMPLOYEE_CODE')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listQuery(status) {
    return await super.LISTQUERY({
      where: status ? { STATUS: status } : undefined,
      include: {
        POSITION: { select: { POSITION_ID: true, POSITION_NAME: true, LEVEL: true } },
        ORG_UNIT: { select: { ORG_UNIT_ID: true, UNIT_NAME: true, UNIT_TYPE: true } },
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

