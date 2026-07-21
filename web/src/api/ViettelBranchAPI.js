import axios from 'axios'

export const ViettelBranchAPI = {
  // GET /api/viettel-branches
  getLists: async () => {
    const res = await axios.get('/viettel-branches')
    return res.data
  },

  // POST /api/viettel-branches
  create: async (payload) => {
    const res = await axios.post('/viettel-branches', payload)
    return res.data
  },

  // PUT /api/viettel-branches/:id
  update: async (id, payload) => {
    const res = await axios.put(`/viettel-branches/${id}`, payload)
    return res.data
  },

  // DELETE /api/viettel-branches/:id
  delete: async (id) => {
    const res = await axios.delete(`/viettel-branches/${id}`)
    return res.data
  }
}
