import ModelCore from '../core/model.core.js'

class CompanyModel extends ModelCore {
  constructor() {
    super('cOMPANY', 'COMPANY_ID')
  }

  async listAll() {
    return await super.ListAll()
  }

  async create(data) {
    return await this.model.create({
      data: {
        COMPANY_NAME: data.COMPANY_NAME,
        STATUS: data.STATUS
      }
    })
  }

  async findByName(name) {
    return await this.model.findFirst({
      where: { COMPANY_NAME: name }
    })
  }

  async updateById(id, updateData) {
    return await this.model.update({
      where: { COMPANY_ID: id },
      data: updateData
    })
  }

  async findById(id) {
    return await this.FindById(id, 'COMPANY_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'COMPANY_ID')
  }
}

export const companyModel = new CompanyModel()

