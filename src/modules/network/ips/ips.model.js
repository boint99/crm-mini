import BaseModel from '../../../model/index.js'

class IpsModel extends BaseModel {
  constructor() {
    super('iPS', 'host')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listQuery(options = {}) {
    return await super.LISTQUERY(options)
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field = null) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'ipId', updateData)
  }


  async findByUnique(id, field = 'id') {
    return await super.FINDBYUNIQUE(id, field)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'ipId')
  }
}

export const ipsModel = new IpsModel()

