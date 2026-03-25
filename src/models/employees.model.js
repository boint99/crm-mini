import BaseModel from '../core/model.core.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('eMPLOYEES', 'EMPLOYEE_CODE', 'FIRST_NAME', 'LAST_NAME', 'EMAIL', 'PHONE')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await super.Create({
      data: {
        EMPLOYEE_CODE: data.EMPLOYEE_CODE,
        FIRST_NAME: data.FIRST_NAME,
        LAST_NAME: data.LAST_NAME,
        EMAIL: data.EMAIL,
        PHONE: data.PHONE,
        BIRTH_DATE: data.BIRTH_DATE,
        POSITION_ID: data.POSITION_ID
      }
    })
  }

  async findByName(name) {
    return await super.findFirst({
      where: { EMPLOYEE_CODE: name }
    })
  }

  async updateById(id, updateData) {
    return await super.UpdateById(id, updateData, 'EMPLOYEE_ID')
  }

  async findById(id) {
    return await super.FindById(id, 'EMPLOYEE_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'EMPLOYEE_ID')
  }
}

export const employeesModel = new EmployeesModel()

