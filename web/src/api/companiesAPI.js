import axios from 'axios'


export const companiesAPI = {
  // GET /api/companies
  getLists: async () => {
    const res = await axios.get('/companies')
    return res.data
  },

  // POST /api/companies
  create: async (payload) => {
    const res = await axios.post('/companies', payload)
    return res.data
  },

  // PUT /api/companies/:id
  update: async (id, payload) => {
    const res = await axios.put(`/companies/${id}`, payload)
    return res.data
  },

  // DELETE /api/companies/:id
  delete: async (id) => {
    const res = await axios.delete(`/companies/${id}`)
    return res.data
  }
}