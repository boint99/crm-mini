import axios from 'axios'

export const permissionsAPI = {
  getLists: async () => {
    const res = await axios.get('/permissions/')
    return res.data
  },
  create: async (payload) => {
    const res = await axios.post('/permissions/create', payload)
    return res.data
  },
  update: async (payload) => {
    const res = await axios.put('/permissions/update', payload)
    return res.data
  },
  delete: async (id) => {
    const res = await axios.delete(`/permissions/delete/${id}`)
    return res.data
  }
}
