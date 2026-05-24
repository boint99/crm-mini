import BaseModel from '../../model/index.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('pOSITIONS', 'positionName')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'id', updateData)
  }

  async findByUnique(id, field = 'id') {
    return await super.FINDBYUNIQUE(id, field)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'id')
  }
}

export const positionsModel = new PositionsModel()
