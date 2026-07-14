import axios from 'axios'


export const positionsAPI = {
  getLists: async (params) => {
    const res = await axios.get(`/positions`, { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/positions/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/positions/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/positions/delete/${payload}`)
    return res.data
  }
}