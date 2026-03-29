import BaseModel from '../core/model.core.js'

class VlansModel extends BaseModel {
  constructor() {
    super('VLANS', 'VLAN_CODE', 'VLAN_ID', 'VLAN_NAME' )
  }

  async lists() {
    return await super.LISTALL()
  }

  async create(data) {
    return await super.CREATE(data)
  }

  async findByName(name) {
    return await super.FINDBYFIELD(name, 'VLAN_NAME')
  }

  async findByCode(code) {
    return await super.FINDBYFIELD(code, 'VLAN_CODE')
  }

  async findByNetwork(network) {
    return await super.FINDBYFIELD(network, 'NETWORK')
  }

  async findByGateway(gateway) {
    return await super.FINDBYFIELD(gateway, 'DEFAULT_GATEWAY')
  }

  async updateById(id, updateData) {
    return await super.UPDATE(id, 'VLAN_ID', updateData)
  }

  async findById(id) {
    return await super.FINDBYUNIQUE(id, 'VLAN_ID')
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'VLAN_ID')
  }
}

export const vlansModel = new VlansModel()

