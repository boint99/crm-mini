import axios from 'axios'


export const positionsAPI = {
  // GET /api/positions
  getLists: async (params) => {
    const res = await axios.get('/positions', { params })
    return res.data
  },

  // POST /api/positions
  create: async (payload) => {
    const res = await axios.post('/positions', payload)
    return res.data
  },

  // PUT /api/positions/:id
  update: async (id, payload) => {
    const res = await axios.put(`/positions/${id}`, payload)
    return res.data
  },

  // DELETE /api/positions/:id
  delete: async (id) => {
    const res = await axios.delete(`/positions/${id}`)
    return res.data
  },

  // Action: Import preview
  importPreview: async (payload) => {
    const res = await axios.post('/positions/import-preview', payload)
    return res.data
  },

  // Action: Import confirm
  importConfirm: async (payload) => {
    const res = await axios.post('/positions/import-confirm', payload)
    return res.data
  }
}