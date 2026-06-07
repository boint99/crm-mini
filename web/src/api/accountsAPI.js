import axios from 'axios'

export const accountsAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`/accounts/`)
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/accounts/create`, payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/accounts/update`, payload)
    return res.data
  },

  // RESET PASSWORD
  resetPassword: async (payload) => {
    const res = await axios.patch(`/accounts/reset-password`, payload)
    return res.data
  },

  // DELETE
  delete: async (id) => {
    const res = await axios.delete(`/accounts/delete/${id}`)
    return res.data
  }
}

