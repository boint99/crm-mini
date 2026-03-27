import BaseModel from '../core/model.core.js'

class EmployeesViettelModel extends BaseModel {
  constructor() {
    super('vIETTEL_EMPLOYEES', 'VIETTEL_ID', 'VIETTEL_CODE', 'VIETTEL_EMAIL', 'STATUS' )
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await super.Create({
      VIETTEL_CODE: data.VIETTEL_CODE,
      VIETTEL_EMAIL: data.VIETTEL_EMAIL ? data.VIETTEL_EMAIL.toLowerCase() : null,
      STATUS: data.STATUS
    })
  }

  async findByName(name) {
    return await super.FindByField(name, 'VIETTEL_CODE')
  }

  async updateById(id, updateData) {
    return await super.Update(id, 'VIETTEL_ID', {
      VIETTEL_CODE: updateData.VIETTEL_CODE,
      VIETTEL_EMAIL: updateData.VIETTEL_EMAIL ? updateData.VIETTEL_EMAIL.toLowerCase() : null,
      STATUS: updateData.STATUS
    })
  }

  async findById(id) {
    return await super.FindById(id, 'VIETTEL_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'VIETTEL_ID')
  }
}

export const employeesViettelModel = new EmployeesViettelModel()

