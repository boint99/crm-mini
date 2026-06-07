import axios from 'axios'



export const branchesAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`/branches`)
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/branches/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/branches/update`, payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/branches/delete/${payload}`)
    return res.data
  }
}