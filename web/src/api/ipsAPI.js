import axios from 'axios'

export const ipsAPI = {
  // GET list
  getLists: async (params = {}) => {
    const res = await axios.get(`/networks/ipaddress`, { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/networks/ipaddress/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/networks/ipaddress/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/networks/ipaddress/delete/${payload}`)
    return res.data
  }
}
