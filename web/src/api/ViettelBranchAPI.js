import { ROOT_DOMAIN } from "@/utils/contants";
import axios from "axios";

export const ViettelBranchAPI = {
  // GET list
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/viettel-branches/`);
    return res.data;
  },

  // CREATE
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/viettel-branches/create`, payload);
    return res.data;
  },

  // UPDATE
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/viettel-branches/update`, payload);
    return res.data;
  },

  // DELETE
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/viettel-branches/${payload}`);
    return res.data;
  },
};
