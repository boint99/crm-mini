import BaseModel from '../../model/index.js'
import { PRISMA } from '../../configs/db.config.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('pOSITIONS', 'positionName')
  }

  async lists(where = null) {
    const prismaWhere = {
      deletedAt: null
    }
    if (where) {
      if (where.companyId !== undefined) {
        if (where.companyId) {
          // If companyId is a UUID string, look up the company record to find its internal integer ID
          const company = await PRISMA.cOMPANY.findUnique({
            where: { id: where.companyId }
          })
          prismaWhere.companyId = company ? company.companyId : null
        } else {
          prismaWhere.companyId = null
        }
      }
    }
    return await PRISMA.pOSITIONS.findMany({
      where: prismaWhere,
      include: {
        company: true
      }
    })
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
