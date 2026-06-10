import BaseModel from '../../model/index.js'

class PermissionsModel extends BaseModel {
  constructor() {
    super('pERMISSIONS', 'perName')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field, includeDeleted = false) {
    return await super.FINDBYFIELD(value, field, includeDeleted)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'id', updateData)
  }

  async findByUnique(id, field = 'id', includeDeleted = false) {
    return await super.FINDBYUNIQUE(id, field, includeDeleted)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'id')
  }
}

export const permissionsModel = new PermissionsModel()
