import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

export const employeesAPI = {
  // GET list
  getLists: async (params) => {
    const res = await axios.get(`${ROOT_DOMAIN}/employees`, { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/employees/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/employees/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/employees/delete/${payload}`)
    return res.data
  }
}