import axios from 'axios'

export const employeesAPI = {
  // GET /api/employees
  getLists: async (params) => {
    const res = await axios.get('/employees', { params })
    return res.data
  },

  // POST /api/employees
  create: async (payload) => {
    const res = await axios.post('/employees', payload)
    return res.data
  },

  // PUT /api/employees/:id
  update: async (id, payload) => {
    const res = await axios.put(`/employees/${id}`, payload)
    return res.data
  },

  // DELETE /api/employees/:id
  delete: async (id) => {
    const res = await axios.delete(`/employees/${id}`)
    return res.data
  },

  // Action: Import preview
  importPreview: async (payload) => {
    const res = await axios.post('/employees/import-preview', payload)
    return res.data
  },

  // Action: Import confirm
  importConfirm: async (payload) => {
    const res = await axios.post('/employees/import-confirm', payload)
    return res.data
  }
}