import { ROOT_DOMAIN } from "@/utils/contants";
import axios from "axios";

export const vlansAPI = {
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/networks/vlans/lists`,);
    return res.data;
  },
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/networks/vlan/create`, payload);
    return res.data;
  },
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/networks/vlan/update`, payload);
    return res.data;
  },
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/networks/vlan/delete/${payload}`);
    return res.data;
  },
};
