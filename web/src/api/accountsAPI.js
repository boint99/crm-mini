import axios from 'axios'

export const accountsAPI = {
  // GET /api/accounts
  getLists: async (params = {}) => {
    const res = await axios.get('/accounts', { params })
    return res.data
  },

  // POST /api/accounts
  create: async (payload) => {
    const res = await axios.post('/accounts', payload)
    return res.data
  },

  // PUT /api/accounts/:id
  update: async (id, payload) => {
    const res = await axios.put(`/accounts/${id}`, payload)
    return res.data
  },

  // PATCH /api/accounts/:id/reset-password
  resetPassword: async (id, payload) => {
    const res = await axios.patch(`/accounts/${id}/reset-password`, payload)
    return res.data
  },

  // DELETE /api/accounts/:id
  delete: async (id) => {
    const res = await axios.delete(`/accounts/${id}`)
    return res.data
  }
}
