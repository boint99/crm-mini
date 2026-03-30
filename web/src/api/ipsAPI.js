import { ROOT_DOMAIN } from "@/utils/contants";
import axios from "axios";

export const ipsAPI = {
  getLists: async () => {
    const res = await axios.get(`${ROOT_DOMAIN}/networks/ipaddress/all`);
    return res.data;
  },
  create: async (payload) => {
    const res = await axios.post(`${ROOT_DOMAIN}/networks/ipaddress/create`, payload);
    return res.data;
  },
  update: async (payload) => {
    const res = await axios.put(`${ROOT_DOMAIN}/networks/ipaddress/update`, payload);
    return res.data;
  },
  delete: async (payload) => {
    const res = await axios.delete(`${ROOT_DOMAIN}/networks/ipaddress/delete/${payload}`);
    return res.data;
  },
};
