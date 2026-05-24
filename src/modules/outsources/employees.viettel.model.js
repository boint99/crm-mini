import { PRISMA } from '../../configs/db.config.js'
import BaseModel from '../../model/index.js'

class EmployeesViettelModel extends BaseModel {
  constructor() {
    super('vIETTEL_EMPLOYEES', 'viettelEmail')
  }

  _mapToUpper(record) {
    if (!record) return null
    const viettelCode = record.viettelEmail?.split('@')[0]?.toUpperCase() || ''
    return {
      VIETTEL_ID: record.viettelId,
      VIETTEL_CODE: viettelCode,
      VIETTEL_EMAIL: record.viettelEmail,
      STATUS: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt
    }
  }

  async lists() {
    const list = await PRISMA.vIETTEL_EMPLOYEES.findMany({
      orderBy: { viettelId: 'asc' },
      include: {
        employees: true
      }
    })
    return list.map(item => this._mapToUpper(item))
  }

  async create(data) {
    const email = data.VIETTEL_EMAIL ? data.VIETTEL_EMAIL.toLowerCase() : `${data.VIETTEL_CODE.toLowerCase()}@os.viettel.com.vn`
    const record = await super.CREATE({
      viettelEmail: email,
      status: data.STATUS || 'ENABLE'
    })
    return this._mapToUpper(record)
  }

  async findByName(name, field = 'VIETTEL_CODE') {
    let email = name
    if (field === 'VIETTEL_CODE' && !name.includes('@')) {
      email = `${name.toLowerCase()}@os.viettel.com.vn`
    }
    const record = await super.FINDBYFIELD(email.toLowerCase(), 'viettelEmail')
    return this._mapToUpper(record)
  }

  async updateById(id, updateData) {
    const prismaData = {}
    if (updateData.VIETTEL_EMAIL !== undefined) {
      prismaData.viettelEmail = updateData.VIETTEL_EMAIL.toLowerCase()
    } else if (updateData.VIETTEL_CODE !== undefined) {
      prismaData.viettelEmail = `${updateData.VIETTEL_CODE.toLowerCase()}@os.viettel.com.vn`
    }
    if (updateData.STATUS !== undefined) {
      prismaData.status = updateData.STATUS
    }

    const record = await super.UPDATE(id, 'viettelId', prismaData)
    return this._mapToUpper(record)
  }

  async findById(id) {
    const record = await super.FINDBYUNIQUE(id, 'viettelId')
    return this._mapToUpper(record)
  }

  async deleteById(id) {
    const record = await super.DELETEBYID(id, 'viettelId')
    return this._mapToUpper(record)
  }
}

export const employeesViettelModel = new EmployeesViettelModel()

