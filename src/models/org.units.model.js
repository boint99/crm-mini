import ModelCore from '../core/model.core.js'

class OrgUnitsModel extends ModelCore {
  constructor() {
    super('oRG_UNITS', 'UNIT_NAME', 'UNIT_TYPE', 'DIVISION_ID', 'PARENT_UNIT_ID')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await this.model.create({
      data: {
        UNIT_NAME: data.UNIT_NAME,
        UNIT_TYPE: data.UNIT_TYPE,
        DIVISION_ID: parseInt(data.DIVISION_ID),
        PARENT_UNIT_ID: data.PARENT_UNIT_ID,
        STATUS: data.STATUS
      }
    })
  }

  async findByName(name) {
    return await this.model.findFirst({
      where: { UNIT_NAME: name }
    })
  }

  async updateById(id, updateData) {
    return await this.model.update({
      where: { ORG_UNIT_ID: id },
      data: updateData
    })
  }

  async findById(id) {
    return await this.FindById(id, 'ORG_UNIT_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'ORG_UNIT_ID')
  }
}

export const orgUnitsModel = new OrgUnitsModel()

