import axios from 'axios'

export const accountRolesAPI = {
  getLists: async () => {
    const res = await axios.get('/account-roles/')
    return res.data
  },
  assign: async (payload) => {
    const res = await axios.post('/account-roles/assign', payload)
    return res.data
  },
  revoke: async (id) => {
    const res = await axios.delete(`/account-roles/revoke/${id}`)
    return res.data
  }
}
