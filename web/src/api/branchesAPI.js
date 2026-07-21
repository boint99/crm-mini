import axios from 'axios'


export const branchesAPI = {
  // GET /api/branches
  getLists: async () => {
    const res = await axios.get('/branches')
    return res.data
  },

  // POST /api/branches
  create: async (payload) => {
    const res = await axios.post('/branches', payload)
    return res.data
  },

  // PUT /api/branches/:id
  update: async (id, payload) => {
    const res = await axios.put(`/branches/${id}`, payload)
    return res.data
  },

  // DELETE /api/branches/:id
  delete: async (id) => {
    const res = await axios.delete(`/branches/${id}`)
    return res.data
  }
}