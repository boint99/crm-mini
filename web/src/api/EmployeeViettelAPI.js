import axios from 'axios'

export const EmployeeViettelAPI = {
  // GET /api/viettel-employees
  getLists: async () => {
    const res = await axios.get('/viettel-employees')
    return res.data
  },

  // POST /api/viettel-employees
  create: async (payload) => {
    const res = await axios.post('/viettel-employees', payload)
    return res.data
  },

  // PUT /api/viettel-employees/:id
  update: async (id, payload) => {
    const res = await axios.put(`/viettel-employees/${id}`, payload)
    return res.data
  },

  // DELETE /api/viettel-employees/:id
  delete: async (id) => {
    const res = await axios.delete(`/viettel-employees/${id}`)
    return res.data
  }
}