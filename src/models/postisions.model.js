import BaseModel from '../core/model.core.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('POSITIONS', 'POSITION_NAME')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'POSITION_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'POSITION_CODE')
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'POSITION_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'POSITION_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'POSITION_ID')
  }
}

export const positionsModel = new PositionsModel()

