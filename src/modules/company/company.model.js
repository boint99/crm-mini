import ModelCore from '../../model/index.js'

class CompanyModel extends ModelCore {
  constructor() {
    super('cOMPANY', 'companyId')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async updateById(id, updateData, field = 'companyId') {
    return await super.UPDATE(id, field, updateData)
  }

  async findByField(fieldValue, fieldName = 'companyId') {
    return await super.FINDBYFIELD(fieldValue, fieldName)
  }


  async findByUnique(id, field = null) {
    return await super.FINDBYUNIQUE(id, field)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'companyId')
  }

}

export const companyModel = new CompanyModel()

