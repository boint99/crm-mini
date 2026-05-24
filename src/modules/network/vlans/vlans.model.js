import BaseModel from '../../../model/index.js'

class VlansModel extends BaseModel {
  constructor() {
    super('vLANS', 'vlanName')
  }

  _mapToUpper(record) {
    if (!record) return null
    return {
      VLAN_ID: record.vlanId,
      VLAN_NAME: record.vlanName,
      NETWORK: record.network,
      DEFAULT_GATEWAY: record.defaultGateway,
      SUBNET_MASK: record.subnetMask,
      IP_RANGE: record.ipRange,
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
    const record = await super.CREATE({
      vlanName: data.VLAN_NAME,
      network: data.NETWORK,
      defaultGateway: data.DEFAULT_GATEWAY,
      subnetMask: data.SUBNET_MASK,
      ipRange: data.IP_RANGE,
      status: data.STATUS || 'ACTIVE'
    })
    return this._mapToUpper(record)
  }

  async findByName(name) {
    const record = await super.FINDBYFIELD(name, 'vlanName')
    return this._mapToUpper(record)
  }

  async findByNetwork(network) {
    const record = await super.FINDBYFIELD(network, 'network')
    return this._mapToUpper(record)
  }

  async findByGateway(gateway) {
    const record = await super.FINDBYFIELD(gateway, 'defaultGateway')
    return this._mapToUpper(record)
  }

  async updateById(id, updateData) {
    const prismaData = {}
    if (updateData.VLAN_NAME !== undefined) prismaData.vlanName = updateData.VLAN_NAME
    if (updateData.NETWORK !== undefined) prismaData.network = updateData.NETWORK
    if (updateData.DEFAULT_GATEWAY !== undefined) prismaData.defaultGateway = updateData.DEFAULT_GATEWAY
    if (updateData.SUBNET_MASK !== undefined) prismaData.subnetMask = updateData.SUBNET_MASK
    if (updateData.IP_RANGE !== undefined) prismaData.ipRange = updateData.IP_RANGE
    if (updateData.STATUS !== undefined) prismaData.status = updateData.STATUS

    const record = await super.UPDATE(id, 'vlanId', prismaData)
    return this._mapToUpper(record)
  }

  async findById(id) {
    const record = await super.FINDBYUNIQUE(id, 'vlanId')
    return this._mapToUpper(record)
  }

  async deleteById(id) {
    const record = await super.DELETEBYID(id, 'vlanId')
    return this._mapToUpper(record)
  }

  async findByUnique(id, field) {
    let prismaField = field
    if (field === 'VLAN_ID') prismaField = 'vlanId'
    const record = await super.FINDBYUNIQUE(id, prismaField)
    return this._mapToUpper(record)
  }
}

export const vlansModel = new VlansModel()

