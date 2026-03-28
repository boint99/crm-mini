import BaseModel from '../core/model.core.js'

class BranchesModel extends BaseModel {
  constructor() {
    super('BRANCHES', 'BRANCH_NAME')
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'BRANCH_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'BRANCH_CODE')
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'BRANCH_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'BRANCH_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'BRANCH_ID')
  }

  async UNIQUE_CHECK(fieldValue, fieldName) {
    const existing = await super.FINDBYFIELD(fieldValue, fieldName)
    return !!existing
  }
}

export const branchesModel = new BranchesModel()

