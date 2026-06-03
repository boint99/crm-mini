import BaseModel from '../../../model/index.js'

class ViettelBranchModel extends BaseModel {
  constructor() {
    super('vIETTEL_BRANCH', 'viettelBranchId')
  }

  async lists() {
    return await this.model.findMany({
      where: { deletedAt: null },
      include: {
        viettelEmployees: {
          where: { deletedAt: null },
          select: {
            id: true,
            viettelId: true,
            viettelCode: true,
            viettelEmail: true,
            viettelPosition: true,
            status: true
          }
        }
      },
      orderBy: { viettelBranchId: 'asc' }
    })
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByUnique(value, field = 'id') {
    return await super.FINDBYUNIQUE(value, field)
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'id', updateData)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'id')
  }
}

export const viettelBranchModel = new ViettelBranchModel()
