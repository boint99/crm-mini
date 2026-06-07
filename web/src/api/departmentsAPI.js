import axios from 'axios'


export const departmentsAPI = {
  // GET list
  getLists: async (params) => {
    const res = await axios.get(`/organizations`, { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/organizations/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/organizations/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/organizations/delete/${payload}`)
    return res.data
  }
}