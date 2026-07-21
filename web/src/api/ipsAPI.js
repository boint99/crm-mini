import axios from 'axios'

export const ipsAPI = {
  // GET /api/ip-addresses
  getLists: async (params = {}) => {
    const res = await axios.get('/ip-addresses', { params })
    return res.data
  },

  // POST /api/ip-addresses
  create: async (payload) => {
    const res = await axios.post('/ip-addresses', payload)
    return res.data
  },

  // PUT /api/ip-addresses/:id
  update: async (id, payload) => {
    const res = await axios.put(`/ip-addresses/${id}`, payload)
    return res.data
  },

  // DELETE /api/ip-addresses/:id
  delete: async (id) => {
    const res = await axios.delete(`/ip-addresses/${id}`)
    return res.data
  }
}
