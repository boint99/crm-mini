import { ROOT_DOMAIN } from '@/utils/contants'
import axios from 'axios'

export const ipsAPI = {
  // GET list
  getLists: async (params = {}) => {
    const res = await axios.get(`${ROOT_DOMAIN}/networks/ipaddress`, { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/networks/ipaddress/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/networks/ipaddress/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/networks/ipaddress/delete/${payload}`)
    return res.data
  }
}
