import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend Organization/Division
export const mapOrgToFE = (org) => {
  if (!org) return null
  return {
    DIVISION_ID: org.id, // map UUID to DIVISION_ID
    DIVISION_CODE: org.orgUnitCode,
    DIVISION_NAME: org.unitName,
    UNIT_TYPE: org.unitType,
    COMPANY_ID: org.company?.id || null, // Map related company UUID
    COMPANY: org.company ? {
      COMPANY_ID: org.company.id,
      COMPANY_NAME: org.company.companyName,
      COMPANY_CODE: org.company.companyName // fallback
    } : null,
    BRANCH: org.branch ? {
      BRANCH_ID: org.branch.id,
      BRANCH_NAME: org.branch.branchName
    } : null,
    PARENT_UNIT: org.parentUnit ? {
      DIVISION_ID: org.parentUnit.id,
      DIVISION_NAME: org.parentUnit.unitName
    } : null,
    STATUS: org.status,
    CREATED_AT: org.createdAt,
    UPDATED_AT: org.updatedAt
  }
}

export const divisionsAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/organizations`)
    return {
      ...res.data,
      data: (res.data.data || []).map(mapOrgToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      orgUnitCode: payload.DIVISION_CODE,
      unitName: payload.DIVISION_NAME,
      unitType: payload.UNIT_TYPE || 'DIVISION',
      companyId: payload.COMPANY_ID || null, // expects UUID
      branchId: payload.BRANCH_ID || null, // expects UUID
      parentUnitId: payload.PARENT_UNIT_ID || null, // expects UUID
      status: payload.STATUS
    }
    const res = await axios.post(`${ROOT_DOMAIN}/organizations/create`, bePayload)
    return {
      ...res.data,
      data: mapOrgToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.DIVISION_ID,
      orgUnitCode: payload.DIVISION_CODE,
      unitName: payload.DIVISION_NAME,
      unitType: payload.UNIT_TYPE || 'DIVISION',
      companyId: payload.COMPANY_ID || null, // expects UUID
      branchId: payload.BRANCH_ID || null, // expects UUID
      parentUnitId: payload.PARENT_UNIT_ID || null, // expects UUID
      status: payload.STATUS
    }
    const res = await axios.put(`${ROOT_DOMAIN}/organizations/update`, bePayload)
    return {
      ...res.data,
      data: mapOrgToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/organizations/delete/${payload}`)
    return res.data
  }
}