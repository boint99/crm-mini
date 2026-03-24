import BaseModel from './BaseModel.js'

class BranchesModel extends BaseModel {
  constructor() {
    super('bRANCHES', 'BRANCH_NAME', 'LOCATION')
  }

  async lists() {
    return await super.ListAll()
  }

  async create(data) {
    return await this.model.create({
      data: {
        BRANCH_NAME: data.BRANCH_NAME // required
      }
    })
  }

  async findByName(name) {
    return await this.model.findFirst({
      where: { BRANCH_NAME: name }
    })
  }

  async updateById(id, updateData) {
    return await this.model.update({
      where: { BRANCH_ID: id },
      data: updateData
    })
  }

  async findById(id) {
    return await this.FindById(id, 'BRANCH_ID')
  }

  async deleteById(id) {
    return await super.DeleteById(id, 'BRANCH_ID')
  }
}

export const branchesModel = new BranchesModel()

