import BaseModel from '../../../model/index.js'

class IpsModel extends BaseModel {
  constructor() {
    super('iPS', 'host')
  }

  _mapToUpper(record) {
    if (!record) return null
    return {
      IP_ID: record.ipId,
      HOST: record.host,
      VLAN_ID: record.vlanId,
      DEVICE_TYPE: record.deviceType,
      EMPLOYEE_ID: record.employeeId,
      STATUS: record.status,
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      EMPLOYEE: record.employee ? {
        EMPLOYEE_ID: record.employee.employeeId,
        FIRST_NAME: record.employee.firstName,
        LAST_NAME: record.employee.lastName,
        PHONE: record.employee.phone,
        EMAIL: record.employee.email,
        STATUS: record.employee.status
      } : null,
      VLAN: record.vlan ? {
        VLAN_ID: record.vlan.vlanId,
        VLAN_NAME: record.vlan.vlanName,
        NETWORK: record.vlan.network,
        DEFAULT_GATEWAY: record.vlan.defaultGateway,
        IP_RANGE: record.vlan.ipRange,
        STATUS: record.vlan.status
      } : null
    }
  }

  async lists() {
    const list = await super.LISTALL()
    return list.map(item => this._mapToUpper(item))
  }

  async listQuery(options = {}) {
    const prismaWhere = {}
    if (options.where) {
      if (options.where.VLAN_ID !== undefined) prismaWhere.vlanId = Number(options.where.VLAN_ID)
      if (options.where.EMPLOYEE_ID !== undefined) prismaWhere.employeeId = Number(options.where.EMPLOYEE_ID)
      if (options.where.HOST !== undefined) prismaWhere.host = options.where.HOST
    }

    const prismaInclude = {}
    if (options.include) {
      if (options.include.EMPLOYEE) {
        prismaInclude.employee = {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            status: true
          }
        }
      }
      if (options.include.VLAN) {
        prismaInclude.vlan = {
          select: {
            vlanId: true,
            vlanName: true,
            network: true,
            defaultGateway: true,
            ipRange: true,
            status: true
          }
        }
      }
    }

    const prismaOrderBy = options.orderBy?.IP_ID ? { ipId: options.orderBy.IP_ID } : undefined

    const list = await super.LISTQUERY({
      where: Object.keys(prismaWhere).length ? prismaWhere : undefined,
      include: Object.keys(prismaInclude).length ? prismaInclude : undefined,
      orderBy: prismaOrderBy
    })

    return list.map(item => this._mapToUpper(item))
  }

  async create(data) {
    const record = await super.CREATE({
      host: data.HOST,
      vlanId: Number(data.VLAN_ID),
      deviceType: data.DEVICE_TYPE,
      employeeId: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
      status: data.STATUS || 'INACTIVE'
    })
    return this._mapToUpper(record)
  }

  async findByField(value, field) {
    let prismaField = field
    if (field === 'HOST') prismaField = 'host'
    if (field === 'EMPLOYEE_ID') prismaField = 'employeeId'
    if (field === 'VLAN_ID') prismaField = 'vlanId'
    const record = await super.FINDBYFIELD(value, prismaField)
    return this._mapToUpper(record)
  }

  async updateById(id, updateData) {
    const prismaData = {}
    if (updateData.HOST !== undefined) prismaData.host = updateData.HOST
    if (updateData.VLAN_ID !== undefined) prismaData.vlanId = Number(updateData.VLAN_ID)
    if (updateData.DEVICE_TYPE !== undefined) prismaData.deviceType = updateData.DEVICE_TYPE
    if (updateData.EMPLOYEE_ID !== undefined) prismaData.employeeId = updateData.EMPLOYEE_ID ? Number(updateData.EMPLOYEE_ID) : null
    if (updateData.STATUS !== undefined) prismaData.status = updateData.STATUS

    const record = await super.UPDATE(id, 'ipId', prismaData)
    return this._mapToUpper(record)
  }

  async findById(id) {
    const record = await super.FINDBYUNIQUE(id, 'ipId')
    return this._mapToUpper(record)
  }

  async deleteById(id) {
    const record = await super.DELETEBYID(id, 'ipId')
    return this._mapToUpper(record)
  }
}

export const ipsModel = new IpsModel()

