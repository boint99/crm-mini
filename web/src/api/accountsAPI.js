import { ROOT_DOMAIN } from "@/utils/contants";
import axios from "axios";

export const accountsAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/accounts/lists`);
    return res.data;
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/accounts`, payload);
    return res.data;
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/accounts/`, payload);
    return res.data;
  },

  // RESET PASSWORD
  resetPassword: async (payload) => {
    const res = await axios.patch(`${ROOT_DOMAIN}/accounts/reset-password`, payload);
    return res.data;
  },

  // DELETE
  delete: async (id) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/accounts/${id}`);
    return res.data;
  },
};
