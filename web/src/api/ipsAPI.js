import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend IP keys
export const mapIpToFE = (ipRecord) => {
  if (!ipRecord) return null
  return {
    IP_ID: ipRecord.id, // map UUID to IP_ID
    HOST: ipRecord.host,
    DEVICE_TYPE: ipRecord.deviceType,
    STATUS: ipRecord.status,
    EMPLOYEE: ipRecord.employee ? {
      EMPLOYEE_ID: ipRecord.employee.id,
      EMPLOYEE_CODE: ipRecord.employee.employeeCode,
      FIRST_NAME: ipRecord.employee.firstName,
      LAST_NAME: ipRecord.employee.lastName
    } : null,
    VLAN_ID: ipRecord.vlanId,
    CREATED_AT: ipRecord.createdAt,
    UPDATED_AT: ipRecord.updatedAt
  }
}

export const ipsAPI = {
  // GET list
  getLists: async (params = {}) => {
    const res = await axios.get(`${ROOT_DOMAIN}/networks/ipaddress`, { params })
    return {
      ...res.data,
      data: (res.data.data || []).map(mapIpToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      host: payload.HOST,
      vlanId: payload.VLAN_ID,
      deviceType: payload.DEVICE_TYPE || null,
      employeeCode: payload.EMPLOYEE_CODE || null,
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/networks/ipaddress/create`, bePayload)
    return {
      ...res.data,
      data: mapIpToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.IP_ID,
      host: payload.HOST,
      vlanId: payload.VLAN_ID,
      deviceType: payload.DEVICE_TYPE || null,
      employeeCode: payload.EMPLOYEE_CODE || null,
      status: payload.STATUS
    }
    const res = await axios.put(`${ROOT_DOMAIN}/networks/ipaddress/update`, bePayload)
    return {
      ...res.data,
      data: mapIpToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/networks/ipaddress/delete/${payload}`)
    return res.data
  }
}
