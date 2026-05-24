import BaseModel from '../../model/index.js'

class PositionsModel extends BaseModel {
  constructor() {
    super('pOSITIONS', 'positionName')
  }

  _mapToUpper(record) {
    if (!record) return null
    return {
      POSITION_ID: record.positionId,
      POSITION_NAME: record.positionName,
      LEVEL: record.level,
      STATUS: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt
    }
  }

  async lists() {
    const list = await super.LISTALL()
    return list.map(item => this._mapToUpper(item))
  }

  async create(data) {
    const prismaData = {
      positionName: data.POSITION_NAME,
      level: data.LEVEL,
      status: data.STATUS || 'ENABLE'
    }
    const record = await super.CREATE(prismaData)
    return this._mapToUpper(record)
  }

  async findByName(name) {
    const record = await super.FINDBYFIELD(name, 'positionName')
    return this._mapToUpper(record)
  }

  async updateById(id, updateData) {
    const prismaData = {}
    if (updateData.POSITION_NAME !== undefined) prismaData.positionName = updateData.POSITION_NAME
    if (updateData.LEVEL !== undefined) prismaData.level = updateData.LEVEL
    if (updateData.STATUS !== undefined) prismaData.status = updateData.STATUS

    const record = await super.UPDATE(id, 'positionId', prismaData)
    return this._mapToUpper(record)
  }

  async findById(id) {
    const record = await super.FINDBYUNIQUE(id, 'positionId')
    return this._mapToUpper(record)
  }

  async deleteById(id) {
    const record = await super.DELETEBYID(id, 'positionId')
    return this._mapToUpper(record)
  }
}

export const positionsModel = new PositionsModel()

