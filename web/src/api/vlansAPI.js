import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend VLAN keys
export const mapVlanToFE = (vlan) => {
  if (!vlan) return null
  return {
    VLAN_ID: vlan.id,
    VLAN_CODE: vlan.vlanId,
    VLAN_NAME: vlan.vlanName,
    NETWORK: vlan.network,
    DEFAULT_GATEWAY: vlan.defaultGateway,
    SUBNET_MASK: vlan.subnetMask,
    IP_RANGE: vlan.ipRange,
    STATUS: vlan.status,
    CREATED_AT: vlan.createdAt,
    UPDATED_AT: vlan.updatedAt
  }
}

export const vlansAPI = {
  // GET list
  getLists: async (params) => {
    const res = await axios.get(`${ROOT_DOMAIN}/networks/vlan`, { params })
    return {
      ...res.data,
      data: (res.data.data || []).map(mapVlanToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      vlanId: payload.VLAN_ID,
      vlanName: payload.VLAN_NAME,
      network: payload.NETWORK,
      defaultGateway: payload.DEFAULT_GATEWAY,
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/networks/vlan/create`, bePayload)
    return {
      ...res.data,
      data: mapVlanToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.VLAN_ID,
      vlanId: Number(payload.VLAN_CODE),
      vlanName: payload.VLAN_NAME,
      network: payload.NETWORK,
      defaultGateway: payload.DEFAULT_GATEWAY,
      status: payload.STATUS
    }
    const res = await axios.put(`${ROOT_DOMAIN}/networks/vlan/update`, bePayload)
    return {
      ...res.data,
      data: mapVlanToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/networks/vlan/delete/${payload}`)
    return res.data
  }
}
