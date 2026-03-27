import ModelCore from '../core/model.core.js'


class DivisionModel extends ModelCore {
  constructor() {
    super('DIVISIONS', 'DIVISION_ID')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'DIVISION_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'DIVISION_CODE')
  }

  async updateById(id, data) {
    return await super.UPDATE(id, 'DIVISION_ID', data)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'DIVISION_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'DIVISION_ID')
  }
}

export const divisionModel = new DivisionModel()
