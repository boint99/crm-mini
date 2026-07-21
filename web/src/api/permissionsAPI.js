import axios from 'axios'

export const permissionsAPI = {
  // GET /api/permissions
  getLists: async () => {
    const res = await axios.get('/permissions')
    return res.data
  },

  // POST /api/permissions
  create: async (payload) => {
    const res = await axios.post('/permissions', payload)
    return res.data
  },

  // PUT /api/permissions/:id
  update: async (id, payload) => {
    const res = await axios.put(`/permissions/${id}`, payload)
    return res.data
  },

  // DELETE /api/permissions/:id
  delete: async (id) => {
    const res = await axios.delete(`/permissions/${id}`)
    return res.data
  }
}
