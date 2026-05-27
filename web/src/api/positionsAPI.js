import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend Position keys
export const mapPositionToFE = (pos) => {
  if (!pos) return null
  return {
    POSITION_ID: pos.id, // map UUID to POSITION_ID
    POSITION_NAME: pos.positionName,
    LEVEL: pos.level,
    STATUS: pos.status,
    CREATED_AT: pos.createdAt,
    UPDATED_AT: pos.updatedAt
  }
}

export const positionsAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/positions`)
    return {
      ...res.data,
      data: (res.data.data || []).map(mapPositionToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      positionName: payload.POSITION_NAME,
      level: payload.LEVEL,
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/positions/create`, bePayload)
    return {
      ...res.data,
      data: mapPositionToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.POSITION_ID,
      positionName: payload.POSITION_NAME,
      level: payload.LEVEL,
      status: payload.STATUS
    }
    const res = await axios.put(`${ROOT_DOMAIN}/positions/update`, bePayload)
    return {
      ...res.data,
      data: mapPositionToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/positions/delete/${payload}`)
    return res.data
  }
}