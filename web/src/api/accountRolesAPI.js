import axios from 'axios'

export const accountRolesAPI = {
  // GET /api/account-roles
  getLists: async () => {
    const res = await axios.get('/account-roles')
    return res.data
  },

  // POST /api/account-roles
  assign: async (payload) => {
    const res = await axios.post('/account-roles', payload)
    return res.data
  },

  // DELETE /api/account-roles/:id
  revoke: async (id) => {
    const res = await axios.delete(`/account-roles/${id}`)
    return res.data
  }
}
