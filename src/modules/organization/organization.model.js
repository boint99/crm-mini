import ModelCore from '../../model/index.js'

class OrganizationModel extends ModelCore {
  constructor() {
    super('oRG_UNITS', 'orgUnitId')
  }

  async lists() {
    return await this.model.findMany({
      where: { deletedAt: null },
      include: {
        company: { select: { id: true, companyName: true } },
        branch: { select: { id: true, branchName: true } },
        parentUnit: { select: { id: true, unitName: true } }
      }
    })
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData, field = 'orgUnitId') {
    return await super.UPDATE(id, field, updateData)
  }

  async findByUnique(fieldValue, fieldName = 'orgUnitId') {
    return await super.FINDBYUNIQUE(fieldValue, fieldName)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'orgUnitId')
  }
}

export const organizationModel = new OrganizationModel()
