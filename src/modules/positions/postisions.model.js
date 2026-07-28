import BaseModel from '../../model/index.js'
import { PRISMA } from '../../configs/db.config.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('pOSITIONS', 'positionName')
  }

  async lists(options = {}) {
    const { companyId, search, status, page, limit } = options || {}
    const baseWhere = {
      deletedAt: null
    }

    if (companyId) {
      const isUuid = typeof companyId === 'string' && companyId.length === 36 && companyId.includes('-')
      if (isUuid) {
        const company = await PRISMA.cOMPANY.findUnique({
          where: { id: companyId }
        })
        baseWhere.companyId = company ? company.companyId : null
      } else if (!isNaN(Number(companyId))) {
        baseWhere.companyId = Number(companyId)
      }
    }

    if (search && search.trim()) {
      const keywords = search.trim().split(/\s+/)
      const searchConditions = keywords.map(keyword => ({
        OR: [
          { positionName: { contains: keyword, mode: 'insensitive' } },
          { level: { contains: keyword, mode: 'insensitive' } },
          { company: { companyName: { contains: keyword, mode: 'insensitive' } } }
        ]
      }))
      baseWhere.AND = [...(baseWhere.AND || []), ...searchConditions]
    }

    const prismaWhere = {
      ...baseWhere,
      ...(status ? { status } : {})
    }

    const pageNum = page ? Number(page) : undefined
    const limitNum = limit ? Number(limit) : undefined

    const [total, activeTotal, inactiveTotal] = await Promise.all([
      PRISMA.pOSITIONS.count({ where: prismaWhere }),
      PRISMA.pOSITIONS.count({ where: { ...baseWhere, status: 'ENABLE' } }),
      PRISMA.pOSITIONS.count({ where: { ...baseWhere, status: 'DISABLE' } })
    ])

    const findOptions = {
      where: prismaWhere,
      include: {
        company: true
      },
      orderBy: { createdAt: 'desc' }
    }

    if (pageNum !== undefined && limitNum !== undefined) {
      const maxPage = Math.max(1, Math.ceil(total / limitNum))
      const correctedPage = pageNum > maxPage ? maxPage : pageNum
      findOptions.skip = (correctedPage - 1) * limitNum
      findOptions.take = limitNum
    }

    const list = await PRISMA.pOSITIONS.findMany(findOptions)

    return {
      total,
      activeTotal,
      inactiveTotal,
      list
    }
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
