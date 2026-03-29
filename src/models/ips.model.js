import BaseModel from '../core/model.core.js'

class IpsModel extends BaseModel {
  constructor() {
    super('IPS', 'IP_ID'  )
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(name, field) {
    return await super.FINDBYFIELD(name, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'IP_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'IP_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'IP_ID')
  }
}

export const ipsModel = new IpsModel()

