import BaseModel from '../../../model/index.js'

class VlansModel extends BaseModel {
  constructor() {
    super('vLANS', 'vlanName')
  }

  async lists() {
    return await super.LISTALL()
  }


  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field = null) {
    if (field === null) return
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData,field = 'id') {
    return await super.UPDATE(id, field, updateData)
  }

  async findByUnique(id, field = 'id') {
    return await super.FINDBYUNIQUE(id, field)
  }

}

export const vlansModel = new VlansModel()

