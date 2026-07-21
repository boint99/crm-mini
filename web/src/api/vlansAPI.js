import axios from 'axios'


export const vlansAPI = {
  // GET /api/vlans
  getLists: async (params) => {
    const res = await axios.get('/vlans', { params })
    return res.data
  },

  // POST /api/vlans
  create: async (payload) => {
    const res = await axios.post('/vlans', payload)
    return res.data
  },

  // PUT /api/vlans/:id
  update: async (id, payload) => {
    const res = await axios.put(`/vlans/${id}`, payload)
    return res.data
  },

  // DELETE /api/vlans/:id
  delete: async (id) => {
    const res = await axios.delete(`/vlans/${id}`)
    return res.data
  }
}
