import axios from "axios";

export const ViettelBranchAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`/viettel-branches/`);
    return res.data;
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`/viettel-branches/create`, payload);
    return res.data;
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`/viettel-branches/update`, payload);
    return res.data;
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`/viettel-branches/${payload}`);
    return res.data;
  },
};
