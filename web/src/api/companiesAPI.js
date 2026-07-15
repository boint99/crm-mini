import axios from 'axios'


export const companiesAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get('/company')
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post('/company/create', payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put('/company/update', payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/company/delete/${payload}`)
    return res.data
  }
}