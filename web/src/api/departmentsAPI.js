import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'


export const departmentsAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/organizations`)
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/organizations/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/organizations/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/organizations/delete/${payload}`)
    return res.data
  }
}