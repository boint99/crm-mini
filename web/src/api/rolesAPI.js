import axios from 'axios'

export const rolesAPI = {
  getLists: async () => {
    const res = await axios.get('/roles/')
    return res.data
  },
  create: async (payload) => {
    const res = await axios.post('/roles/create', payload)
    return res.data
  },
  update: async (payload) => {
    const res = await axios.put('/roles/update', payload)
    return res.data
  },
  delete: async (id) => {
    const res = await axios.delete(`/roles/delete/${id}`)
    return res.data
  },
  getPermissions: async (id) => {
    const res = await axios.get(`/roles/${id}/permissions`)
    return res.data
  },
  assignPermissions: async (id, perIds) => {
    const res = await axios.post(`/roles/${id}/permissions`, { perIds })
    return res.data
  }
}
