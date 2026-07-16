import axios from 'axios'


export const vlansAPI = {
  // GET list
  getLists: async (params) => {
    const res = await axios.get('/networks/vlan', { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post('/networks/vlan/create', payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put('/networks/vlan/update', payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/networks/vlan/delete/${payload}`)
    return res.data
  }
}
