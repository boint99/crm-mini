import BaseModel from '../core/model.core.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('pOSITIONS', 'POSITION_NAME', 'DESCRIPTION')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await this.model.create({
      data: {
        POSITION_NAME: data.POSITION_NAME, // required
        LEVEL: data.LEVEL // required
      }
    })
  }

  async findByName(name) {
    return await this.model.findFirst({
      where: { POSITION_NAME: name }
    })
  }

  async updateById(id, updateData) {
    return await this.model.update({
      where: { POSITION_ID: id },
      data: updateData
    })
  }

  async findById(id) {
    return await this.FindById(id, 'POSITION_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'POSITION_ID')
  }
}

export const positionsModel = new PositionsModel()

