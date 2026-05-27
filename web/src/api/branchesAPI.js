import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend Branch keys
export const mapBranchToFE = (branch) => {
  if (!branch) return null
  return {
    BRANCH_ID: branch.id, // map UUID to BRANCH_ID
    BRANCH_CODE: branch.branchCode,
    BRANCH_NAME: branch.branchName,
    LOCATION: branch.location,
    STATUS: branch.status,
    CREATED_AT: branch.createdAt,
    UPDATED_AT: branch.updatedAt
  }
}

export const branchesAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/branches`)
    return {
      ...res.data,
      data: (res.data.data || []).map(mapBranchToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      branchCode: payload.BRANCH_CODE,
      branchName: payload.BRANCH_NAME,
      location: payload.LOCATION,
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/branches/create`, bePayload)
    return {
      ...res.data,
      data: mapBranchToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.BRANCH_ID,
      branchCode: payload.BRANCH_CODE,
      branchName: payload.BRANCH_NAME,
      location: payload.LOCATION,
      status: payload.STATUS
    }
    const res = await axios.put(`${ROOT_DOMAIN}/branches/update`, bePayload)
    return {
      ...res.data,
      data: mapBranchToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/branches/delete/${payload}`)
    return res.data
  }
}