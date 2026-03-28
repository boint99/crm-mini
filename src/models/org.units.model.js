import ModelCore from '../core/model.core.js'

class OrgUnitsModel extends ModelCore {
  constructor() {
    super('ORG_UNITS', 'UNIT_NAME')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'UNIT_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'UNIT_CODE')
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'ORG_UNIT_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'ORG_UNIT_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'ORG_UNIT_ID')
  }
}

export const orgUnitsModel = new OrgUnitsModel()

