import ModelCore from '../core/model.core.js'

const buildTreeInclude = (depth) => {
  if (depth <= 0) return undefined
  return {
    CHILD_UNITS: {
      orderBy: { UNIT_NAME: 'asc' },
      include: buildTreeInclude(depth - 1)
    }
  }
}

class OrgUnitsModel extends ModelCore {
  constructor() {
    super('ORG_UNITS', 'UNIT_NAME')
  }

  async lists() {
    return await super.LISTALL()
  }

  async listTree(depth = 5) {
    const safeDepth = Number.isInteger(depth) && depth > 0 ? depth : 5

    return await super.LISTQUERY({
      where: { PARENT_UNIT_ID: null },
      orderBy: { UNIT_NAME: 'asc' },
      include: buildTreeInclude(safeDepth)
    })
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'UNIT_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'UNIT_CODE')
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'ORG_UNIT_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'ORG_UNIT_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'ORG_UNIT_ID')
  }
}

export const orgUnitsModel = new OrgUnitsModel()

