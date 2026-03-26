import BaseModel from '../core/model.core.js'

class EmployeesModel extends BaseModel {
  constructor() {
    super('eMPLOYEES', 'EMPLOYEE_CODE', 'FIRST_NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'BIRTH_DATE', 'POSITION_ID')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await super.Create({
      EMPLOYEE_CODE: data.EMPLOYEE_CODE,
      FIRST_NAME: data.FIRST_NAME,
      LAST_NAME: data.LAST_NAME,
      EMAIL: data.EMAIL ? data.EMAIL.toLowerCase() : null,
      PHONE: data.PHONE,
      BIRTH_DATE: data.BIRTH_DATE
        ? new Date(data.BIRTH_DATE)
        : null,
      POSITION_ID: data.POSITION_ID
    })
  }

  async findByName(name) {
    return await super.FindByField(name, 'EMPLOYEE_CODE')
  }

  async updateById(id, updateData) {
    return await super.Update(id, 'EMPLOYEE_ID', {
      EMPLOYEE_CODE: updateData.EMPLOYEE_CODE,
      FIRST_NAME: updateData.FIRST_NAME,
      LAST_NAME: updateData.LAST_NAME,
      EMAIL: updateData.EMAIL ? updateData.EMAIL.toLowerCase() : null,
      PHONE: updateData.PHONE,
      BIRTH_DATE: updateData.BIRTH_DATE
        ? new Date(updateData.BIRTH_DATE)
        : null,
      POSITION_ID: updateData.POSITION_ID
    })
  }

  async findById(id) {
    return await super.FindById(id, 'EMPLOYEE_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'EMPLOYEE_ID')
  }
}

export const employeesModel = new EmployeesModel()

