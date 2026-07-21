import axios from 'axios'


export const departmentsAPI = {
  // GET /api/organizations
  getLists: async (params) => {
    const res = await axios.get('/organizations', { params })
    return res.data
  },

  // POST /api/organizations
  create: async (payload) => {
    const res = await axios.post('/organizations', payload)
    return res.data
  },

  // PUT /api/organizations/:id
  update: async (id, payload) => {
    const res = await axios.put(`/organizations/${id}`, payload)
    return res.data
  },

  // DELETE /api/organizations/:id
  delete: async (id) => {
    const res = await axios.delete(`/organizations/${id}`)
    return res.data
  }
}