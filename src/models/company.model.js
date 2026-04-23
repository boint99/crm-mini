import ModelCore from '../core/model.core.js'

class CompanyModel extends ModelCore {
  constructor() {
    super('COMPANY', 'COMPANY_ID')
  }

  async listAll() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async update(id, updateData, field = 'COMPANY_ID') {
    return await super.UPDATE(id, updateData, field)
  }

  async findByUnique(fieldValue, fieldName = 'COMPANY_ID') {
    return await super.FINDBYUNIQUE(fieldValue, fieldName)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'COMPANY_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'COMPANY_CODE')
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'COMPANY_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'COMPANY_ID')
  }
}

export const companyModel = new CompanyModel()

