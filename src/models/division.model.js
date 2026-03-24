import ModelCore from '../core/model.core.js'


class DivisionModel extends ModelCore {
  constructor() {
    super('dIVISIONS', 'DIVISION_ID', 'DIVISION_NAME', 'COMPANY_ID', 'STATUS')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await super.Create(data)
  }

  async findByName(name) {
    return await super.findByField(name, 'DIVISION_NAME')
  }

  async updateById(id, data) {
    return await super.Update(id, 'DIVISION_ID', data)
  }

  async findById(id) {
    return await super.findByField(id, 'DIVISION_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'DIVISION_ID')
  }
}

export const divisionModel = new DivisionModel()
