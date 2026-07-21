import axios from 'axios'

export const rolesAPI = {
  // GET /api/roles
  getLists: async () => {
    const res = await axios.get('/roles')
    return res.data
  },

  // POST /api/roles
  create: async (payload) => {
    const res = await axios.post('/roles', payload)
    return res.data
  },

  // PUT /api/roles/:id
  update: async (id, payload) => {
    const res = await axios.put(`/roles/${id}`, payload)
    return res.data
  },

  // DELETE /api/roles/:id
  delete: async (id) => {
    const res = await axios.delete(`/roles/${id}`)
    return res.data
  },

  // GET /api/roles/:id/permissions
  getPermissions: async (id) => {
    const res = await axios.get(`/roles/${id}/permissions`)
    return res.data
  },

  // POST /api/roles/:id/permissions
  assignPermissions: async (id, perIds) => {
    const res = await axios.post(`/roles/${id}/permissions`, { perIds })
    return res.data
  }
}
