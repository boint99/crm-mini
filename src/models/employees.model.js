import BaseModel from '../core/model.core.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('EMPLOYEES', 'EMPLOYEE_CODE')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    const createData = { ...data }
    if (createData.EMAIL) createData.EMAIL = createData.EMAIL.toLowerCase()
    if (createData.BIRTH_DATE) createData.BIRTH_DATE = new Date(createData.BIRTH_DATE)
    return await super.CREATE(createData)
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'EMPLOYEE_CODE')
  }

  async updateById(id, updateData) {
    const payload = { ...updateData }
    if (payload.EMAIL) payload.EMAIL = payload.EMAIL.toLowerCase()
    if (payload.BIRTH_DATE) payload.BIRTH_DATE = new Date(payload.BIRTH_DATE)
    return await super.UPDATE(id, 'EMPLOYEE_ID', payload)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'EMPLOYEE_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'EMPLOYEE_ID')
  }
}

export const employeesModel = new EmployeesModel()

