import { ROOT_DOMAIN } from "@/utils/contants";
import axios from "axios";

  export const positionsAPI = {
    // GET list
    getLists: async () => {
      const res = await axios.get(`${ROOT_DOMAIN}/positions/lists`);
      return res.data;
    },

    // CREATE
    create: async (payload) => {
      const res = await axios.post(`${ROOT_DOMAIN}/positions`, payload);
      return res.data;
    },

    // UPDATE
    update: async ( payload) => {
      const res = await axios.put(`${ROOT_DOMAIN}/positions`, payload);
      return res.data;
    },

    // DELETE
    delete: async (payload) => {
      const res = await axios.delete(`${ROOT_DOMAIN}/positions/${payload}`);
      return res.data;
    },
  };