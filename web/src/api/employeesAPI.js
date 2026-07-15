import axios from 'axios'

export const employeesAPI = {
  // GET list
  getLists: async (params) => {
    const res = await axios.get('/employees', { params })
    return res.data
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post('/employees/create', payload)
    return res.data
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put('/employees/update', payload)
    return res.data
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/employees/delete/${payload}`)
    return res.data
  },

  // IMPORT PREVIEW
  importPreview: async (payload) => {
    const res = await axios.post('/employees/import-preview', payload)
    return res.data
  },

  // IMPORT CONFIRM
  importConfirm: async (payload) => {
    const res = await axios.post('/employees/import-confirm', payload)
    return res.data
  }
}