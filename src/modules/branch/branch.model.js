import BaseModel from '../../model/index.js'

class BranchesModel extends BaseModel {
  constructor() {
    super('bRANCHES', 'branchName')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'branchName')
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

}

export const branchesModel = new BranchesModel()

