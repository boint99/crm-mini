import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

// Map backend to frontend Employee keys
export const mapEmployeeToFE = (emp) => {
  if (!emp) return null
  return {
    EMPLOYEE_ID: emp.id, // map UUID to EMPLOYEE_ID
    EMPLOYEE_CODE: emp.employeeCode,
    FIRST_NAME: emp.firstName,
    LAST_NAME: emp.lastName,
    PHONE: emp.phone,
    EMAIL: emp.email,
    BIRTH_DATE: emp.birthDate,
    UNIT_ID: emp.orgUnit?.id || null, // map orgUnit UUID to UNIT_ID
    ORG_UNIT: emp.orgUnit ? {
      ORG_UNIT_ID: emp.orgUnit.id,
      UNIT_NAME: emp.orgUnit.unitName,
      UNIT_CODE: emp.orgUnit.orgUnitCode,
      PARENT_UNIT: emp.orgUnit.parentUnit ? {
        UNIT_ID: emp.orgUnit.parentUnit.id,
        UNIT_NAME: emp.orgUnit.parentUnit.unitName
      } : null
    } : null,
    POSITION_ID: emp.position?.id || null, // map position UUID to POSITION_ID
    POSITION: emp.position ? {
      POSITION_ID: emp.position.id,
      POSITION_NAME: emp.position.positionName,
      LEVEL: emp.position.level
    } : null,
    VIETTEL_ID: emp.viettel?.id || null, // map viettel UUID to VIETTEL_ID
    VIETTEL: emp.viettel ? {
      VIETTEL_ID: emp.viettel.id,
      VIETTEL_CODE: emp.viettel.viettelEmail?.split('@')[0]?.toUpperCase() || '',
      VIETTEL_EMAIL: emp.viettel.viettelEmail
    } : null,
    STATUS: emp.status,
    IS_ACCOUNT: emp.isAccount,
    CREATED_AT: emp.createdAt,
    UPDATED_AT: emp.updatedAt
  }
}

export const employeesAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/employees`)
    return {
      ...res.data,
      data: (res.data.data || []).map(mapEmployeeToFE)
    }
  },

  // CREATE
  create: async (payload) => {
    const bePayload = {
      employeeCode: payload.EMPLOYEE_CODE,
      firstName: payload.FIRST_NAME,
      lastName: payload.LAST_NAME,
      phone: payload.PHONE,
      email: payload.EMAIL,
      birthDate: payload.BIRTH_DATE || null,
      unitId: payload.ORG_UNIT_ID || null, // UUID
      positionId: payload.POSITION_ID || null, // UUID
      viettelId: payload.VIETTEL_ID ? Number(payload.VIETTEL_ID) : null, // Int ID
      status: payload.STATUS,
      isAccount: payload.IS_ACCOUNT || false
    }
    const res = await axios.post(`${ROOT_DOMAIN}/employees/create`, bePayload)
    return {
      ...res.data,
      data: mapEmployeeToFE(res.data.data)
    }
  },

  // UPDATE
  update: async (payload) => {
    const bePayload = {
      id: payload.EMPLOYEE_ID,
      employeeCode: payload.EMPLOYEE_CODE,
      firstName: payload.FIRST_NAME,
      lastName: payload.LAST_NAME,
      phone: payload.PHONE,
      email: payload.EMAIL,
      birthDate: payload.BIRTH_DATE || null,
      unitId: payload.ORG_UNIT_ID || null,
      positionId: payload.POSITION_ID || null,
      viettelId: payload.VIETTEL_ID ? Number(payload.VIETTEL_ID) : null,
      status: payload.STATUS,
      isAccount: payload.IS_ACCOUNT || false
    }
    const res = await axios.put(`${ROOT_DOMAIN}/employees/update`, bePayload)
    return {
      ...res.data,
      data: mapEmployeeToFE(res.data.data)
    }
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/employees/delete/${payload}`)
    return res.data
  }
}