import { PRISMA } from '../configs/db.config.js'
import BaseModel from '../core/model.core.js'

class EmployeesViettelModel extends BaseModel {
  constructor() {
    super('vIETTEL_EMPLOYEES', 'VIETTEL_ID', 'VIETTEL_CODE', 'VIETTEL_EMAIL', 'STATUS' )
  }

  async lists() {
    return await PRISMA.vIETTEL_EMPLOYEES.findMany({
      orderBy: { VIETTEL_ID: 'asc' },
      include: {
        EMPLOYEES: true
      }
    })
  }

  async create(data) {
    return await super.CREATE({
      VIETTEL_CODE: data.VIETTEL_CODE,
      VIETTEL_EMAIL: data.VIETTEL_EMAIL ? data.VIETTEL_EMAIL.toLowerCase() : `${data.VIETTEL_CODE.toLowerCase()}@os.viettel.com.vn`,
      STATUS: data.STATUS
    })
  }

  async findByName(name, field = 'VIETTEL_CODE') {
    return await super.FINDBYFIELD(name, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'VIETTEL_ID', {
      VIETTEL_CODE: updateData.VIETTEL_CODE,
      VIETTEL_EMAIL: updateData.VIETTEL_EMAIL ? updateData.VIETTEL_EMAIL.toLowerCase() : `${updateData.VIETTEL_CODE.toLowerCase()}@os.viettel.com.vn`,
      STATUS: updateData.STATUS
    })
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'VIETTEL_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'VIETTEL_ID')
  }
}

export const employeesViettelModel = new EmployeesViettelModel()

