import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend Company keys
export const mapCompanyToFE = (company) => {
  if (!company) return null
  return {
    COMPANY_ID: company.id, // map UUID to COMPANY_ID
    COMPANY_NAME: company.companyName,
    STATUS: company.status,
    CREATED_AT: company.createdAt,
    UPDATED_AT: company.updatedAt
  }
}

export const companiesAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/company`)
    return {
      ...res.data,
      data: (res.data.data || []).map(mapCompanyToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      companyName: payload.COMPANY_NAME,
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/company/create`, bePayload)
    return {
      ...res.data,
      data: mapCompanyToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.COMPANY_ID,
      companyName: payload.COMPANY_NAME,
      STATUS: payload.STATUS // Note: backend service uses STATUS in update
    }
    const res = await axios.put(`${ROOT_DOMAIN}/company/update`, bePayload)
    return {
      ...res.data,
      data: mapCompanyToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/company/delete/${payload}`)
    return res.data
  }
}